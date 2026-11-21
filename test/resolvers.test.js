import { beforeEach, describe, expect, it, vi } from 'vitest';

// A fake Jira for one ticket and one search. Each test sets the note, the edit permission,
// the search result and the answers.
const jira = vi.hoisted(() => ({
  property: null,
  canEdit: true,
  putStatus: 200,
  search: { issues: [], isLast: true },
  searchStatus: 200,
  count: 0,
  calls: [],
}));

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
    if (path === '/rest/api/3/search/jql' && method === 'POST') return json(jira.searchStatus, jira.search);
    if (path === '/rest/api/3/search/approximate-count' && method === 'POST') return json(200, { count: jira.count });
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

const { getAtRisk, getNote, saveNote } = await import('../src/resolvers/index.js');
const { isSigned, sign } = await import('../src/lib/signature.js');

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
  Object.assign(jira, {
    property: null,
    canEdit: true,
    putStatus: 200,
    search: { issues: [], isLast: true },
    searchStatus: 200,
    count: 0,
    calls: [],
  });
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

describe('getAtRisk', () => {
  const projectContext = (key) => ({ accountId: 'acc-nurul', extension: { project: { key } } });
  const ticket = (key, summary, assignee, updated, note) => ({
    key,
    fields: { summary, assignee: assignee && { displayName: assignee }, updated },
    properties: note ? { 'stand-note': note } : {},
  });
  const signedNote = (issueKey, savedAt) => {
    const note = { ...aisyahNote, savedAt };
    return { ...note, sig: sign(issueKey, note, 'test-signing-key') };
  };
  // Scenario 1: the three in-progress tickets of Payments, in Malaysia time.
  const scenario1 = [
    ticket('PAY-150', 'Add partial refunds', 'Hafiz Omar', '2026-11-26T11:00:00.000+0800', null),
    ticket('PAY-151', 'Fix the settlement report', 'Aisyah Rahman', '2026-11-26T10:20:00.000+0800', signedNote('PAY-151', '2026-11-26T02:00:00.000Z')),
    ticket('PAY-142', 'Add refund endpoint', 'Aisyah Rahman', '2026-11-26T09:10:00.000+0800', signedNote('PAY-142', '2026-11-24T08:40:00.000Z')),
  ];
  const searchBody = () => JSON.parse(jira.calls.find((call) => call.path === '/rest/api/3/search/jql').body);

  it('gives the tickets at risk, the number checked and the server time', async () => {
    jira.search = { issues: scenario1, isLast: true };
    const result = await getAtRisk({ context: projectContext('PAY') });
    expect(result).toEqual({
      rows: [
        expect.objectContaining({ key: 'PAY-150', assignee: 'Hafiz Omar', gapMs: null }),
        expect.objectContaining({ key: 'PAY-142', assignee: 'Aisyah Rahman', outside: false }),
      ],
      checked: 3,
      inProgress: 3,
      now: '2026-11-26T01:15:00.000Z',
    });
  });

  it('sends no note text to the page', async () => {
    jira.search = { issues: scenario1, isLast: true };
    const result = await getAtRisk({ context: projectContext('PAY') });
    expect(JSON.stringify(result)).not.toContain('idempotency');
  });

  it('searches the in-progress tickets of the project in the context, newest change first, 100 at most', async () => {
    await getAtRisk({ context: projectContext('PAY'), payload: { projectKey: 'OPS' } });
    expect(searchBody()).toEqual({
      jql: 'project = "PAY" AND statusCategory = "In Progress" ORDER BY updated DESC',
      maxResults: 100,
      fields: ['summary', 'assignee', 'updated'],
      properties: ['stand-note'],
    });
  });

  it('getAtRisk gives no rows', async () => {
    jira.search = { issues: [scenario1[1]], isLast: true };
    expect(await getAtRisk({ context: projectContext('PAY') })).toMatchObject({ rows: [], checked: 1, inProgress: 1 });
  });

  it('asks for no count when the search has all the tickets', async () => {
    jira.search = { issues: scenario1, isLast: true };
    await getAtRisk({ context: projectContext('PAY') });
    expect(jira.calls.some((call) => call.path === '/rest/api/3/search/approximate-count')).toBe(false);
  });

  it("getAtRisk checks 100 and gives Jira's count", async () => {
    const issues = Array.from({ length: 100 }, (_, i) =>
      ticket(`OPS-${i + 1}`, `Ticket ${i + 1}`, null, '2026-11-26T01:00:00.000Z', i < 37 ? null : signedNote(`OPS-${i + 1}`, '2026-11-26T00:30:00.000Z'))
    );
    jira.search = { issues, isLast: false, nextPageToken: 'next' };
    jira.count = 240;
    const result = await getAtRisk({ context: projectContext('OPS') });
    expect(result).toMatchObject({ checked: 100, inProgress: 240 });
    expect(result.rows).toHaveLength(37);
    const count = jira.calls.find((call) => call.path === '/rest/api/3/search/approximate-count');
    expect(JSON.parse(count.body)).toEqual({ jql: 'project = "OPS" AND statusCategory = "In Progress" ORDER BY updated DESC' });
  });

  it('never gives fewer in progress than it checked, when the count is low', async () => {
    jira.search = { issues: scenario1, isLast: false };
    jira.count = 2;
    expect((await getAtRisk({ context: projectContext('PAY') })).inProgress).toBe(3);
  });

  it("getAtRisk passes on Jira's refusal", async () => {
    jira.searchStatus = 503;
    await expect(getAtRisk({ context: projectContext('PAY') })).rejects.toThrow();
  });

  it('searches as the user', async () => {
    jira.search = { issues: scenario1, isLast: false };
    await getAtRisk({ context: projectContext('PAY') });
    expect(jira.calls.every((call) => call.as === 'user')).toBe(true);
  });
});
