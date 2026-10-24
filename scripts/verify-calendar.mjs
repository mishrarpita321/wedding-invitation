import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText).toString('base64');
const weddingUrl = moduleUrl(await readFile('src/data/wedding.ts', 'utf8'));
const { events } = await import(weddingUrl);
const { eventCalendar, weddingCalendar } = await import(moduleUrl(
  (await readFile('src/utils/calendar.ts', 'utf8')).replaceAll('../data/wedding', weddingUrl),
));
const expectedStarts = {
  engagement: '20270128T073000Z',
  mehendi: '20270208T073000Z',
  haldi: '20270209T053000Z',
  wedding: '20270210T063000Z',
  reception: '20270212T133000Z',
};
const now = new Date('2026-10-24T12:00:00Z');
for (const event of events) {
  const calendar = eventCalendar(event, now);
  const unfolded = calendar.replace(/\r\n /g, '');
  assert.ok(calendar.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(calendar.endsWith('END:VCALENDAR\r\n'));
  assert.ok(unfolded.includes(`DTSTART:${expectedStarts[event.id]}\r\n`), event.title);
  assert.ok(unfolded.includes(`SUMMARY:Arpita & Swagat — ${event.title}\r\n`));
  assert.ok(unfolded.includes(event.venue));
}
assert.equal(weddingCalendar(now), eventCalendar(events.find(event => event.id === 'wedding'), now));
console.log('PASS calendar export for all five events, including meal prefixes and IST conversion');
