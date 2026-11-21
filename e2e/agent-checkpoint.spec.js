import { test, expect } from '@playwright/test';
import { deleteNote, findOrCreateIssue, getNote, jira, mainAccountId, setNote } from './jira.js';
import { callTool } from './mcp.js';
import { expectReadView, openPanel } from './panel.js';

// The main account is the person whose agent calls the tools, through the MCP login that
// `npm run e2e:mcp-login` saved. The test account in the browser reads the panel. Both
// accounts have the same display name, so the tests check the author by account ID.

const DAY = 24 * 60 * 60 * 1000;

const aisyahTexts = {
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: 'The sandbox rejects amounts over RM 5,000',
  code: 'feat/pay-142-refund',
};
const hafizTexts = {
  done: 'Endpoint, validation and idempotency check are written',
  next: 'Write the tests for partial refunds',
};

let issueKey;
let noNoteKey;
let mainId;
let mainName;

const agentNote = (texts, ageMs) => ({
  v: 1,
  ...texts,
  savedBy: mainId,
  savedAt: new Date(Date.now() - ageMs).toISOString(),
  via: 'agent',
});

test.beforeAll(async () => {
  issueKey = await findOrCreateIssue('PAY', 'Add refund endpoint');
  noNoteKey = await findOrCreateIssue('PAY', 'Add refund report');
  mainId = await mainAccountId();
  mainName = (await jira('GET', `/rest/api/3/user?accountId=${mainId}`)).displayName;
});

test('an agent saves and the panel shows it', async ({ page }) => {
  await deleteNote(issueKey);

  expect(await callTool('save-stand-note', { issueKey, ...aisyahTexts })).toBe(`Saved the stand note on ${issueKey}.`);

  await openPanel(page, issueKey);
  await expectReadView(page, aisyahTexts);
  await expect(page.getByText(`Saved by ${mainName} through an agent, just now`)).toBeVisible();
  expect(await getNote(issueKey)).toMatchObject({ ...aisyahTexts, savedBy: mainId, via: 'agent' });
});

test('a second agent reads and saves', async ({ page }) => {
  await setNote(issueKey, agentNote(aisyahTexts, 2 * DAY));

  expect(await callTool('get-stand-note', { issueKey })).toBe(
    [
      `Stand note on ${issueKey}`,
      `Saved by ${mainName} through an agent, 2 days ago`,
      `Done: ${aisyahTexts.done}`,
      `Next: ${aisyahTexts.next}`,
      `Watch out: ${aisyahTexts.watchOut}`,
      `Code: ${aisyahTexts.code}`,
    ].join('\n')
  );

  expect(await callTool('save-stand-note', { issueKey, ...hafizTexts })).toBe(`Saved the stand note on ${issueKey}.`);

  await openPanel(page, issueKey);
  await expectReadView(page, hafizTexts);
  await expect(page.getByText(`Saved by ${mainName} through an agent, just now`)).toBeVisible();
  await expect(page.getByText(aisyahTexts.watchOut, { exact: true })).toHaveCount(0);
  expect(await getNote(issueKey)).toMatchObject({ ...hafizTexts, watchOut: '', code: '', via: 'agent' });
});

test('a ticket with no note', async () => {
  await deleteNote(noNoteKey);

  expect(await callTool('get-stand-note', { issueKey: noNoteKey })).toBe(`${noNoteKey} has no stand note.`);
});

test('refuses a long text', async () => {
  const before = agentNote(aisyahTexts, 60 * 60 * 1000);
  await setNote(issueKey, before);

  expect(await callTool('save-stand-note', { issueKey, ...hafizTexts, done: 'a'.repeat(1240) })).toBe(
    'Done has 1,240 characters. The limit is 1,000.'
  );
  expect(await getNote(issueKey)).toEqual(before);
});
