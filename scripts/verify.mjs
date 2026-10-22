import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import ts from 'typescript';

await mkdir('test-results', { recursive: true });
const baseURL = process.env.TEST_URL || 'http://localhost:5173';
const toModuleURL = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText).toString('base64');
const dataURL = toModuleURL(await readFile('src/data/wedding.ts', 'utf8'));
const { wedding, events } = await import(dataURL);
const { countdown, weddingDayStatus } = await import(toModuleURL(
  (await readFile('src/utils/countdown.ts', 'utf8')).replace('../data/wedding', dataURL),
));
const { getGoogleMapsUrl } = await import(toModuleURL(await readFile('src/utils/maps.ts', 'utf8')));
const target = Date.parse(wedding.date);
assert.equal(new Date(target).toISOString(), '2027-02-10T06:30:00.000Z');
assert.deepEqual(countdown(target - 90061000), [1, 1, 1, 1]);
assert.deepEqual(countdown(target + 1000), [0, 0, 0, 0]);
assert.equal(weddingDayStatus(Date.parse('2027-02-09T18:29:59Z')), 'upcoming');
assert.equal(weddingDayStatus(Date.parse('2027-02-09T18:30:00Z')), 'today');
assert.equal(weddingDayStatus(Date.parse('2027-02-10T18:30:00Z')), 'past');
assert.equal(new URL(getGoogleMapsUrl(wedding.residence)).searchParams.get('query'), wedding.residence);
console.log('PASS IST countdown, Indian calendar-day boundaries and encoded map queries');

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
async function configure(page) {
  // Test with system-font fallbacks so network fonts cannot make QA hang.
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.addInitScript(() => { window.__testAudio = null; });
}
async function openInvitation(page, viaCTA = false) {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: /Open Arpita/ }).waitFor();
  assert.equal(await page.locator('main').count(), 0);
  assert.equal(await page.locator('.ganesh-blessing, .flower-petals').count(), 0);
  assert.equal(await page.locator('audio').count(), 1);
  assert.equal(await page.locator('audio').evaluate(audio => audio.paused), true);
  await page.evaluate(() => { window.__testAudio = document.querySelector('audio'); });
  // The seal gently pulses; its center remains clickable while Playwright's stability check would wait forever.
  if (viaCTA) await page.getByRole('button', { name: /Open Arpita/ }).click({ force: true });
  else {
    await page.getByRole('button', { name: /Open Arpita/ }).focus();
    await page.keyboard.press('Enter');
  }
  await page.locator('main.invitation').waitFor();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('main > section').first().getAttribute('class'), 'section ganesh-blessing');
  assert.equal(await page.locator('.ganesh-blessing button').count(), 0);
  assert.equal(await page.evaluate(() => document.querySelector('audio') === window.__testAudio), true);
  assert.equal(await page.evaluate(() => window.scrollY), 0);
}

