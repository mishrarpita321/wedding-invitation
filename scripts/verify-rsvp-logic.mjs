import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText).toString('base64');
const weddingUrl = moduleUrl(await readFile('src/data/wedding.ts', 'utf8'));
const { createRsvpPayload, selectEvents, validateRsvp, rsvpConfig, rsvpEvents } = await import(moduleUrl(
  (await readFile('src/data/rsvp.ts', 'utf8')).replace('./wedding.ts', weddingUrl),
));
const form = { name: '  Guest Example  ', guestCount: 2, status: 'attending', events: { ...selectEvents(), wedding: true } };
assert.deepEqual(validateRsvp(form), {});
assert.ok(validateRsvp({ ...form, name: '  ' }).name);
assert.ok(validateRsvp({ ...form, events: selectEvents() }).events);
for (const guestCount of [0, -1, 1.5, rsvpConfig.maxAttendees + 1]) assert.ok(validateRsvp({ ...form, guestCount }).guestCount);
assert.deepEqual(validateRsvp({ ...form, status: 'declined', guestCount: 0, events: selectEvents() }), {});
assert.ok(validateRsvp({ ...form, status: 'declined', name: '' }).name);
const attending = createRsvpPayload(form);
assert.equal(attending.name, 'Guest Example');
assert.equal(attending.guestCount, 2);
assert.deepEqual(attending.events, form.events);
assert.notEqual(attending.events, form.events);
const declined = createRsvpPayload({ ...form, status: 'declined' });
assert.equal(declined.guestCount, 0);
assert.ok(Object.values(declined.events).every(value => !value));
assert.equal(Object.keys(selectEvents(true)).length, rsvpEvents.length);
assert.ok(Object.values(selectEvents(true)).every(Boolean));
assert.ok(Object.values(selectEvents()).every(value => !value));

const source = await readFile('src/utils/rsvp.ts', 'utf8');
async function mock(failures, development) {
  return import(moduleUrl(source.replace('const MOCK_FAILURES = 0;', `const MOCK_FAILURES = ${failures};`)
    .replace('import.meta.env.DEV', String(development))));
}
const originalWindow = globalThis.window;
const originalFetch = globalThis.fetch;
globalThis.window = { setTimeout };
globalThis.fetch = () => { throw new Error('Mock must not access the network'); };
try {
  const success = await mock(0, true);
  const start = Date.now();
  await success.submitRsvp(attending);
  assert.ok(Date.now() - start >= 800);
  const failOnce = await mock(1, true);
  await assert.rejects(() => failOnce.submitRsvp(attending));
  await failOnce.submitRsvp(attending);
  const production = await mock(1, false);
  await production.submitRsvp(declined);
} finally { globalThis.window = originalWindow; globalThis.fetch = originalFetch; }
console.log('PASS RSVP validation, counts, selection, typed payload normalization, 850ms delay, fail-once/retry and production success without network calls');
