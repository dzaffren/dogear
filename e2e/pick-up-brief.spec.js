import { test, expect } from '@playwright/test';
import { deleteNote, findOrCreateIssue, getNote, jira, mainAccountId } from './jira.js';
import { openPanel } from './panel.js';

// No test calls the real model (D28). The tests replay the answer of getBrief in the shape
// that Forge's gateway gave on the site, except "too little", which runs the real backend
// and calls no model.

const brief = {
  done: 'Receipt template is merged.',
  next: 'The mail queue worker.',
  watchOut: null,
  code: 'feat/pay-163-receipt',
};
const sourceLine = 'Built by AI from 1 comment and 1 change. Newest comment 2 days ago.';

// The panel calls getBrief through Forge's GraphQL gateway. Answer that one call.
const answerGetBrief = (page, fulfill) =>
  page.route('**/graphql**', (route) => (route.request().postData()?.includes('getBrief') ? fulfill(route) : route.fallback()));

const replay = (page, body) =>
  answerGetBrief(page, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { invokeExtension: { success: true, response: { body }, errors: null } } }),
    })
  );

const buildButton = (page) => page.getByRole('button', { name: 'Build a brief from Jira' });

let receiptKey;
let thinKey;
let mainName;

test.beforeAll(async () => {
  receiptKey = await findOrCreateIssue('PAY', 'Send a receipt email after a refund');
  thinKey = await findOrCreateIssue('SNV', 'Rotate the webhook secret');
  mainName = (await jira('GET', `/rest/api/3/user?accountId=${await mainAccountId()}`)).displayName;
});

test('builds a brief and saves it as the stand note', async ({ page }) => {
  await deleteNote(receiptKey);
  await replay(page, { status: 'brief', brief, sourceLine });
  await openPanel(page, receiptKey);

  await buildButton(page).click();
  await expect(page.getByText('Not a stand note. Check it before you rely on it.')).toBeVisible();
  for (const label of ['Done', 'Next', 'Watch out', 'Code']) await expect(page.getByText(label, { exact: true })).toBeVisible();
  await expect(page.getByText(brief.done, { exact: true })).toBeVisible();
  await expect(page.getByText(brief.next, { exact: true })).toBeVisible();
  await expect(page.getByText('Not known', { exact: true })).toBeVisible();
  await expect(page.getByText(brief.code, { exact: true })).toBeVisible();
  await expect(page.getByText(sourceLine)).toBeVisible();
  expect(await getNote(receiptKey)).toBeNull();

  await page.getByRole('button', { name: 'Use as stand note' }).click();
  await expect(page.getByLabel('Done')).toHaveValue(brief.done);
  await expect(page.getByLabel('Next')).toHaveValue(brief.next);
  await expect(page.getByLabel('Watch out')).toHaveValue('');
  await expect(page.getByLabel('Code')).toHaveValue(brief.code);

  const next = 'Write the mail queue worker, then test it on the sandbox';
  await page.getByLabel('Next').fill(next);
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByText(next, { exact: true })).toBeVisible();
  await expect(page.getByText(`Saved by ${mainName}, just now`)).toBeVisible();
  await expect(page.getByText('Not a stand note. Check it before you rely on it.')).toHaveCount(0);
  await expect(buildButton(page)).toHaveCount(0);
  expect(await getNote(receiptKey)).toMatchObject({ done: brief.done, next, watchOut: '', code: brief.code });
});

test('a brief that answers after the save does not replace the note form', async ({ page }) => {
  await deleteNote(receiptKey);
  let answer;
  const answered = new Promise((resolve) => (answer = resolve));
  await answerGetBrief(page, async (route) => {
    await answered;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { invokeExtension: { success: true, response: { body: { status: 'brief', brief, sourceLine } }, errors: null } },
      }),
    });
  });
  await openPanel(page, receiptKey);

  const done = 'Refund webhook is wired up';
  await page.getByLabel('Done').fill(done);
  await buildButton(page).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText(`Saved by ${mainName}, just now`)).toBeVisible();

  const briefAnswered = page.waitForResponse((response) => response.request().postData()?.includes('getBrief'));
  answer();
  await briefAnswered;
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByLabel('Done')).toHaveValue(done);
  await expect(page.getByText('Not a stand note. Check it before you rely on it.')).toHaveCount(0);
});

test('says when the ticket has too little', async ({ page }) => {
  await deleteNote(thinKey);
  await openPanel(page, thinKey);

  await buildButton(page).click();
  await expect(page.getByText('Jira has too little on this ticket for a brief.')).toBeVisible();
  await expect(buildButton(page)).toHaveCount(0);
});

test('shows the build error', async ({ page }) => {
  await deleteNote(receiptKey);
  await answerGetBrief(page, (route) => route.fulfill({ status: 500, body: '' }));
  await openPanel(page, receiptKey);

  await buildButton(page).click();
  await expect(page.getByText('The brief did not build. Try again.')).toBeVisible();
  await expect(buildButton(page)).toBeVisible();
});

test('shows the limit message', async ({ page }) => {
  await deleteNote(receiptKey);
  await replay(page, { status: 'limit' });
  await openPanel(page, receiptKey);

  await buildButton(page).click();
  await expect(page.getByText('This site built its 50 briefs for today. Try again tomorrow.')).toBeVisible();
  await expect(page.getByText('Not a stand note. Check it before you rely on it.')).toHaveCount(0);
  await expect(buildButton(page)).toBeVisible();
});
