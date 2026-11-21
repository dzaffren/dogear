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
