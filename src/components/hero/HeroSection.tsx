import { motion, useReducedMotion, type Variants } from 'framer-motion';
import ScratchDateReveal from './ScratchDateReveal';
import { wedding } from '../../data/wedding';
import { Flourish } from '../shared/Ornaments';
import { Photo } from '../shared/Photo';
import { SectionFlorals } from '../shared/SectionFlorals';

const reveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (step: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: step * 0.16, duration: 0.8, ease: 'easeOut' },
  }),
};
const ampersandReveal: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.16, duration: 1, ease: 'easeOut' } },
};

export default function HeroSection() {
  const reduced = useReducedMotion();
  return (
    <motion.section className="hero" aria-labelledby="couple-names"
      initial={reduced ? false : 'hidden'} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <SectionFlorals variant="hero" />
      <div className="hero-copy">
        <h1 id="couple-names" className="hero-names">
          <motion.span className="hero-name" custom={0} variants={reduced ? undefined : reveal}>{wedding.bride.firstName}</motion.span>
          <motion.span className="hero-ampersand" variants={reduced ? undefined : ampersandReveal}>&</motion.span>
          <motion.span className="hero-name" custom={2} variants={reduced ? undefined : reveal}>{wedding.groom.firstName}</motion.span>
        </h1>
        <motion.div custom={4} variants={reduced ? undefined : reveal}><Flourish /></motion.div>
      </div>
      <motion.div className="hero-photo" initial={reduced ? false : { opacity: 0, scale: 1.025 }}
        whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reduced ? 0 : 1.4, ease: 'easeOut' }}>
        <Photo name="together" alt="Arpita and Swagat together" eager />
      </motion.div>
      <ScratchDateReveal />
    </motion.section>
  );
}
