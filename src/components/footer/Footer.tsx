import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { wedding } from '../../data/wedding';
import { Lotus, Flourish } from '../shared/Ornaments';
import { Photo } from '../shared/Photo';
import { pressFeedback } from '../../utils/press';

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
  return (
    <footer className="section closing">
      <motion.div className="closing-composition" initial={reduced ? false : 'hidden'} whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} variants={{ visible: { transition: { staggerChildren: 0.18 } } }}>
        <motion.div className="closing-intro" variants={reduced ? undefined : reveal}>
          <Lotus className="section-lotus" />
          <p className="eyebrow">The best part is having you there</p>
          <h2>We can’t wait to<br /><em>celebrate with you.</em></h2>
        </motion.div>
        <motion.div className="closing-photo" variants={reduced ? undefined : photoReveal}>
          <Photo name="together1" alt="Arpita and Swagat smiling at each other outdoors" />
        </motion.div>
        <motion.div className="closing-message" variants={reduced ? undefined : reveal}>
          <p className="closing-names">{wedding.bride.firstName} & {wedding.groom.firstName}</p>
          <p className="eyebrow">{wedding.dateLabel}</p>
          <motion.div className="footer-rsvp" initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}>
            <p className="footer-rsvp-prompt">Kindly let us know if you’ll be joining us.</p>
            <motion.button className="invitation-action invitation-action-primary cta-polish" type="button"
              aria-disabled="true" aria-describedby="rsvp-availability"
              whileHover={reduced ? undefined : { y: -2 }} whileTap={pressFeedback(reduced, 0.97)}
              transition={{ type: 'tween', duration: reduced ? 0 : 0.18, ease: 'easeOut' }}>RSVP</motion.button>
            <p id="rsvp-availability" className="footer-rsvp-note">RSVP will be available soon.</p>
          </motion.div>
          <Flourish />
        </motion.div>
      </motion.div>
    </footer>
  );
}
