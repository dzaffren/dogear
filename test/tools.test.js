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

// The tools load the resolver for displayName, and the resolver loads these two. Each needs
// the Forge runtime when it loads. No tool calls them.
vi.mock('@forge/llm', () => ({ chat: vi.fn() }));
vi.mock('@forge/kvs', () => ({ kvs: { get: vi.fn(), set: vi.fn() } }));

const { getDogear, saveDogear } = await import('../src/tools/index.js');
const { isSigned, sign } = await import('../src/lib/signature.js');

const KEY = 'test-signing-key';
const signed = (note) => ({ ...note, sig: sign('PAY-142', note, KEY) });

// What Forge passes to a tool function: the inputs, and the caller in `principal`.
const context = (accountId) => ({ principal: { accountId } });

const aisyahTexts = {
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: 'The sandbox rejects amounts over RM 5,000',
  code: 'feat/pay-142-refund',
};
const aisyahNote = signed({
  v: 1,
  ...aisyahTexts,
  savedBy: 'acc-aisyah',
  savedAt: '2026-11-24T08:40:00.000Z',
  via: 'agent',
});

beforeEach(() => {
  Object.assign(jira, { property: null, canEdit: true, consent: true, putStatus: 200, readStatus: 200, calls: [] });
  vi.useFakeTimers({ now: new Date('2026-11-26T01:15:00.000Z'), toFake: ['Date'] });
  vi.stubEnv('NOTE_SIGNING_KEY', KEY);
});

describe('saveDogear', () => {
  it('saves the note with the author, the server time and via agent', async () => {
    const reply = await saveDogear({ issueKey: 'PAY-142', ...aisyahTexts }, context('acc-aisyah'));
    expect(reply).toBe('Saved the dogear on PAY-142.');
    const { sig, ...note } = aisyahNote;
    expect(jira.property).toEqual(signed({ ...note, savedAt: '2026-11-26T01:15:00.000Z' }));
    expect(isSigned('PAY-142', jira.property, KEY)).toBe(true);
  });

  it('takes the author from Forge, not from the agent', async () => {
    await saveDogear(
      { issueKey: 'PAY-142', ...aisyahTexts, savedBy: 'acc-hafiz', savedAt: '2020-01-01', via: 'person' },
      context('acc-aisyah')
    );
    expect(jira.property).toMatchObject({ savedBy: 'acc-aisyah', savedAt: '2026-11-26T01:15:00.000Z', via: 'agent' });
  });

  it('refuses a text that is too long and names the field', async () => {
    jira.property = aisyahNote;
    const reply = await saveDogear({ issueKey: 'PAY-142', ...aisyahTexts, done: 'a'.repeat(1240) }, context('acc-hafiz'));
    expect(reply).toBe('Done has 1,240 characters. The limit is 1,000.');
    expect(jira.calls).toEqual([]);
  });

  it('names each field that is too long', async () => {
    const reply = await saveDogear(
      { issueKey: 'PAY-142', done: 'a'.repeat(1240), watchOut: 'b'.repeat(1001) },
      context('acc-hafiz')
    );
    expect(reply).toBe(
      'Done has 1,240 characters. The limit is 1,000. Watch out has 1,001 characters. The limit is 1,000.'
    );
  });

  it('refuses a note with four empty fields', async () => {
    const reply = await saveDogear({ issueKey: 'PAY-142', done: '  ' }, context('acc-hafiz'));
    expect(reply).toBe('A dogear needs text in Done, Next, Watch out or Code.');
    expect(jira.calls).toEqual([]);
  });

  it('refuses a person who cannot edit the ticket', async () => {
    jira.property = aisyahNote;
    jira.canEdit = false;
    const reply = await saveDogear({ issueKey: 'PAY-142', ...aisyahTexts }, context('acc-hafiz'));
    expect(reply).toBe('You cannot edit PAY-142, so the dogear was not saved.');
    expect(jira.property).toBe(aisyahNote);
  });

  it('says when Jira has no such ticket for the person', async () => {
    const reply = await saveDogear({ issueKey: 'PAY-999', ...aisyahTexts }, context('acc-hafiz'));
    expect(reply).toBe('Jira has no ticket PAY-999 that you can see.');
  });

  it("says when Jira refuses the write", async () => {
    jira.property = aisyahNote;
    jira.putStatus = 503;
    const reply = await saveDogear({ issueKey: 'PAY-142', ...aisyahTexts }, context('acc-hafiz'));
    expect(reply).toBe('Jira did not answer the save. The dogear was not saved. Try again.');
    expect(jira.property).toBe(aisyahNote);
  });

  it('writes as the person', async () => {
    await saveDogear({ issueKey: 'PAY-142', ...aisyahTexts }, context('acc-aisyah'));
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });
});

