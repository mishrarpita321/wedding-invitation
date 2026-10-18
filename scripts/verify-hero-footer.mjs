import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const url = process.env.TEST_URL || 'http://127.0.0.1:5175';

async function configure(page) {
  // Use the documented system-font fallback for deterministic, network-independent screenshots.
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
}
async function enter(page) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open Invitation', exact: true }).click();
  await page.locator('main.invitation').waitFor();
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
}
async function heroGeometry(page, width) {
  const geometry = await page.locator('.hero-names > span').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { center: rect.x + rect.width / 2, top: rect.top, bottom: rect.bottom };
  }));
  assert.equal(geometry.length, 3);
  const [bride, ampersand, groom] = geometry;
  assert.ok(Math.abs(bride.center - ampersand.center) < 0.6, `Bride/ampersand center at ${width}`);
  assert.ok(Math.abs(groom.center - ampersand.center) < 0.6, `Groom/ampersand center at ${width}`);
  const above = ampersand.top - bride.bottom;
  const below = groom.top - ampersand.bottom;
  assert.ok(above > 0 && below > 0);
  assert.ok(Math.abs(above - below) < 0.6, `Balanced ampersand gaps at ${width}: ${above}, ${below}`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}`);
}

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await configure(page);
  await enter(page);
  // The hero stays hidden until it enters the viewport below the blessing.
  assert.equal(await page.locator('.hero-name').first().evaluate(element => getComputedStyle(element).opacity), '0');
  await page.locator('.hero').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForTimeout(2000);
  assert.equal(await page.locator('.hero-name').first().evaluate(element => getComputedStyle(element).opacity), '1');

  for (const width of [320, 375, 390, 430, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.hero').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await heroGeometry(page, width);
    await page.locator('.hero-photo').scrollIntoViewIfNeeded();
    await page.locator('.hero-photo img').evaluate(image => image.decode());
    await page.waitForTimeout(1500);
    if (width === 390 || width === 1440) await page.locator('.hero').screenshot({ path: `test-results/hero-${width}.png` });

    await page.locator('.closing').scrollIntoViewIfNeeded();
    await page.locator('.closing-photo img').evaluate(image => image.decode());
    await page.waitForTimeout(1600);
    const photo = await page.locator('.closing-photo img').evaluate(image => ({
      source: image.getAttribute('src'), naturalRatio: image.naturalWidth / image.naturalHeight,
      renderedRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
      width: image.getBoundingClientRect().width,
    }));
    assert.equal(photo.source, '/assets/together1.webp');
    assert.ok(Math.abs(photo.renderedRatio - photo.naturalRatio) < 0.002, 'Footer photograph must preserve its full proportions');
    assert.ok(photo.width > (width < 600 ? width * 0.65 : 280), `Footer photograph needs presence at ${width}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (width < 900) {
      const order = await page.locator('.closing-composition > div').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
      assert.ok(order[0] < order[1] && order[1] < order[2], 'Mobile order: heading, photograph, message');
    }
    if (width === 390 || width === 1440) await page.locator('.closing').screenshot({ path: `test-results/footer-${width}.png` });
    // Returning to the hero must not restart the reveal.
    await page.locator('.hero-names').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.hero-name').first().evaluate(element => getComputedStyle(element).opacity), '1');
    console.log(`PASS ${width}px: centered names, equal ampersand gaps, once-only hero reveal, larger together1 footer, full photo proportions, no overflow`);
  }
  assert.deepEqual(errors, []);
  await page.close();

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await configure(reduced);
  await enter(reduced);
  for (const selector of ['.hero-name', '.hero-ampersand', '.hero-photo', '.closing-photo', '.closing-message']) {
    const styles = await reduced.locator(selector).first().evaluate(element => ({ opacity: getComputedStyle(element).opacity, transform: getComputedStyle(element).transform }));
    assert.equal(styles.opacity, '1');
    assert.equal(styles.transform, 'none');
  }
  await reduced.locator('.hero-names').scrollIntoViewIfNeeded();
  await heroGeometry(reduced, 390);
  console.log('PASS reduced motion: hero and footer render immediately without translate/scale animation');
  await reduced.close();
} finally {
  await browser.close();
}
