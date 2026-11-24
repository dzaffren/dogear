import { test, expect } from '@playwright/test';
import { deleteNote, findOrCreateIssue, getNote, jira, mainAccountId, setNote } from './jira.js';
import { sign } from '../src/lib/signature.js';
import { expectReadView, openPanel } from './panel.js';

// The test account in the browser acts as Aisyah, Hafiz or Mei Ling. The main account acts
// through the Jira API where a scenario needs a second person. Both accounts have the same
// display name, so the tests check the author by account ID.

const DAY = 24 * 60 * 60 * 1000;

const aisyahTexts = {
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: 'The sandbox rejects amounts over RM 5,000',
  code: 'feat/pay-142-refund',
};
const hafizTexts = {
  ...aisyahTexts,
  done: 'Endpoint, validation and idempotency check are written',
  next: 'Write the tests for partial refunds',
};

let issueKey;
let viewOnlyIssueKey;
let mainId;
let mainName;

// A note as the panel saves it, signed with the key in .env, which is the same as the Forge
// variable. An unsigned note reads "Saved outside Dogear".
const noteByMainAccount = (key, texts, ageMs) => {
  const note = { v: 1, ...texts, savedBy: mainId, savedAt: new Date(Date.now() - ageMs).toISOString() };
  return { ...note, sig: sign(key, note, process.env.NOTE_SIGNING_KEY) };
};

const testAccountId = async (page) => (await (await page.request.get('/rest/api/3/myself')).json()).accountId;

test.beforeAll(async () => {
  issueKey = await findOrCreateIssue('PAY', 'Add refund endpoint');
  viewOnlyIssueKey = await findOrCreateIssue('SNV', 'Refund report for finance');
  mainId = await mainAccountId();
  mainName = (await jira('GET', `/rest/api/3/user?accountId=${mainId}`)).displayName;
});

test('saves the first note', async ({ page }) => {
  await deleteNote(issueKey);
  await openPanel(page, issueKey);

  await expect(page.getByText('No dogear yet')).toBeVisible();
  const save = page.getByRole('button', { name: 'Save', exact: true });
  await expect(save).toBeDisabled();

  await page.getByLabel('Done').fill(aisyahTexts.done);
  await page.getByLabel('Next').fill(aisyahTexts.next);
  await page.getByLabel('Watch out').fill(aisyahTexts.watchOut);
  await page.getByLabel('Code').fill(aisyahTexts.code);
  await save.click();

  await expectReadView(page, aisyahTexts);
  await expect(page.getByText(`Saved by ${mainName}, just now`)).toBeVisible();
  await expect(page.getByLabel('Done')).toHaveCount(0);
  expect(await getNote(issueKey)).toMatchObject({ ...aisyahTexts, savedBy: await testAccountId(page) });
});

test('shows a note from two days ago', async ({ page }) => {
  await setNote(issueKey, noteByMainAccount(issueKey, aisyahTexts, 2 * DAY));
  await openPanel(page, issueKey);

  await expectReadView(page, aisyahTexts);
  await expect(page.getByText(`Saved by ${mainName}, 2 days ago`)).toBeVisible();
});

test('replaces the note', async ({ page }) => {
  await setNote(issueKey, noteByMainAccount(issueKey, aisyahTexts, 2 * DAY));
  await openPanel(page, issueKey);

  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Done').fill(hafizTexts.done);
  await page.getByLabel('Next').fill(hafizTexts.next);
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expectReadView(page, hafizTexts);
  await expect(page.getByText(`Saved by ${mainName}, just now`)).toBeVisible();
  await expect(page.getByText(aisyahTexts.done, { exact: true })).toHaveCount(0);
  await expect(page.getByText(aisyahTexts.next, { exact: true })).toHaveCount(0);
  expect(await getNote(issueKey)).toMatchObject({ ...hafizTexts, savedBy: await testAccountId(page) });
});

test('a viewer reads and cannot edit', async ({ page }) => {
  // D10: the test account can view tickets in the view-only project, but cannot edit them.
  const permissions = await (
    await page.request.get(`/rest/api/3/mypermissions?issueKey=${viewOnlyIssueKey}&permissions=EDIT_ISSUES,BROWSE_PROJECTS`)
  ).json();
  expect(permissions.permissions.BROWSE_PROJECTS.havePermission).toBe(true);
  expect(permissions.permissions.EDIT_ISSUES.havePermission).toBe(false);

  await setNote(viewOnlyIssueKey, noteByMainAccount(viewOnlyIssueKey, hafizTexts, 3 * 60 * 60 * 1000));
  await openPanel(page, viewOnlyIssueKey);

  await expectReadView(page, hafizTexts);
  await expect(page.getByText(`Saved by ${mainName}`)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
});

test('keeps the text when the save fails', async ({ page }) => {
  const before = noteByMainAccount(issueKey, hafizTexts, 60 * 60 * 1000);
  await setNote(issueKey, before);

  // The panel calls saveNote through Forge's GraphQL gateway. Refuse that one call.
  await page.route('**/graphql**', (route) =>
    route.request().postData()?.includes('saveNote') ? route.fulfill({ status: 500, body: '' }) : route.fallback()
  );

  await openPanel(page, issueKey);
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Next').fill(aisyahTexts.next);
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByText('The dogear was not saved. Try again.')).toBeVisible();
  await expect(page.getByLabel('Next')).toHaveValue(aisyahTexts.next);
  await expect(page.getByLabel('Done')).toHaveValue(hafizTexts.done);
  expect(await getNote(issueKey)).toEqual(before);
});
