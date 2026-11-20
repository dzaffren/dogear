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
    default: { asUser: () => ({ requestJira: requestJira('user') }), asApp: () => ({ requestJira: requestJira('app') }) },
    route,
  };
});

const { getNote, saveNote } = await import('../src/resolvers/index.js');
const { tag } = await import('../src/tag.js');

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
    expect(jira.property).toEqual({ ...aisyahNote, savedAt: '2026-11-26T01:15:00.000Z' });
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

  it('writes as the user', async () => {
    await saveNote({ payload: texts, context: context('acc-aisyah') });
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });
});

describe('tag', () => {
  const payload = { extension: { type: 'jira:issueContext', issue: { key: 'PAY-142' } } };

  it('says No note on a ticket with no stand note', async () => {
    expect(await tag(payload)).toEqual({ status: { type: 'lozenge', value: { label: 'No note', type: 'default' } } });
  });

  it('gives the age of the note', async () => {
    jira.property = aisyahNote;
    expect(await tag(payload)).toEqual({ status: { type: 'lozenge', value: { label: '2 days ago', type: 'inprogress' } } });
  });
});
