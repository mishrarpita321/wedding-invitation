export const wedding = {
  bride: { name: 'Arpita Mishra', firstName: 'Arpita', parents: ['Shri. Rudra Prasad Mishra', 'Smt. Bijayeeni Mishra'] },
  groom: { name: 'Swagat Pruseth', firstName: 'Swagat', parents: ['Shri. Amar Bijay Pruseth', 'Smt. Namita Pruseth'] },
  date: '2027-02-10T12:00:00+05:30',
  dateLabel: '10 February 2027',
  timeLabel: '12:00 PM',
  timeZoneLabel: 'IST',
  compactDate: '10 · 02 · 2027',
  location: 'Bhubaneswar, Odisha',
  residence: 'D/23, Mason Paradise, Inajna, near Patia Station, Bhubaneswar',
  audio: '/assets/wedding-music.mp3',
  photos: { footer1: '/assets/footer1.webp', together: '/assets/together.webp', together1: '/assets/together1.webp', arpita: '/assets/arpita.webp', swagat: '/assets/swagat.webp' },
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
  rsvpLabel: string;
  dressCode: DressCode;
}

export const events: WeddingEvent[] = [
  {
    id: 'engagement', title: 'Ring Ceremony', rsvpLabel: 'Engagement', day: 'Thursday', date: '28 January 2027',
    time: 'Lunch - 1:00 PM onwards', venue: 'Angan Horizon', address: 'Infocity Road, Patia Square, Bhubaneswar, Odisha',
    mapsQuery: 'Angan Horizon, Bhubaneswar', image: '/assets/events/engagement.webp',
    dressCode: { preferred: 'Dress in colours you love.', colors: [], avoid: [{ name: 'Violet', color: '#6824a1' }, { name: 'Beige', color: '#ac906b' }] },
  },
  {
    id: 'mehendi', title: 'Mehendi', rsvpLabel: 'Mehendi', day: 'Monday', date: '8 February 2027',
    time: '1:00 PM onwards', venue: 'At our residence', address: wedding.residence,
    mapsQuery: wedding.residence, image: '/assets/events/mehendi.webp',
    dressCode: { preferred: 'Green preferred.', colors: ['#526647', '#80936c', '#b4be9c'], avoid: [{ name: 'Orange', color: '#ff5f1f' }] },
  },
  {
    id: 'haldi', title: 'Haldi & Sangeet', rsvpLabel: 'Haldi', day: 'Tuesday', date: '9 February 2027',
    time: '11:00 AM onwards', venue: 'At our residence', address: wedding.residence,
    mapsQuery: wedding.residence, image: '/assets/events/haldi.webp',
    dressCode: { preferred: 'Yellow preferred.', colors: ['#c69227', '#e6b84a', '#f0d681'], avoid: [{ name: 'Pink', color: '#ff1493' }] },
  },
  {
    id: 'wedding', title: 'Wedding', rsvpLabel: 'Wedding', day: 'Wednesday', date: wedding.dateLabel,
    time: `Lunch - ${wedding.timeLabel} onwards`, venue: 'Ruby by Occasions', address: 'Cuttack - Puri Bypass Rd, near Shirdi Sai Mandira, Bhubaneswar, Odisha',
    mapsQuery: 'Ruby by Occasions, Bhubaneswar', image: '/assets/events/wedding.webp', subtitle: 'The day we say “I do”',
    dressCode: { preferred: 'Anything preferred.', colors: [], avoid: [{ name: 'Red', color: '#FF2C2C' }] },
  },
  {
    id: 'reception', title: 'Reception', rsvpLabel: 'Reception', day: 'Friday', date: '12 February 2027',
    time: 'Dinner - 7:00 PM onwards', venue: 'Green Palm', address: 'Jail Gate, Main Road, Chhend Colony, Rourkela, Odisha',
    mapsQuery: 'Green Palm, Rourkela, Odisha', image: '/assets/events/reception.webp',
    dressCode: { preferred: 'Bling & party colours preferred.', colors: [], avoid: [] },
  },
];
