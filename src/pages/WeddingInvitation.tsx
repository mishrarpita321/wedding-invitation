import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GaneshBlessing from '../components/blessing/GaneshBlessing';
import HeroSection from '../components/hero/HeroSection';
import CoupleIntroduction from '../components/couple/CoupleIntroduction';
import EventTimeline from '../components/events/EventTimeline';
import WeddingCountdown from '../components/countdown/WeddingCountdown';
import Footer from '../components/footer/Footer';
import FlowerPetals from '../components/effects/FlowerPetals';
import MusicToggle, { type MusicToggleProps } from '../components/music/MusicToggle';

export default function WeddingInvitation({ music }: { music: MusicToggleProps }) {
  const content = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [showScrollCue, setShowScrollCue] = useState(true);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    content.current?.focus({ preventScroll: true });
    const dismissCue = () => {
      if (window.scrollY > 16) {
        setShowScrollCue(false);
        window.removeEventListener('scroll', dismissCue);
      }
    };
    window.addEventListener('scroll', dismissCue, { passive: true });
    return () => window.removeEventListener('scroll', dismissCue);
  }, []);

  return (
    <motion.main ref={content} tabIndex={-1} className="invitation"
      initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <FlowerPetals />
      <MusicToggle {...music} />
      {/* <div className="blessing-screen"> */}
        <GaneshBlessing />
        {showScrollCue && <div className="blessing-scroll-slot">
          <a className="blessing-scroll-cue" href="#couple-names">
            Scroll to explore
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        </div>}
      {/* </div> */}
      <HeroSection />
      <CoupleIntroduction />
      <EventTimeline />
      <WeddingCountdown />
      {/* <VenueLocation /> */}
      <Footer />
    </motion.main>
  );
}
