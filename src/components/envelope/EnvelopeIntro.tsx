import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { wedding } from '../../data/wedding';
import { Lotus } from '../shared/Ornaments';
import { SectionFlorals } from '../shared/SectionFlorals';
import Envelope from './Envelope';
import './envelope.css';

interface EnvelopeIntroProps {
  onOpen: () => void;
  onPlayMusic: () => void;
}

export default function EnvelopeIntro({ onOpen, onPlayMusic }: EnvelopeIntroProps) {
  const [opening, setOpening] = useState(false);
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function open() {
    if (started.current) return;
    started.current = true;
    setOpening(true);
    // Keep playback inside this user gesture for mobile browser permission.
    onPlayMusic();
    timer.current = setTimeout(onOpen, reduced ? 250 : 5000);
  }

  return (
    <motion.div className="envelope-overlay" role="dialog" aria-modal="true" aria-labelledby="envelope-title"
      initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 1.04 }} transition={{ duration: reduced ? 0.15 : 0.65 }}>
      <div className="opening envelope-stage">
        <SectionFlorals variant="envelope" />
        <div className="paper-frame" />
        <Lotus className="opening-lotus" />
        <motion.p className="eyebrow" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 0.7 }}>
          With joy in our hearts,<br />we invite you to the wedding of our beloved daughter
        </motion.p>
        <motion.h1 id="envelope-title" className="envelope-heading stationery-names" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: opening ? 0 : 1 }} transition={{ delay: reduced || opening ? 0 : 0.9, duration: reduced ? 0 : 0.6 }}>
          {wedding.bride.firstName}<span className="names-ampersand">&</span>{wedding.groom.firstName}
        </motion.h1>
        <motion.div className="envelope-entrance" initial={reduced ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }} transition={{ duration: reduced ? 0 : 1, ease: 'easeOut' }}>
          <motion.div className="envelope-float" animate={reduced || opening ? { y: 0 } : { y: [0, -4, 0] }}
            transition={{ duration: opening ? 0.25 : 4, repeat: opening || reduced ? 0 : Infinity, ease: 'easeInOut' }}>
            <Envelope opening={opening} onOpen={open} />
          </motion.div>
        </motion.div>
        <motion.div className="envelope-actions" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 1.25 }}>
          <p className="tap-hint" aria-live="polite">{opening ? 'The beginning of their forever…' : 'TAP THE SEAL TO OPEN'}</p>
          <p className="fine">A little something from us, for you</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
