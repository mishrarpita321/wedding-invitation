import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const baseURL = process.env.TEST_URL || 'http://127.0.0.1:5173';
await mkdir('test-results', { recursive: true });
try {
  for (const width of (process.env.RSVP_WIDTHS ? process.env.RSVP_WIDTHS.split(',').map(Number) : [360, 390, 430, 1440])) {
    const page = await browser.newPage({ viewport: { width, height: 820 }, reducedMotion: width === 430 ? 'reduce' : 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
    const submissions = [];
    const apiRequests = [];
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url()); });
    await page.exposeFunction('__recordRsvp', payload => submissions.push(payload));
    // Test-only instrumentation around the actual 850ms mock; no hooks ship in the application.
    await page.route('**/src/utils/rsvp.ts*', async route => {
      const response = await route.fetch();
      const source = (await response.text()).replace('export async function submitRsvp(', 'async function originalSubmitRsvp(');
      assert.ok(source.includes('async function originalSubmitRsvp('));
      await route.fulfill({ response, body: source + `\nexport async function submitRsvp(payload) {
        await window.__recordRsvp(payload);
        await originalSubmitRsvp(payload);
        if (window.__failRsvpOnce) { window.__failRsvpOnce = false; throw new Error('Test failure'); }
      }` });
    });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Open Arpita/ }).press('Enter');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    const footerCta = page.locator('footer').getByRole('button', { name: 'RSVP', exact: true });
    async function open() { await footerCta.click(); await page.getByRole('dialog').waitFor(); }
    const dialog = page.getByRole('dialog');
    const name = page.getByLabel('Your name', { exact: true });
    const event = label => dialog.getByRole('button', { name: label, exact: true });
    async function finish(attending = true) {
      await expect(dialog.getByRole('heading', { name: attending ? 'RSVP received' : 'Response received' })).toBeVisible();
      assert.equal(await dialog.locator('.rsvp-sparkles').count(), attending && width !== 430 ? 1 : 0);
      if (attending && width !== 430) {
        await expect.poll(() => dialog.locator('.rsvp-sparkles span').first().evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0);
      }
      await dialog.getByRole('button', { name: 'Done' }).click();
      await dialog.waitFor({ state: 'detached' });
      await expect(footerCta).toBeFocused();
      assert.notEqual(await page.locator('body').evaluate(body => getComputedStyle(body).overflow), 'hidden');
    }
    await open();
    assert.equal(await dialog.locator('.rsvp-error').count(), 0);
    await expect(page.getByRole('button', { name: 'Close RSVP' })).toBeFocused();
    assert.equal(await page.locator('body').evaluate(body => getComputedStyle(body).overflow), 'hidden');
    await dialog.getByRole('button', { name: 'Send RSVP', exact: true }).click();
    await expect(name).toBeFocused();
    await expect(page.getByText('Please tell us your name.')).toBeVisible();
    await name.fill('Guest Example');
    await dialog.getByRole('button', { name: 'Send RSVP', exact: true }).click();
    await expect(page.getByText('Choose at least one celebration you’ll be joining.')).toBeVisible();
    await page.getByRole('button', { name: 'Increase number attending' }).click();
    await page.getByRole('button', { name: 'Decrease number attending' }).click();
    await expect(page.getByRole('button', { name: 'Decrease number attending' })).toBeDisabled();
    await page.getByRole('button', { name: 'Increase number attending' }).click();
    await event('Wedding').click();
    await expect(event('Wedding')).toHaveAttribute('aria-pressed', 'true');
    await expect(event('Wedding')).toHaveCSS('background-color', 'rgb(110, 31, 42)');
    assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    await page.screenshot({ path: `test-results/rsvp-${width}.png`, fullPage: false });
    // Reduced height models the space available while a software keyboard is open.
    await page.setViewportSize({ width, height: 480 });
    await name.focus();
    await name.fill('Guest Example');
    await dialog.getByRole('button', { name: 'Send RSVP', exact: true }).scrollIntoViewIfNeeded();
    await expect(dialog.getByRole('button', { name: 'Send RSVP', exact: true })).toBeInViewport();
    assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    await page.setViewportSize({ width, height: 820 });
    const started = Date.now();
    await dialog.getByRole('button', { name: 'Send RSVP', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await page.locator('.rsvp-form').evaluate(form => { for (let i = 0; i < 5; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    await finish();
    assert.ok(Date.now() - started >= 800, 'The mock must leave time to inspect the loading state');
    assert.equal(submissions.length, 1);
    assert.equal(submissions[0].guestCount, 2);
    assert.equal(submissions[0].events.wedding, true);

    await open(); await name.fill('All Celebrations'); await event('Select all').click();
    for (const chip of await dialog.locator('.rsvp-event').all()) await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await dialog.getByRole('button', { name: 'Send RSVP', exact: true }).click(); await finish();
    assert.ok(Object.values(submissions.at(-1).events).every(Boolean));

    await open(); await name.fill('Different Celebrations'); await event('Select all').click(); await event('Clear').click();
    for (const chip of await dialog.locator('.rsvp-event').all()) await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await event('Reception').click();
    await dialog.getByRole('button', { name: 'Send RSVP', exact: true }).click(); await finish();
    assert.deepEqual(Object.entries(submissions.at(-1).events).filter(([, value]) => value).map(([key]) => key), ['reception']);

    await open(); await name.fill('Declining Guest'); await event('Wedding').click();
    await event('Can’t make it this time').click();
    await expect(page.getByRole('button', { name: 'Increase number attending' })).toBeDisabled();
    await expect(event('Wedding')).toHaveAttribute('aria-pressed', 'false');
    await dialog.getByRole('button', { name: 'Send Response' }).click(); await finish(false);
    assert.equal(submissions.at(-1).guestCount, 0);
    assert.equal(submissions.at(-1).status, 'declined');
    assert.ok(Object.values(submissions.at(-1).events).every(value => !value));

    await open(); await name.fill('Retry Guest'); await event('Can’t make it this time').click(); await event('Mehendi').click();
    await expect(event('Can’t make it this time')).toHaveAttribute('aria-pressed', 'false');
    await page.evaluate(() => { window.__failRsvpOnce = true; });
    await dialog.getByRole('button', { name: 'Send RSVP', exact: true }).click();
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(name).toHaveValue('Retry Guest');
    await expect(event('Mehendi')).toHaveAttribute('aria-pressed', 'true');
    const failedPayload = submissions.at(-1);
    await event('Try Again').click(); await finish();
    assert.deepEqual(submissions.at(-1), failedPayload);

    await open(); await name.fill('Preserved Draft'); await event('Haldi').click();
    await page.mouse.click(2, 2); await expect(dialog).toBeVisible();
    // Focus stays inside, including when tabbing forward from the final action.
    await event('Cancel').focus(); await page.keyboard.press('Tab');
    assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)));
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' });
    await open(); await expect(name).toHaveValue(''); await expect(event('Haldi')).toHaveAttribute('aria-pressed', 'false');
    const beforeCancel = submissions.length;
    await event('Cancel').click(); await dialog.waitFor({ state: 'detached' });
    assert.equal(submissions.length, beforeCancel);
    await open(); await page.getByRole('button', { name: 'Close RSVP' }).click(); await dialog.waitFor({ state: 'detached' });
    await open(); await expect(name).toHaveValue('');
    assert.equal(await dialog.locator('.rsvp-error, .rsvp-confirmation').count(), 0);
    await event('Cancel').click(); await dialog.waitFor({ state: 'detached' });
    assert.equal(await page.locator('.event-actions button').filter({ hasText: 'Add to Calendar' }).count(), 5);
    assert.equal(await page.locator('.event-actions a').count(), 5);
    assert.deepEqual(errors, []);
    assert.deepEqual(apiRequests, [], 'Frontend RSVP must not contact an API');
    console.log(`PASS RSVP selection, payloads, loading, success, decline, error/retry, focus/scroll/reset at ${width}px${width === 430 ? ' (reduced motion)' : ''} (frontend mock)`);
    await page.close();
  }
} finally { await browser.close(); }
