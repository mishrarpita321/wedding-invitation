import { useState } from 'react';
import Paper from '@mui/material/Paper';
import { motion, useReducedMotion } from 'framer-motion';
import type { WeddingEvent } from '../../data/wedding';
import { getGoogleMapsUrl } from '../../utils/maps';
import { pressFeedback } from '../../utils/press';
import DetailIcon from '../shared/DetailIcon';
import EventArtwork from './EventArtwork';

// Only request images actually present in public/assets/events. Missing files never produce broken images or 404s.
const suppliedImagePaths = new Set(Object.keys(import.meta.glob('/public/assets/events/*.{webp,jpg,jpeg,png,avif}', {
  query: '?url', import: 'default',
})));

export default function EventTimelineCard({ event, index }: { event: WeddingEvent; index: number }) {
  const reduced = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const image = suppliedImagePaths.has(`/public${event.image}`) ? event.image : undefined;

  return (
    <motion.div className="event-card-reveal" initial={reduced ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-35px' }} transition={{ duration: 0.7 }}>
      <Paper component="article" elevation={0} className={`event-card ${event.id === 'wedding' ? 'wedding-event-card' : ''}`} aria-labelledby={`event-${event.id}`}>
        <div className="event-image">
          {image && !imageFailed
            ? <img src={image} alt={`${event.title} celebration details`} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
            : <EventArtwork event={event.id} />}
          <span className="event-number" aria-hidden="true">0{index + 1}</span>
        </div>
        <div className="event-card-body">
          <h3 id={`event-${event.id}`}>{event.title}</h3>
          <p className="event-detail event-date"><DetailIcon kind="calendar" /><span>{event.day} · <strong>{event.date}</strong></span></p>
          <p className="event-detail"><DetailIcon kind="clock" /><span>{event.time}</span></p>
          <p className="event-detail"><DetailIcon kind="pin" /><span><strong>{event.venue}</strong><br />{event.address}</span></p>
          <div className="event-dress-code">
            <p className="event-detail"><DetailIcon kind="dress" /><span>{event.dressCode.preferred}</span></p>
            {!!event.dressCode.colors.length && <div className="preferred-swatches" aria-label="Suggested colour palette">
              {event.dressCode.colors.map(color => <span key={color} style={{ backgroundColor: color }} />)}
            </div>}
            {event.dressCode.avoid.length ? <div className="event-avoid"><span>Kindly avoid</span><ul>
              {event.dressCode.avoid.map(color => <li key={color.name}><span className="avoid-swatch" style={{ backgroundColor: color.color }} aria-hidden="true" />{color.name}</li>)}
            </ul></div> : <p className="no-restriction">No specific colour restriction.</p>}
          </div>
          <div className="event-actions">
            <motion.button className="invitation-action invitation-action-primary cta-polish" type="button" aria-disabled="true" aria-describedby={`rsvp-${event.id}`}
              whileHover={reduced ? { y: 0, scale: 1 } : { y: -2, scale: 1.015 }} whileTap={pressFeedback(reduced, 0.97)}
              transition={{ type: 'tween', duration: reduced ? 0 : 0.18, ease: 'easeOut' }}>RSVP</motion.button>
            <motion.a className="invitation-action cta-polish directions-action" href={getGoogleMapsUrl(event.mapsQuery)} target="_blank" rel="noopener noreferrer"
              whileHover={reduced ? { y: 0, scale: 1 } : { y: -2 }} whileTap={pressFeedback(reduced)}
              transition={{ type: 'tween', duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
              aria-label={`Get directions for ${event.title} to ${event.venue}`}>Get Directions <span className="cta-icon" aria-hidden="true">↗</span></motion.a>
          </div>
        </div>
      </Paper>
    </motion.div>
  );
}
