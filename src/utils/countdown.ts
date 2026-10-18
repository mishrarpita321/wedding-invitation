import { wedding } from '../data/wedding';

export function countdown(now: number) {
  const left = Math.max(0, new Date(wedding.date).getTime() - now);
  return [Math.floor(left / 86400000), Math.floor(left / 3600000) % 24, Math.floor(left / 60000) % 60, Math.floor(left / 1000) % 60];
}

export function weddingDayStatus(now: number): 'upcoming' | 'today' | 'past' {
  const inIndia = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  if (inIndia.format(now) === inIndia.format(new Date(wedding.date))) return 'today';
  return now > new Date(wedding.date).getTime() ? 'past' : 'upcoming';
}
