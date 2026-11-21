import { beforeEach, describe, expect, it, vi } from 'vitest';

// A fake Jira for one ticket. Each test sets the note, the edit permission and the answers.
const jira = vi.hoisted(() => ({ property: null, canEdit: true, putStatus: 200, calls: [] }));

vi.mock('@forge/api', () => {
  const json = (status, body) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
  const requestJira = (as) => async (path, options = {}) => {
    const method = options.method ?? 'GET';
    jira.calls.push({ as, method, path, body: options.body });
    if (path === '/rest/api/3/issue/PAY-142/properties/stand-note') {
      if (method === 'PUT') {
        if (jira.putStatus < 300) jira.property = JSON.parse(options.body);
        return json(jira.putStatus, {});
      }
      return jira.property ? json(200, { key: 'stand-note', value: jira.property }) : json(404, {});
    }
    if (path === '/rest/api/3/mypermissions?issueKey=PAY-142&permissions=EDIT_ISSUES') {
      return json(200, { permissions: { EDIT_ISSUES: { havePermission: jira.canEdit } } });
    }
    if (path === '/rest/api/3/user?accountId=acc-aisyah') return json(200, { displayName: 'Aisyah Rahman' });
    if (path === '/rest/api/3/user?accountId=acc-hafiz') return json(200, { displayName: 'Hafiz Omar' });
    return json(500, {});
  };
  const route = (strings, ...values) =>
    strings.reduce((out, part, i) => out + part + (i < values.length ? encodeURIComponent(values[i]) : ''), '');
  return {
    default: { asUser: () => ({ requestJira: requestJira('user') }) },
    route,
  };
});

const { getNote, saveNote } = await import('../src/resolvers/index.js');
const { isSigned } = await import('../src/lib/signature.js');

const context = (accountId) => ({ accountId, extension: { issue: { key: 'PAY-142' } } });
const aisyahNote = {
  v: 1,
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: 'The sandbox rejects amounts over RM 5,000',
  code: 'feat/pay-142-refund',
  savedBy: 'acc-aisyah',
  savedAt: '2026-11-24T08:40:00.000Z',
};

beforeEach(() => {
  Object.assign(jira, { property: null, canEdit: true, putStatus: 200, calls: [] });
  vi.useFakeTimers({ now: new Date('2026-11-26T01:15:00.000Z'), toFake: ['Date'] });
  vi.stubEnv('NOTE_SIGNING_KEY', 'test-signing-key');
});

describe('getNote', () => {
  it('returns no note on a ticket with no stand note', async () => {
    expect(await getNote({ context: context('acc-aisyah') })).toEqual({
      note: null,
      savedByName: null,
      canEdit: true,
      now: '2026-11-26T01:15:00.000Z',
    });
  });

  it('returns the note, the name of its author and the server time', async () => {
    jira.property = aisyahNote;
    expect(await getNote({ context: context('acc-hafiz') })).toEqual({
      note: aisyahNote,
      savedByName: 'Aisyah Rahman',
      canEdit: true,
      now: '2026-11-26T01:15:00.000Z',
    });
  });

  it('gives text for each field when the stored note has other types', async () => {
    jira.property = { ...aisyahNote, done: null, code: 42 };
    const { note } = await getNote({ context: context('acc-hafiz') });
    expect(note).toEqual({ ...aisyahNote, done: '', code: '' });
  });

  it('returns no note when the stored note has no text', async () => {
    jira.property = { ...aisyahNote, done: '', next: null, watchOut: 7, code: '' };
    expect((await getNote({ context: context('acc-hafiz') })).note).toBeNull();
  });

  it('passes on via agent, so the panel says an agent saved the note', async () => {
    jira.property = { ...aisyahNote, via: 'agent' };
    expect((await getNote({ context: context('acc-hafiz') })).note.via).toBe('agent');
  });

  it('reads as the user', async () => {
    await getNote({ context: context('acc-hafiz') });
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });

  it('says when the person cannot edit the ticket', async () => {
    jira.property = aisyahNote;
    jira.canEdit = false;
    expect((await getNote({ context: context('acc-meiling') })).canEdit).toBe(false);
  });
});

describe('saveNote', () => {
  const texts = {
    done: 'Endpoint and validation are written ',
    next: 'Add the idempotency check',
    watchOut: 'The sandbox rejects amounts over RM 5,000',
    code: 'feat/pay-142-refund',
  };

  it('writes the cleaned texts with the author and the server time', async () => {
    const result = await saveNote({ payload: texts, context: context('acc-aisyah') });
    expect(jira.property).toEqual({ ...aisyahNote, savedAt: '2026-11-26T01:15:00.000Z', sig: expect.any(String) });
    expect(isSigned('PAY-142', jira.property, 'test-signing-key')).toBe(true);
    expect(result).toEqual({
      note: jira.property,
      savedByName: 'Aisyah Rahman',
      canEdit: true,
      now: '2026-11-26T01:15:00.000Z',
    });
  });

  it('takes the author from the context, not from the browser', async () => {
    await saveNote({ payload: { ...texts, savedBy: 'acc-hafiz', savedAt: '2020-01-01' }, context: context('acc-aisyah') });
    expect(jira.property.savedBy).toBe('acc-aisyah');
    expect(jira.property.savedAt).toBe('2026-11-26T01:15:00.000Z');
  });

  it('replaces the note', async () => {
    jira.property = aisyahNote;
    await saveNote({
      payload: { done: 'Endpoint, validation and idempotency check are written', next: 'Write the tests for partial refunds' },
      context: context('acc-hafiz'),
    });
    expect(jira.property).toMatchObject({
      done: 'Endpoint, validation and idempotency check are written',
      next: 'Write the tests for partial refunds',
      watchOut: '',
      code: '',
      savedBy: 'acc-hafiz',
    });
  });

  it('drops via agent, because a person saved this note in the panel', async () => {
    jira.property = { ...aisyahNote, via: 'agent' };
    await saveNote({ payload: { ...texts, via: 'agent' }, context: context('acc-hafiz') });
    expect(jira.property).not.toHaveProperty('via');
  });

  it('refuses a note with four empty fields', async () => {
    await expect(saveNote({ payload: { done: '  ' }, context: context('acc-aisyah') })).rejects.toThrow();
    expect(jira.calls.some((call) => call.method === 'PUT')).toBe(false);
  });

  it('saveNote refuses a person with no edit permission', async () => {
    jira.property = aisyahNote;
    jira.canEdit = false;
    await expect(saveNote({ payload: texts, context: context('acc-meiling') })).rejects.toThrow();
    expect(jira.property).toBe(aisyahNote);
  });

  it("saveNote passes on Jira's refusal", async () => {
    jira.property = aisyahNote;
    jira.putStatus = 403;
    await expect(saveNote({ payload: texts, context: context('acc-aisyah') })).rejects.toThrow();
    expect(jira.property).toBe(aisyahNote);
  });

  it('writes nothing when the name of the person cannot be read', async () => {
    jira.property = aisyahNote;
    await expect(saveNote({ payload: texts, context: context('acc-unknown') })).rejects.toThrow();
    expect(jira.property).toBe(aisyahNote);
  });

  it('writes as the user', async () => {
    await saveNote({ payload: texts, context: context('acc-aisyah') });
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });
});
