import { useEffect, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { countdown, weddingDayStatus } from '../../utils/countdown';
import { wedding } from '../../data/wedding';
import { Lotus } from '../shared/Ornaments';

export default function WeddingCountdown() {
  const reduced = useReducedMotion();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const status = weddingDayStatus(now);
  const entrance: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.45, ease: 'easeOut' } },
  };

  return (
    <section className="countdown section" aria-labelledby="countdown-title">
      <motion.div className="countdown-composition" initial={reduced ? false : 'hidden'}
        whileInView="visible" viewport={{ once: true, amount: 0.25 }}
        transition={{ staggerChildren: reduced ? 0 : 0.08 }}>
        <motion.p className="eyebrow" variants={entrance}>With every passing moment</motion.p>
        <motion.h2 id="countdown-title" variants={entrance}>Closer to forever</motion.h2>
        <motion.div className="countdown-ornament" aria-hidden="true"
          variants={{ hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : 0.45 } } }}>
          <Lotus />
        </motion.div>
        <motion.div variants={entrance}>
          {status === 'today' ? <p className="countdown-message">Today is the day! ❤️</p>
            : status === 'past' ? <p className="countdown-message">Our beautiful new chapter has begun.</p>
              : <div className="clock" role="timer" aria-label="Time until our wedding" aria-live="off">
                {countdown(now).map((value, i) => <div key={i}>
                  <span>{String(value).padStart(2, '0')}</span>
                  <small>{['Days', 'Hours', 'Minutes', 'Seconds'][i]}</small>
                </div>)}
              </div>}
        </motion.div>
        {/* <motion.div className="countdown-date" variants={entrance}>
          <p><time dateTime={wedding.date}>{wedding.dateLabel}</time></p>
          <p className="countdown-place"><time dateTime={wedding.date} title={`${wedding.timeLabel} ${wedding.timeZoneLabel}`}>{wedding.timeLabel}</time> · {wedding.location.split(',')[0]}</p>
        </motion.div> */}
      </motion.div>
    </section>
  );
}
