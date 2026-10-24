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
const backendEventIds = ['engagement', 'mehendi', 'haldi', 'wedding', 'reception'];
assert.deepEqual(Object.keys(selectEvents(true)).sort(), [...backendEventIds].sort());
for (const id of backendEventIds) {
  assert.equal(selectEvents(true)[id], rsvpEvents.some(event => event.id === id));
  assert.equal(typeof attending.events[id], 'boolean');
  assert.equal(typeof declined.events[id], 'boolean');
}
assert.ok(Object.values(selectEvents()).every(value => !value));

const source = await readFile('src/utils/rsvp.ts', 'utf8');
const originalFetch = globalThis.fetch;
async function transport(branch = 'main', url = 'https://script.google.com/macros/s/test/exec') {
  return import(moduleUrl(source.replaceAll('import.meta.env.VITE_RSVP_BRANCH', JSON.stringify(branch))
    .replaceAll('import.meta.env.VITE_RSVP_SCRIPT_URL', JSON.stringify(url))));
}
try {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, ...options, payload: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ ok: requests.length > 1 }) };
  };
  const main = await transport();
  await assert.rejects(() => main.submitRsvp(attending));
  await main.submitRsvp(attending);
  assert.equal(requests[0].payload.submissionId, requests[1].payload.submissionId);
  assert.equal(requests[0].headers['Content-Type'], 'text/plain;charset=utf-8');
  for (const branch of ['bride', 'groom']) {
    await (await transport(branch)).submitRsvp(declined);
    assert.equal(requests.at(-1).payload.branch, branch);
    assert.equal(requests.at(-1).payload.guestCount, 0);
  }
  await assert.rejects(() => transport('feature').then(module => module.submitRsvp(attending)));
  await assert.rejects(() => transport('main', '').then(module => module.submitRsvp(attending)));
} finally { globalThis.fetch = originalFetch; }
console.log('PASS RSVP validation, normalization, branch payloads, save errors and retry IDs');
