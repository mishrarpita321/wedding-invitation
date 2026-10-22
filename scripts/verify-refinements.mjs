import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const [width, reduced, manual] of [[360,false,true],[390,false,false],[430,true,true]]) {
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:reduced?'reduce':'no-preference'});
    await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173', {waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/Open Arpita/}).press('Enter');
    await page.getByRole('dialog').waitFor({state:'detached'});
    await page.locator('.scratch-card').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.scratch-or').innerText(),'OR');
    assert.equal(await page.getByRole('button',{name:'Add to Calendar'}).count(),0);
    if(manual) await page.getByRole('button',{name:'Reveal date without scratching'}).click();
    else {
      const box=await page.locator('.scratch-card canvas').boundingBox();
      await page.mouse.move(box.x+10,box.y+10); await page.mouse.down();
      for(let y=12;y<box.height;y+=14) {
        await page.mouse.move(box.x+12,box.y+y,{steps:2});
        await page.mouse.move(box.x+box.width-12,box.y+y,{steps:10});
      }
      await page.mouse.up();
    }
    const calendar=page.getByRole('button',{name:'Add to Calendar'});
    await calendar.waitFor();
    assert.equal(await page.locator('.scratch-card').evaluate(e=>e.classList.contains('is-revealed')),true);
    assert.equal(await page.locator('.scratch-fallback').count(),0);
    const downloadPromise=page.waitForEvent('download'); await calendar.click();
    const download=await downloadPromise;
    const content=await readFile(await download.path(),'utf8');
    assert.match(content,/DTSTART:20270210T063000Z/);
    assert.match(content,/LOCATION:Ruby by Occasions/);
    assert.match(content,/BEGIN:VCALENDAR/);
    assert.equal(await page.locator('.event-actions').count(),5);
    assert.equal(await page.locator('.event-image-label').count(),0);
    for(const button of await page.locator('.event-actions > *').all()) assert.ok((await button.boundingBox()).height>=44);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('.event-card').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({path:`test-results/refinement-${width}.png`});
    console.log(`PASS ${width}px: ${manual?'manual':'scratch'} reveal, calendar download, tap targets, no overflow; reduced motion=${reduced}`);
    await page.close();
  }
} finally { await browser.close(); }

