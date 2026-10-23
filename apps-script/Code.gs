const SPREADSHEET_ID = '1ZCBuDKR3CRannlHHTSnCEwEpeMntanDNvQ4fILtxLy0';
const EVENT_IDS = ['engagement', 'mehendi', 'haldi', 'wedding', 'reception'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse(e.postData.contents);
    const tab = { main: 'Bride', bride: 'Bride', groom: 'Groom' }[data.branch];
    if (!['main', 'bride', 'groom'].includes(data.branch) ||
        typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 120 ||
        !['attending', 'declined'].includes(data.status) ||
        typeof data.submissionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(data.submissionId) ||
        !data.events || EVENT_IDS.some(id => typeof data.events[id] !== 'boolean') ||
        (data.status === 'attending' && (!Number.isInteger(data.guestCount) || data.guestCount < 1 ||
          data.guestCount > 20 || !EVENT_IDS.some(id => data.events[id])))) {
      throw new Error('Invalid RSVP');
    }
    lock.waitLock(10000);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tab);
    if (!sheet) throw new Error('Missing tab');
    const lastRow = sheet.getLastRow();
    const duplicate = lastRow > 1 && sheet.getRange(2, 10, lastRow - 1, 1)
      .createTextFinder(data.submissionId).matchEntireCell(true).findNext();
    if (!duplicate) {
      const attending = data.status === 'attending';
      const name = data.name.trim().replace(/^[=+@-]/, "'$&");
      sheet.appendRow([new Date(), name, attending ? data.guestCount : 0, data.status,
        ...EVENT_IDS.map(id => attending && data.events[id]), data.submissionId]);
      SpreadsheetApp.flush();
    }
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
