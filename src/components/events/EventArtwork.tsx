import type { EventId } from '../../data/wedding';
import { Lotus } from '../shared/Ornaments';

// Decorative stationery motifs stand in for ceremony photos until supplied.
export default function EventArtwork({ event }: { event: EventId }) {
  return (
    <div className={`event-artwork artwork-${event}`} aria-hidden="true">
      <span className="artwork-arch" />
      {event === 'haldi' ? <Lotus className="artwork-lotus" /> : (
        <svg viewBox="0 0 180 130" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          {event === 'engagement' && <><circle cx="70" cy="77" r="29" /><circle cx="108" cy="77" r="29" /><path d="m62 39 8-10 8 10-8 9-8-9Zm8-10v19m30-9 8-10 8 10-8 9-8-9Zm8-10v19M90 17v-7m-8 11-5-5m21 5 5-5" /></>}
          {event === 'mehendi' && <><path d="M90 115V20m0 70c-30 0-43-17-43-35 26 0 43 12 43 35Zm0-23c28 0 42-17 42-35-25 0-42 12-42 35ZM90 45c-16-4-23-18-18-30 17 3 23 16 18 30Zm0 60c29 0 46-15 49-35-27-2-47 12-49 35Z" /><path d="m38 105 10-13m95-73-9 9M44 35l7 7" /></>}
          {event === 'wedding' && <><path d="M35 113h110M44 111V50h92v61M39 50h102M51 42l39-26 39 26H51Zm12 9v60m54-60v60M45 57c0 20 18 25 18 25m72-25c0 20-18 25-18 25M63 60c14 13 40 13 54 0M78 90h24l-4 13H82l-4-13Z" /><path d="M86 88c-8-9 4-9 3-20 12 13 9 19 5 20M90 17V7" /></>}
          {event === 'reception' && <><path d="m90 17 8 27 27 8-27 8-8 27-8-27-27-8 27-8 8-27Zm-43 56 4 14 14 4-14 4-4 14-4-14-14-4 14-4 4-14Zm88 6 3 10 11 3-11 4-3 10-3-10-11-4 11-3 3-10Z" /><circle cx="43" cy="34" r="2" /><circle cx="137" cy="31" r="2" /><path d="M74 111h32m-25 6h18" /></>}
        </svg>
      )}
      <span className="artwork-caption">A & S</span>
    </div>
  );
}
