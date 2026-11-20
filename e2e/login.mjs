// Saves the login of the e2e test account. Run it when the saved login expires:
// a browser opens, you log in by hand with the test account's email and password,
// and the script saves the session to e2e/.auth/state.json when Jira opens.
import { chromium } from '@playwright/test';

const SITE = 'https://dzaffren.atlassian.net';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`https://id.atlassian.com/login?continue=${encodeURIComponent(`${SITE}/jira`)}`);
console.log('Log in as the test account. Google sign-in does not work here; use the email and password.');

await page.waitForURL((url) => url.origin === SITE, { timeout: 5 * 60 * 1000 });
await page.waitForLoadState('networkidle');
await context.storageState({ path: 'e2e/.auth/state.json' });
console.log('Saved the login to e2e/.auth/state.json.');
await browser.close();
