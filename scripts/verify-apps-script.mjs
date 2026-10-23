import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const rows = { Bride: [], Groom: [] };
const context = vm.createContext({
  LockService: { getScriptLock: () => ({ waitLock() {}, hasLock: () => true, releaseLock() {} }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
  SpreadsheetApp: { flush() {}, openById: () => ({ getSheetByName: tab => ({
    getLastRow: () => rows[tab].length + 1,
    appendRow: row => rows[tab].push(row),
    getRange: () => ({ createTextFinder: id => ({ matchEntireCell() { return this; }, findNext: () => rows[tab].some(row => row[9] === id) }) }),
  }) }) },
});
vm.runInContext(readFileSync('apps-script/Code.gs', 'utf8'), context);
const events = { engagement: false, mehendi: false, haldi: false, wedding: true, reception: false };
let id = 0;
function send(branch, extra = {}) {
  const data = { branch, name: '=Guest', guestCount: 2, status: 'attending', events,
    submissionId: `00000000-0000-4000-8000-${String(++id).padStart(12, '0')}`, ...extra };
  return { data, result: JSON.parse(context.doPost({ postData: { contents: JSON.stringify(data) } }).text) };
}
for (const branch of ['main', 'bride', 'groom']) assert.equal(send(branch).result.ok, true);
assert.equal(rows.Bride.length, 2);
assert.equal(rows.Groom.length, 1);
assert.equal(rows.Bride[0][1], "'=Guest");
const decline = send('groom', { status: 'declined' });
assert.equal(rows.Groom[1][2], 0);
assert.ok(rows.Groom[1].slice(4, 9).every(value => value === false));
assert.equal(send('groom', decline.data).result.ok, true);
assert.equal(rows.Groom.length, 2);
assert.equal(send('feature').result.ok, false);
assert.equal(send('main', { guestCount: 99 }).result.ok, false);
console.log('PASS Apps Script routing, declines, duplicate prevention, validation and formula escaping');