try {
  for (const width of [320, 375, 390, 430, 900, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) console.log(`HTTP ${response.status()}: ${response.url()}`); });
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await configure(page);
    await openInvitation(page, width === 375 || width === 430);
    assert.equal(await page.locator('.event-card').count(), 5);
    for (const artwork of await page.locator('.event-image').all()) {
      assert.equal(await artwork.locator('img, .event-artwork').count(), 1, 'Each event needs a supplied photo or decorative fallback');
    }
    assert.equal(await page.locator('.event-actions a').count(), 5);
    // The optional standalone locations section is currently omitted from WeddingInvitation.
    assert.equal(await page.locator('.locations .text-link').count(), (await page.locator('.locations').count()) * 4);
    assert.equal(await page.locator('.flower-petal').count(), width < 600 ? 9 : 16);
    assert.equal(await page.locator('.flower-petals').evaluate(el => getComputedStyle(el).pointerEvents), 'none');
    assert.equal(await page.locator('body').innerText().then(text => /2011|15 years|fifteen years|Dhavala|Bandamunda|August 2026/i.test(text)), false);
    for (const name of [...wedding.bride.parents, ...wedding.groom.parents, wedding.bride.name, wedding.groom.name]) {
      assert.ok((await page.locator('#families').innerText()).includes(name));
    }
    for (const event of events) {
      const card = page.locator('.event-card').filter({ has: page.locator(`#event-${event.id}`) });
      const text = await card.innerText();
      for (const detail of [event.title, event.day, event.date, event.time, event.venue, event.address, event.dressCode.preferred]) assert.ok(text.includes(detail), `${event.id}: ${detail}`);
      for (const color of event.dressCode.avoid) assert.ok(text.includes(color.name));
      const href = await card.locator('a').getAttribute('href');
      assert.equal(new URL(href).searchParams.get('query'), event.mapsQuery);
      await card.scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}px`);
    }
    const cards = await page.locator('.event-card').evaluateAll(els => els.map(el => {
      const rect = el.getBoundingClientRect(); return { x: rect.x, width: rect.width };
    }));
    if (width >= 900) {
      assert.ok(cards[0].x < width / 2 && cards[1].x > width / 2 && cards[2].x < width / 2);
      const centers = await page.locator('.timeline-dot').evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().x + el.getBoundingClientRect().width / 2)));
      assert.equal(new Set(centers).size, 1);
    } else {
      assert.equal(new Set(cards.map(card => Math.round(card.x))).size, 1);
      assert.ok(cards[0].width > width * 0.8, 'Mobile cards should use nearly the full width');
    }
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
    }
    const positions = await page.locator('.flower-petal').evaluateAll(els => els.map(el => el.style.left));
    await page.getByRole('button', { name: 'Mute wedding music' }).click();
    assert.equal(await page.locator('audio').evaluate(audio => audio.paused), true);
    await page.getByRole('button', { name: 'Play wedding music' }).click();
    await page.waitForFunction(() => !document.querySelector('audio').paused);
    assert.deepEqual(await page.locator('.flower-petal').evaluateAll(els => els.map(el => el.style.left)), positions);
    if ([320, 390, 1440].includes(width)) {
      // Reveal each section before capturing the continuous page.
      for (const section of await page.locator('main > section, main > footer').all()) {
        await section.scrollIntoViewIfNeeded();
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(900);
      await page.screenshot({ path: `test-results/refactor-${width}.png`, fullPage: true });
    }
    assert.deepEqual(errors, []);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('dialog').waitFor();
    assert.equal(await page.locator('.ganesh-blessing, .flower-petals').count(), 0);
    console.log(`PASS ${width}px: envelope/CTA, continuous blessing-first page, single audio, photos, content, directions, petals, timeline, overflow, refresh`);
    await page.close();
  }

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await configure(reduced);
  await reduced.route('**/wedding-music.mp3', route => route.fulfill({ status: 404, body: '' }));
  await openInvitation(reduced, true);
  assert.equal(await reduced.locator('.flower-petals').count(), 0);
  await reduced.getByRole('button', { name: 'Music unavailable' }).waitFor();
  assert.equal(await reduced.locator('.event-card').count(), 5);
  assert.equal(await reduced.getByRole('button', { name: 'Music unavailable' }).isDisabled(), true);
  console.log('PASS reduced motion: no petals, simplified opening, missing music does not block the invitation');
  await reduced.close();

  // Simulate mobile autoplay rejection; the page remains usable and the music toggle can retry.
  const blocked = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  await configure(blocked);
  await blocked.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Playback blocked', 'NotAllowedError')); });
  await openInvitation(blocked, true);
  await blocked.getByRole('button', { name: 'Play wedding music' }).waitFor();
  assert.equal(await blocked.locator('.event-card').count(), 5);
  console.log('PASS rejected playback: invitation opens and the retry control remains available');
  await blocked.close();
} finally {
  await browser.close();
}
