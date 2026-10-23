import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { wedding } from '../../data/wedding';
import { Flourish } from '../shared/Ornaments';
import ganeshLogo from '../../../assets/GaneshLogo.png';
import './blessing.css';

export default function GaneshBlessing() {
  const reduced = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };
  return (
    <motion.section className="section ganesh-blessing" aria-label="Lord Ganesha’s blessing"
      initial={reduced ? false : 'hidden'} animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
      <div className="blessing-content">
        <motion.p className="sanskrit invocation" lang="hi" variants={item}>॥ श्री गणेशाय नमः ॥</motion.p>
        <motion.div variants={item}><img className="ganesh" src={ganeshLogo} alt="Lord Ganesha" /></motion.div>
        <motion.p className="sanskrit shloka" lang="hi" variants={item}>
          वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।<br />
          निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
        </motion.p>
        <motion.p className="blessing-meaning" variants={item}>
          With the blessings of almighty,<br />
          we cordially invite you to<br /> grace the wedding <br />of our beloved daughter.<br />
        </motion.p>
        <motion.div variants={item}><Flourish /></motion.div>
      </div>
    </motion.section>
  );
}
