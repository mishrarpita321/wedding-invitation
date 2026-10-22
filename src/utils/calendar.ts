import { events, wedding } from '../data/wedding';

const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
const calendarDate = (value: Date) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

export function weddingCalendar(now = new Date()) {
  const ceremony = events.find(event => event.id === 'wedding')!;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arpita and Swagat//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:arpita-swagat-wedding-20270210@invitation.local',
    `DTSTAMP:${calendarDate(now)}`, `DTSTART:${calendarDate(new Date(wedding.date))}`,
    `SUMMARY:${escapeText(`${wedding.bride.firstName} & ${wedding.groom.firstName} — Wedding`)}`,
    `LOCATION:${escapeText(`${ceremony.venue}, ${ceremony.address}`)}`,
    `DESCRIPTION:${escapeText([ceremony.subtitle, ceremony.time, ceremony.dressCode.preferred].filter(Boolean).join('\n'))}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ];
  // Fold by UTF-8 octets to keep the download compatible with calendar clients.
  return lines.map(line => {
    let folded = ''; let size = 0;
    for (const character of line) {
      const length = new TextEncoder().encode(character).length;
      if (size + length > 75) { folded += '\r\n '; size = 1; }
      folded += character; size += length;
    }
    return folded;
  }).join('\r\n');
}

export function downloadWeddingCalendar() {
  const url = URL.createObjectURL(new Blob([weddingCalendar()], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'arpita-swagat-wedding.ics';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
