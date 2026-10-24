import { events, wedding } from '../data/wedding';
import type { WeddingEvent } from '../data/wedding';

const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
const calendarDate = (value: Date) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

export function weddingCalendar(now = new Date()) {
  const ceremony = events.find(event => event.id === 'wedding')!;
  return buildCalendar(ceremony, new Date(wedding.date), now);
}

export function eventCalendar(event: WeddingEvent, now = new Date()) {
  // Event display dates and times are local to the celebrations in India.
  const [day, month, year] = event.date.split(' ');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // Meal labels may precede the time (for example, "Lunch - 1:00 PM onwards").
  const time = /\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/.exec(event.time);
  const monthIndex = months.indexOf(month);
  if (!time || monthIndex < 0) throw new Error(`Invalid calendar date/time for ${event.id}`);
  const hour = Number(time[1]) % 12 + (time[3] === 'PM' ? 12 : 0);
  const start = new Date(`${year}-${String(monthIndex + 1).padStart(2, '0')}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${time[2]}:00+05:30`);
  return buildCalendar(event, start, now);
}

function buildCalendar(ceremony: WeddingEvent, start: Date, now: Date) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arpita and Swagat//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:arpita-swagat-${ceremony.id}-${calendarDate(start).slice(0, 8)}@invitation.local`,
    `DTSTAMP:${calendarDate(now)}`, `DTSTART:${calendarDate(start)}`,
    `SUMMARY:${escapeText(`${wedding.bride.firstName} & ${wedding.groom.firstName} — ${ceremony.title}`)}`,
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
  downloadCalendar(weddingCalendar(), 'arpita-swagat-wedding.ics');
}

export function downloadEventCalendar(event: WeddingEvent) {
  downloadCalendar(eventCalendar(event), `arpita-swagat-${event.id}.ics`);
}

function downloadCalendar(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
