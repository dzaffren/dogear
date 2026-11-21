import { beforeEach, describe, expect, it, vi } from 'vitest';

// A fake Jira for one ticket, PAY-142. Each test sets the note, the edit permission, the
// consent of the person and the answers.
const jira = vi.hoisted(() => ({
  property: null,
  canEdit: true,
  consent: true,
  putStatus: 200,
  readStatus: 200,
  calls: [],
}));

vi.mock('@forge/api', () => {
  class NeedsAuthenticationError extends Error {}
  const json = (status, body) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
  const requestJira = (as) => async (path, options = {}) => {
    const method = options.method ?? 'GET';
    jira.calls.push({ as, method, path, body: options.body });
    if (!jira.consent) throw new NeedsAuthenticationError('Authentication Required');
    if (path === '/rest/api/3/issue/PAY-142/properties/stand-note' && method === 'PUT') {
      if (jira.putStatus < 300) jira.property = JSON.parse(options.body);
      return json(jira.putStatus, {});
    }
    if (path === '/rest/api/3/issue/PAY-142?fields=summary&properties=stand-note') {
      const properties = jira.property ? { 'stand-note': jira.property } : {};
      return json(jira.readStatus, { key: 'PAY-142', properties, fields: { summary: 'Add refund endpoint' } });
    }
    if (path === '/rest/api/3/mypermissions?issueKey=PAY-142&permissions=EDIT_ISSUES') {
      return json(200, { permissions: { EDIT_ISSUES: { havePermission: jira.canEdit } } });
    }
    if (path === '/rest/api/3/user?accountId=acc-aisyah') return json(200, { displayName: 'Aisyah Rahman' });
    if (path === '/rest/api/3/user?accountId=acc-hafiz') return json(200, { displayName: 'Hafiz Omar' });
    if (path.includes('PAY-999')) return json(404, {});
    return json(500, {});
  };
  const route = (strings, ...values) =>
    strings.reduce((out, part, i) => out + part + (i < values.length ? encodeURIComponent(values[i]) : ''), '');
  return {
    default: { asUser: () => ({ requestJira: requestJira('user') }) },
    route,
    NeedsAuthenticationError,
  };
});

const { getStandNote, saveStandNote } = await import('../src/tools/index.js');

// What Forge passes to a tool function: the inputs, and the caller in `principal`.
const context = (accountId) => ({ principal: { accountId } });

const aisyahTexts = {
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: 'The sandbox rejects amounts over RM 5,000',
  code: 'feat/pay-142-refund',
};
const aisyahNote = {
  v: 1,
  ...aisyahTexts,
  savedBy: 'acc-aisyah',
  savedAt: '2026-11-24T08:40:00.000Z',
  via: 'agent',
};

beforeEach(() => {
  Object.assign(jira, { property: null, canEdit: true, consent: true, putStatus: 200, readStatus: 200, calls: [] });
  vi.useFakeTimers({ now: new Date('2026-11-26T01:15:00.000Z'), toFake: ['Date'] });
});

describe('saveStandNote', () => {
  it('saves the note with the author, the server time and via agent', async () => {
    const reply = await saveStandNote({ issueKey: 'PAY-142', ...aisyahTexts }, context('acc-aisyah'));
    expect(reply).toBe('Saved the stand note on PAY-142.');
    expect(jira.property).toEqual({ ...aisyahNote, savedAt: '2026-11-26T01:15:00.000Z' });
  });

  it('takes the author from Forge, not from the agent', async () => {
    await saveStandNote(
      { issueKey: 'PAY-142', ...aisyahTexts, savedBy: 'acc-hafiz', savedAt: '2020-01-01', via: 'person' },
      context('acc-aisyah')
    );
    expect(jira.property).toMatchObject({ savedBy: 'acc-aisyah', savedAt: '2026-11-26T01:15:00.000Z', via: 'agent' });
  });

  it('writes as the person', async () => {
    await saveStandNote({ issueKey: 'PAY-142', ...aisyahTexts }, context('acc-aisyah'));
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });
});

describe('getStandNote', () => {
  it('gives the note with the saved line and the filled fields', async () => {
    jira.property = aisyahNote;
    expect(await getStandNote({ issueKey: 'PAY-142' }, context('acc-hafiz'))).toBe(
      [
        'Stand note on PAY-142',
        'Saved by Aisyah Rahman through an agent, 2 days ago',
        'Done: Endpoint and validation are written',
        'Next: Add the idempotency check',
        'Watch out: The sandbox rejects amounts over RM 5,000',
        'Code: feat/pay-142-refund',
      ].join('\n')
    );
  });

  it('leaves out empty fields and the agent words for a note that a person saved', async () => {
    jira.property = { ...aisyahNote, watchOut: '', code: '', savedBy: 'acc-hafiz', via: undefined };
    expect(await getStandNote({ issueKey: 'PAY-142' }, context('acc-aisyah'))).toBe(
      [
        'Stand note on PAY-142',
        'Saved by Hafiz Omar, 2 days ago',
        'Done: Endpoint and validation are written',
        'Next: Add the idempotency check',
      ].join('\n')
    );
  });

  it('says when the ticket has no stand note', async () => {
    expect(await getStandNote({ issueKey: 'PAY-142' }, context('acc-hafiz'))).toBe('PAY-142 has no stand note.');
  });

  it('says when Jira has no such ticket for the person', async () => {
    expect(await getStandNote({ issueKey: 'PAY-999' }, context('acc-hafiz'))).toBe(
      'Jira has no ticket PAY-999 that you can see.'
    );
  });

  it('says when Jira fails', async () => {
    jira.readStatus = 503;
    expect(await getStandNote({ issueKey: 'PAY-142' }, context('acc-hafiz'))).toBe(
      'Jira did not answer the read. Try again.'
    );
  });

  it('reads as the person', async () => {
    jira.property = aisyahNote;
    await getStandNote({ issueKey: 'PAY-142' }, context('acc-hafiz'));
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });
});

describe('a second agent carries on', () => {
  it('replaces the whole note, so the fields it does not send are empty', async () => {
    jira.property = aisyahNote;
    const reply = await saveStandNote(
      {
        issueKey: 'PAY-142',
        done: 'Endpoint, validation and idempotency check are written',
        next: 'Write the tests for partial refunds',
      },
      context('acc-hafiz')
    );
    expect(reply).toBe('Saved the stand note on PAY-142.');
    expect(await getStandNote({ issueKey: 'PAY-142' }, context('acc-aisyah'))).toBe(
      [
        'Stand note on PAY-142',
        'Saved by Hafiz Omar through an agent, just now',
        'Done: Endpoint, validation and idempotency check are written',
        'Next: Write the tests for partial refunds',
      ].join('\n')
    );
  });
});
