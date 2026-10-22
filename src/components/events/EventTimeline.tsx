import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { motion, useReducedMotion } from 'framer-motion';
import { events } from '../../data/wedding';
import { Reveal } from '../shared/Reveal';
import EventTimelineCard from './EventTimelineCard';
import './events.css';

export default function EventTimeline() {
  const reduced = useReducedMotion();
  return (
    <section id="celebrations" className="section itinerary" aria-labelledby="itinerary-title">
      <Container maxWidth="lg">
        <Reveal><h2 id="itinerary-title">Wedding Celebrations</h2>
          <p className="section-intro">Join us as our most beautiful moments unfold.</p></Reveal>
        <Box component="ol" className="event-timeline">
          {events.map((event, index) => (
            <li key={event.id} className={`timeline-entry ${index % 2 === 0 ? 'entry-left' : 'entry-right'}`}>
              <motion.span className={`timeline-dot ${event.id === 'wedding' ? 'wedding-dot' : ''}`} aria-hidden="true"
                initial={reduced ? false : { scale: 0 }} whileInView={{ scale: reduced ? 1 : [0, 1.15, 1] }}
                viewport={{ once: true }} transition={{ duration: 0.6 }} />
              <EventTimelineCard event={event} index={index} />
            </li>
          ))}
        </Box>
      </Container>
    </section>
  );
}
