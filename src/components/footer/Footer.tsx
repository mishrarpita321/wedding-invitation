import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Lotus, Flourish } from '../shared/Ornaments';
import { pressFeedback } from '../../utils/press';
import { useState } from 'react';
import RsvpDialog from '../rsvp/RsvpDialog';

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};
const photoReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: 'easeOut' } },
};

export default function Footer() {
  const reduced = useReducedMotion();
  const [rsvpOpen, setRsvpOpen] = useState(false);
  return (
    <footer className="section closing closing-family">
      <motion.div className="closing-composition" initial={reduced ? false : 'hidden'} whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} variants={{ visible: { transition: { staggerChildren: 0.18 } } }}>
        <motion.div className="closing-intro" variants={reduced ? undefined : reveal}>
          <Lotus className="section-lotus" />
          <p className="eyebrow">The best part is having you there</p>
          <h2>Your presence will make<br /><em>our joy complete.</em></h2>
        </motion.div>
        <motion.div className="closing-photo" variants={reduced ? undefined : photoReveal}>
          <img src="/assets/family.webp" srcSet="/assets/family-small.webp 800w, /assets/family.webp 1536w"
            sizes="(max-width: 1359px) 100vw, 1320px" width={1536} height={1024}
            alt="Arpita’s family gathered outdoors, with their dog" loading="lazy" decoding="async" />
        </motion.div>
        <motion.div className="closing-message" variants={reduced ? undefined : reveal}>
          <p className="closing-hosts">
            <span className="closing-hosts-greeting">With warm regards,</span>
            <span className="closing-hosts-names">Bijayeeni &amp; Rudra Prasad Mishra</span>
            <span className="closing-hosts-family">and family</span>
          </p>
          <motion.div className="footer-rsvp" initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}>
            <p className="footer-rsvp-prompt">Kindly let us know if you’ll be joining us.</p>
            <motion.button className="invitation-action invitation-action-primary cta-polish" type="button"
              onClick={() => setRsvpOpen(true)} aria-haspopup="dialog"
              whileHover={reduced ? undefined : { y: -2 }} whileTap={pressFeedback(reduced, 0.97)}
              transition={{ type: 'tween', duration: reduced ? 0 : 0.18, ease: 'easeOut' }}>RSVP</motion.button>
          </motion.div>
          <Flourish />
        </motion.div>
      </motion.div>
      <RsvpDialog open={rsvpOpen} onClose={() => setRsvpOpen(false)} />
    </footer>
  );
}
