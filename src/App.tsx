import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { wedding } from './data/wedding';
import EnvelopeIntro from './components/envelope/EnvelopeIntro';
import { useWeddingAudio } from './components/music/useWeddingAudio';
import WeddingInvitation from './pages/WeddingInvitation';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const audio = useWeddingAudio();

  return (
    <>
      <audio ref={audio.audioRef} src={wedding.audio} loop preload="none"
        onPlay={audio.onPlay} onPause={audio.onPause} onError={audio.onError} />
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <EnvelopeIntro key="envelope" onOpen={() => setIsOpen(true)} onPlayMusic={audio.play} />
        ) : (
          <WeddingInvitation key="invitation" music={{ playing: audio.playing, unavailable: audio.unavailable, onToggle: audio.toggle }} />
        )}
      </AnimatePresence>
    </>
  );
}
