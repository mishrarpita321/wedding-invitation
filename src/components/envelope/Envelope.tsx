import { motion, useReducedMotion } from 'framer-motion';
import { pressFeedback } from '../../utils/press';
import { wedding } from '../../data/wedding';
import sealLogo from '../../../assets/LogoOnWaxSeal.png';
import monogram from '../../../assets/ASLogo.png';

interface EnvelopeProps {
  opening: boolean;
  onOpen: () => void;
}

export default function Envelope({ opening, onOpen }: EnvelopeProps) {
  const reduced = useReducedMotion();
  return (
    <div className={`envelope ${opening ? 'is-open' : ''}`}>
      <span className="envelope-back" />
      <div className="invitation-card">
        <img className="card-monogram" src={monogram} alt="Arpita and Swagat monogram" />
        <small>TOGETHER WITH THEIR FAMILIES</small>
        <span className="card-names stationery-names">{wedding.bride.firstName} <span className="names-ampersand">&</span> {wedding.groom.firstName}</span>
        <small>REQUEST THE PLEASURE OF YOUR COMPANY</small>
      </div>
      <span className="envelope-front" />
      <span className="envelope-flap" />
      <div className="seal-position">
        <motion.button type="button" className="wax-seal" onClick={onOpen} disabled={opening}
          aria-label="Open Arpita and Swagat’s wedding invitation"
          animate={opening ? { opacity: 0, scale: reduced ? 1 : 1.15 } : reduced ? {} : { y: [0, -2, 0] }}
          transition={opening ? { duration: reduced ? 0 : 0.4 } : { type: 'tween', duration: 0.16, ease: 'easeOut', y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } }}
          whileHover={reduced || opening ? undefined : { scale: 1.04, transition: { type: 'tween', duration: 0.16, repeat: 0 } }}
          whileTap={opening ? undefined : pressFeedback(reduced, 0.95)}>
          <img src={sealLogo} alt="" draggable={false} />
        </motion.button>
      </div>
      <span aria-hidden="true" className="envelope-vine vine-left">❦</span>
      <span aria-hidden="true" className="envelope-vine vine-right">❦</span>
    </div>
  );
}