describe('getDogear', () => {
  it('gives the note with the saved line and the filled fields', async () => {
    jira.property = aisyahNote;
    expect(await getDogear({ issueKey: 'PAY-142' }, context('acc-hafiz'))).toBe(
      [
        'Dogear on PAY-142',
        'Saved by Aisyah Rahman through an agent, 2 days ago',
        'Done: Endpoint and validation are written',
        'Next: Add the idempotency check',
        'Watch out: The sandbox rejects amounts over RM 5,000',
        'Code: feat/pay-142-refund',
      ].join('\n')
    );
  });

  it('leaves out empty fields and the agent words for a note that a person saved', async () => {
    const { sig, ...note } = aisyahNote;
    jira.property = signed({ ...note, watchOut: '', code: '', savedBy: 'acc-hafiz', via: undefined });
    expect(await getDogear({ issueKey: 'PAY-142' }, context('acc-aisyah'))).toBe(
      [
        'Dogear on PAY-142',
        'Saved by Hafiz Omar, 2 days ago',
        'Done: Endpoint and validation are written',
        'Next: Add the idempotency check',
      ].join('\n')
    );
  });

  it('names no person for a note written outside Dogear', async () => {
    jira.property = { ...aisyahNote, savedBy: 'acc-hafiz' };
    expect(await getDogear({ issueKey: 'PAY-142' }, context('acc-aisyah'))).toBe(
      [
        'Dogear on PAY-142',
        'Saved outside Dogear, 2 days ago',
        'Done: Endpoint and validation are written',
        'Next: Add the idempotency check',
        'Watch out: The sandbox rejects amounts over RM 5,000',
        'Code: feat/pay-142-refund',
      ].join('\n')
    );
    expect(jira.calls.some((call) => call.path.startsWith('/rest/api/3/user'))).toBe(false);
  });

  it('says when the ticket has no dogear', async () => {
    expect(await getDogear({ issueKey: 'PAY-142' }, context('acc-hafiz'))).toBe('PAY-142 has no dogear.');
  });

  it('says when Jira has no such ticket for the person', async () => {
    expect(await getDogear({ issueKey: 'PAY-999' }, context('acc-hafiz'))).toBe(
      'Jira has no ticket PAY-999 that you can see.'
    );
  });

  it('says when Jira fails', async () => {
    jira.readStatus = 503;
    expect(await getDogear({ issueKey: 'PAY-142' }, context('acc-hafiz'))).toBe(
      'Jira did not answer the read. Try again.'
    );
  });

  it('reads as the person', async () => {
    jira.property = aisyahNote;
    await getDogear({ issueKey: 'PAY-142' }, context('acc-hafiz'));
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });
});

describe('a second agent carries on', () => {
  it('replaces the whole note, so the fields it does not send are empty', async () => {
    jira.property = aisyahNote;
    const reply = await saveDogear(
      {
        issueKey: 'PAY-142',
        done: 'Endpoint, validation and idempotency check are written',
        next: 'Write the tests for partial refunds',
      },
      context('acc-hafiz')
    );
    expect(reply).toBe('Saved the dogear on PAY-142.');
    expect(await getDogear({ issueKey: 'PAY-142' }, context('acc-aisyah'))).toBe(
      [
        'Dogear on PAY-142',
        'Saved by Hafiz Omar through an agent, just now',
        'Done: Endpoint, validation and idempotency check are written',
        'Next: Write the tests for partial refunds',
      ].join('\n')
    );
  });
});

describe('a person who did not allow access yet', () => {
  it('save returns the consent text and leaves the note as it was', async () => {
    jira.property = aisyahNote;
    jira.consent = false;
    expect(await saveDogear({ issueKey: 'PAY-142', ...aisyahTexts }, context('acc-meiling'))).toBe(
      'Open the Dogear panel on a Jira ticket once and select Allow access. Then save again.'
    );
    expect(jira.property).toBe(aisyahNote);
  });

  it('read returns the consent text', async () => {
    jira.property = aisyahNote;
    jira.consent = false;
    expect(await getDogear({ issueKey: 'PAY-142' }, context('acc-meiling'))).toBe(
      'Open the Dogear panel on a Jira ticket once and select Allow access. Then read again.'
    );
  });
});
