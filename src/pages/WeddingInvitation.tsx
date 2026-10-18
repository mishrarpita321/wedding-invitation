import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GaneshBlessing from '../components/blessing/GaneshBlessing';
import HeroSection from '../components/hero/HeroSection';
import CoupleIntroduction from '../components/couple/CoupleIntroduction';
import EventTimeline from '../components/events/EventTimeline';
import WeddingCountdown from '../components/countdown/WeddingCountdown';
import VenueLocation from '../components/location/VenueLocation';
import Footer from '../components/footer/Footer';
import FlowerPetals from '../components/effects/FlowerPetals';
import MusicToggle, { type MusicToggleProps } from '../components/music/MusicToggle';

export default function WeddingInvitation({ music }: { music: MusicToggleProps }) {
  const content = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    content.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.main ref={content} tabIndex={-1} className="invitation"
      initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <FlowerPetals />
      <MusicToggle {...music} />
      <GaneshBlessing />
      <HeroSection />
      <CoupleIntroduction />
      <EventTimeline />
      <WeddingCountdown />
      <VenueLocation />
      <Footer />
    </motion.main>
  );
}
