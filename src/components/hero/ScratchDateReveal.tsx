import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { wedding } from '../../data/wedding';
import { pressFeedback } from '../../utils/press';
import DateConfetti from './DateConfetti';
import DetailIcon from '../shared/DetailIcon';
import { downloadWeddingCalendar } from '../../utils/calendar';
import './scratch-date.css';

const date = new Date(wedding.date);
const dateOptions = { timeZone: 'Asia/Kolkata' };
const day = Number(new Intl.DateTimeFormat('en', { ...dateOptions, day: 'numeric' }).format(date));
const ordinal = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] ?? 'th');
const dateLabel = `${day}${ordinal} ${new Intl.DateTimeFormat('en', { ...dateOptions, month: 'long' }).format(date)}, ${new Intl.DateTimeFormat('en', { ...dateOptions, year: 'numeric' }).format(date)}`;

export default function ScratchDateReveal() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const active = useRef<number | null>(null);
  const previous = useRef<{ x: number; y: number } | null>(null);
  const complete = useRef(false);
  const celebrated = useRef(false);
  const [celebrating, setCelebrating] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [surfaceGone, setSurfaceGone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    // Keep the bitmap fixed so resizing never restores an already scratched layer.
    const ctx = surface.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 600, 300);
    gradient.addColorStop(0, '#d9c39d');
    gradient.addColorStop(0.5, '#eee0c5');
    gradient.addColorStop(1, '#b99555');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 300);
    ctx.strokeStyle = '#faf6ee88';
    ctx.lineWidth = 1;
    for (let x = -300; x < 900; x += 18) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 300, 300); ctx.stroke();
    }
    ctx.strokeStyle = '#6e1f2a55';
    ctx.strokeRect(14, 14, 572, 272);
    ctx.fillStyle = '#6e1f2a';
    ctx.textAlign = 'center';
    ctx.font = 'italic 30px Georgia';
    ctx.fillText('Gently cratch to reveal our date', 300, 145);
    ctx.font = '14px Arial';
    ctx.fillText('A little surprise, just for you', 300, 184);
  }, []);

  function reveal() {
    if (complete.current) return;
    complete.current = true;
    active.current = null;
    previous.current = null;
    setRevealed(true);
  }

  function scratch(event: PointerEvent<HTMLCanvasElement>) {
    if (active.current !== event.pointerId || complete.current) return;
    const surface = event.currentTarget;
    const ctx = surface.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const rect = surface.getBoundingClientRect();
    const point = { x: (event.clientX - rect.left) * 600 / rect.width, y: (event.clientY - rect.top) * 300 / rect.height };
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 58;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(previous.current?.x ?? point.x, previous.current?.y ?? point.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    previous.current = point;
    const pixels = ctx.getImageData(0, 0, 600, 300).data;
    let cleared = 0;
    let samples = 0;
    for (let i = 3; i < pixels.length; i += 64) { samples++; if (pixels[i] < 128) cleared++; }
    if (cleared / samples >= 0.38) reveal();
  }

  function stop(event: PointerEvent<HTMLCanvasElement>) {
    if (active.current !== event.pointerId) return;
    active.current = null;
    previous.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <motion.div className="scratch-date"
      initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduced ? 0 : 0.7, ease: 'easeOut' }}>
      <div className={`scratch-card ${revealed ? 'is-revealed' : ''}`}>
        <div className="scratch-details hero-details" aria-hidden={!revealed}>
          <p className="eyebrow">{new Intl.DateTimeFormat('en', { ...dateOptions, weekday: 'long' }).format(date)}</p>
          <p className="hero-date">{dateLabel}</p>
          <p className="eyebrow">{wedding.location}</p>
        </div>
        <motion.canvas ref={canvas} width={600} height={300} aria-hidden="true"
          animate={{ opacity: revealed ? 0 : 1 }} transition={{ duration: reduced ? 0 : 0.7 }}
          onAnimationComplete={() => {
            if (revealed) setSurfaceGone(true);
            if (revealed && !reduced && !celebrated.current) {
              celebrated.current = true;
              setCelebrating(true);
            }
          }}
          onPointerDown={event => {
            if (complete.current || active.current !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
            active.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            scratch(event);
          }}
          onPointerMove={scratch} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} />
        {celebrating && !reduced && <DateConfetti onComplete={() => setCelebrating(false)} />}
      </div>
      {!revealed && <div className="scratch-choices">
        {/* <p className="scratch-status">Gently scratch the golden surface</p> */}
        <div className="scratch-or"><span>OR</span></div>
        <motion.button className="invitation-action scratch-fallback cta-polish" type="button" onClick={reveal}
          whileHover={reduced ? undefined : { y: -2 }} whileTap={pressFeedback(reduced)}
          transition={{ type: 'tween', duration: reduced ? 0 : 0.16, ease: 'easeOut' }}>Click here to reveal the date</motion.button>
      </div>}
      <div role="status" aria-live="polite">
        {surfaceGone && <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.12 }}>
          <p className="scratch-status scratch-saved">Save the Date</p>
          <motion.button className="invitation-action invitation-action-primary calendar-action cta-polish" type="button" onClick={downloadWeddingCalendar}
            initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'tween', ease: 'easeOut', duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.35,
              backgroundColor: { duration: reduced ? 0 : 0.16, delay: 0 }, boxShadow: { duration: reduced ? 0 : 0.16, delay: 0 },
              '--press-icon-shift': { duration: reduced ? 0 : 0.16, delay: 0 },
              y: { duration: reduced ? 0 : 0.18, delay: 0 }, scale: { duration: reduced ? 0 : 0.18, delay: 0 } }}
            whileHover={reduced ? { y: 0, scale: 1 } : { y: -2, scale: 1.015, transition: { type: 'tween', duration: 0.18, delay: 0, ease: 'easeOut' } }}
            whileTap={pressFeedback(reduced, 0.97)}
            >
            <DetailIcon kind="calendar" />Add to Calendar
          </motion.button>
          <p className="scratch-postscript">We can’t wait to celebrate with you!</p>
        </motion.div>}
      </div>
    </motion.div>
  );
}
