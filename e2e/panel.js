import { expect } from '@playwright/test';

export const panelContent = (page) =>
  page.getByText('No stand note yet').or(page.getByText(/^Saved by /)).or(page.getByLabel('Done')).first();

// Opens the ticket and expands the panel. Jira re-renders the ticket a few seconds after
// it loads and collapses the panel again, so expand until the panel content shows.
export const openPanel = async (page, key) => {
  await page.goto(`/browse/${key}`);
  const header = page.getByRole('button', { name: /^Stand note/ });
  await expect(header).toContainText('Where the work stands');
  await expect(async () => {
    if ((await header.getAttribute('aria-expanded')) === 'true') await header.click();
    await header.click();
    await expect(panelContent(page)).toBeVisible({ timeout: 10_000 });
  }).toPass({ timeout: 90_000 });
};

export const expectReadView = async (page, texts) => {
  for (const text of Object.values(texts)) await expect(page.getByText(text, { exact: true })).toBeVisible();
};
