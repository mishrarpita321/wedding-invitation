export const wedding = {
  bride: { name: 'Arpita Mishra', firstName: 'Arpita', parents: ['Shri. Rudra Prasad Mishra', 'Smt. Bijayeeni Mishra'] },
  groom: { name: 'Swagat Pruseth', firstName: 'Swagat', parents: ['Shri. Amar Bijay Pruseth', 'Smt. Namita Pruseth'] },
  date: '2027-02-10T12:00:00+05:30',
  dateLabel: '10 February 2027',
  timeLabel: '12:00 PM',
  timeZoneLabel: 'IST',
  compactDate: '10 · 02 · 2027',
  location: 'Bhubaneswar, Odisha',
  residence: 'D/23, Mason Paradise, Patia, Bhubaneswar',
  audio: '/assets/wedding-music.mp3',
  photos: { together: '/assets/together.webp', arpita: '/assets/arpita.webp', swagat: '/assets/swagat.webp' },
};

export type EventId = 'engagement' | 'mehendi' | 'haldi' | 'wedding' | 'reception';

export interface DressCode {
  preferred: string;
  colors: string[];
  avoid: { name: string; color: string }[];
}

export interface WeddingEvent {
  id: EventId;
  title: string;
  day: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  mapsQuery: string;
  image: string;
  subtitle?: string;
  dressCode: DressCode;
}

export const events: WeddingEvent[] = [
  {
    id: 'engagement', title: 'Engagement', day: 'Thursday', date: '28 January 2027',
    time: '1:00 PM onwards', venue: 'Angan Horizon', address: 'Bhubaneswar',
    mapsQuery: 'Angan Horizon, Bhubaneswar', image: '/assets/events/engagement.webp',
    dressCode: { preferred: 'Dress in colours you love.', colors: [], avoid: [{ name: 'Purple', color: '#75607c' }, { name: 'Beige', color: '#d4c1a0' }] },
  },
  {
    id: 'mehendi', title: 'Mehendi & Sangeet', day: 'Monday', date: '8 February 2027',
    time: '1:00 PM onwards', venue: 'At our residence', address: wedding.residence,
    mapsQuery: wedding.residence, image: '/assets/events/mehendi.webp',
    dressCode: { preferred: 'Green preferred.', colors: ['#526647', '#80936c', '#b4be9c'], avoid: [{ name: 'Orange', color: '#ce823e' }] },
  },
  {
    id: 'haldi', title: 'Haldi', day: 'Tuesday', date: '9 February 2027',
    time: '11:00 AM onwards', venue: 'At our residence', address: wedding.residence,
    mapsQuery: wedding.residence, image: '/assets/events/haldi.webp',
    dressCode: { preferred: 'Yellow preferred.', colors: ['#c69227', '#e6b84a', '#f0d681'], avoid: [{ name: 'Pink', color: '#d89aa9' }] },
  },
  {
    id: 'wedding', title: 'Wedding', day: 'Wednesday', date: wedding.dateLabel,
    time: `${wedding.timeLabel} onwards`, venue: 'Ruby by Occasions', address: 'Bhubaneswar',
    mapsQuery: 'Ruby by Occasions, Bhubaneswar', image: '/assets/events/wedding.webp', subtitle: 'The day we say “I do”',
    dressCode: { preferred: 'Anything preferred.', colors: [], avoid: [{ name: 'Red', color: '#a03239' }] },
  },
  {
    id: 'reception', title: 'Reception', day: 'Friday', date: '12 February 2027',
    time: '7:00 PM onwards', venue: 'Green Palm', address: 'Rourkela, Odisha',
    mapsQuery: 'Green Palm, Rourkela, Odisha', image: '/assets/events/reception.webp',
    dressCode: { preferred: 'Bling & party colours preferred.', colors: ['#b99555', '#384b49', '#554059'], avoid: [] },
  },
];
