import { useEffect, useState } from 'react';
import { countdown, weddingDayStatus } from '../../utils/countdown';
import { wedding } from '../../data/wedding';
import { Reveal } from '../shared/Reveal';

export default function WeddingCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const status = weddingDayStatus(now);

  return (
    <section className="countdown section" aria-labelledby="countdown-title">
      <Reveal>
        <p className="eyebrow">Every moment brings us closer</p>
        <h2 id="countdown-title">Until our forever</h2>
        {status === 'today' ? <p>Today is the day! ❤️</p>
          : status === 'past' ? <p>Our beautiful new chapter has begun.</p>
            : <div className="clock">
              {countdown(now).map((value, i) => <div key={i}>
                <span>{String(value).padStart(2, '0')}</span>
                <small>{['Days', 'Hours', 'Minutes', 'Seconds'][i]}</small>
              </div>)}
            </div>}
        <p className="fine">{wedding.dateLabel} · {wedding.timeLabel} {wedding.timeZoneLabel}</p>
      </Reveal>
    </section>
  );
}
