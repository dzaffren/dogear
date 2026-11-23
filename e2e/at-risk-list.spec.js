import { test, expect } from '@playwright/test';
import { deleteNote, findOrCreateIssue, jira, mainAccountId, moveTo, setNote, touch } from './jira.js';

// The tests run on project SNR (D20), where only this file changes the tickets. The main
// account sets the notes through the Jira API, so Dogear did not sign them, and a row
// says "saved outside Dogear". Jira does not let a test set the Updated time, so a note
// that is behind gets a savedAt two days back, and then `touch` changes the ticket.
//
// SNR uses the classic Kanban workflow, which has no In Review status. The current ticket
// stays In Progress, which is in the same status category.

const APP_ID = '62f3c556-f63e-43bf-9033-8c2d41e14c00';
const DEVELOPMENT_ENV_ID = '582ed475-1dbe-49e2-87a9-1aec63bcfceb';
const PAGE = `/jira/software/projects/SNR/apps/${APP_ID}/${DEVELOPMENT_ENV_ID}`;

const DAY = 24 * 60 * 60 * 1000;

const texts = {
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: 'The sandbox rejects amounts over RM 5,000',
  code: 'feat/pay-142-refund',
};

let mainId;
let mainName;
const keys = {};

const noteFrom = (ageMs) => ({ v: 1, ...texts, savedBy: mainId, savedAt: new Date(Date.now() - ageMs).toISOString() });

const assign = (issueKey, accountId) => jira('PUT', `/rest/api/3/issue/${issueKey}/assignee`, { accountId });

const openList = async (page) => {
  await page.goto(PAGE);
  await expect(page.getByRole('heading', { name: 'Dogears', exact: true })).toBeVisible({ timeout: 60_000 });
};

const rowOf = (page, issueKey) => page.getByRole('row').filter({ has: page.getByRole('link', { name: issueKey, exact: true }) });

test.beforeAll(async () => {
  mainId = await mainAccountId();
  mainName = (await jira('GET', `/rest/api/3/user?accountId=${mainId}`)).displayName;
  keys.endpoint = await findOrCreateIssue('SNR', 'Add refund endpoint');
  keys.partial = await findOrCreateIssue('SNR', 'Add partial refunds');
  keys.settlement = await findOrCreateIssue('SNR', 'Fix the settlement report');
  keys.webhooks = await findOrCreateIssue('SNR', 'Add webhook retries');
  keys.sandbox = await findOrCreateIssue('SNR', 'Rotate the sandbox keys');
});

// The tickets of scenario 1. Each test starts from here.
test.beforeEach(async () => {
  await assign(keys.endpoint, null);
  await assign(keys.partial, mainId);

  await moveTo(keys.endpoint, 'In Progress');
  await setNote(keys.endpoint, noteFrom(2 * DAY));
  await touch(keys.endpoint);

  await moveTo(keys.partial, 'In Progress');
  await deleteNote(keys.partial);
  await touch(keys.partial);

  await moveTo(keys.settlement, 'In Progress');
  await setNote(keys.settlement, noteFrom(0));

  await moveTo(keys.webhooks, 'Selected for Development');
  await deleteNote(keys.webhooks);

  await moveTo(keys.sandbox, 'Done');
  await deleteNote(keys.sandbox);
});

test('lists the tickets at risk', async ({ page }) => {
  await openList(page);

  await expect(page.getByText('2 of 3 in-progress tickets are at risk', { exact: true })).toBeVisible();
  const rows = page.getByRole('row');
  await expect(rows).toHaveCount(3);

  const first = rows.nth(1);
  await expect(first.getByRole('link', { name: keys.partial, exact: true })).toBeVisible();
  await expect(first).toContainText('Add partial refunds');
  await expect(first).toContainText(mainName);
  await expect(first).toContainText('No dogear');

  const second = rows.nth(2);
  await expect(second.getByRole('link', { name: keys.endpoint, exact: true })).toBeVisible();
  await expect(second).toContainText('Add refund endpoint');
  await expect(second).toContainText('Unassigned');
  await expect(second).toContainText('Dogear is 2 days behind');
  await expect(second).toContainText('saved outside Dogear');

  for (const key of [keys.settlement, keys.webhooks, keys.sandbox]) await expect(rowOf(page, key)).toHaveCount(0);
});

test('a saved note takes the ticket off the list', async ({ page }) => {
  await openList(page);
  await rowOf(page, keys.partial).getByRole('link', { name: keys.partial, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/browse/${keys.partial}$`));

  await setNote(keys.partial, noteFrom(0));
  await openList(page);

  await expect(page.getByText('1 of 3 in-progress tickets are at risk', { exact: true })).toBeVisible();
  await expect(rowOf(page, keys.endpoint)).toHaveCount(1);
  await expect(rowOf(page, keys.partial)).toHaveCount(0);
});

test('no ticket is at risk', async ({ page }) => {
  await setNote(keys.endpoint, noteFrom(0));
  await setNote(keys.partial, noteFrom(0));
  await openList(page);

  await expect(page.getByText('No ticket is at risk', { exact: true })).toBeVisible();
  await expect(page.getByText('Each of the 3 in-progress tickets has a current dogear.', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('shows the load error', async ({ page }) => {
  // The page calls getAtRisk through Forge's GraphQL gateway. Refuse that one call.
  await page.route('**/graphql**', (route) =>
    route.request().postData()?.includes('getAtRisk') ? route.fulfill({ status: 500, body: '' }) : route.fallback()
  );
  await openList(page);

  await expect(page.getByText('The list did not load. Reload the page.', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByText(/in-progress tickets? (are|is) at risk/)).toHaveCount(0);
});
