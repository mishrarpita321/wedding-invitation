import { useState } from 'react';
import { motion } from 'framer-motion';

const colors = ['#ffcf24', '#ff9e19', '#ff527f', '#e93cf2', '#934bff', '#18c9ed', '#8cff52'];
const gravity = 650; // CSS pixels per second squared.
const times = Array.from({ length: 49 }, (_, index) => index / 48);
const random = (min: number, max: number) => min + Math.random() * (max - min);

function createParticles() {
  return Array.from({ length: 60 }, (_, index) => {
    // Most pieces reach 300–450px; lower arcs add depth to the fountain.
    const height = index % 4 === 0 ? random(140, 280) : random(300, 450);
    const velocityY = -Math.sqrt(2 * gravity * height);
    const distanceX = random(-180, 180);
    const originX = random(-22, 22);
    const originY = random(-9, 9);
    // Finish below the launch point, with time to see the pieces fall.
    const duration = (-velocityY + Math.sqrt(velocityY ** 2 + 2 * gravity * 150)) / gravity;
    const delay = random(0, 0.14);
    const strip = index % 3 !== 0;
    const rotation = random(0, 360);
    const rotationSpeed = random(260, 700) * (Math.random() < 0.5 ? -1 : 1);
    const tumbleSpeed = random(200, 650);
    const flutter = random(3, 9);
    const phase = random(0, Math.PI * 2);
    return {
      color: colors[index % colors.length],
      width: strip ? random(2, 4) : random(5, 9),
      height: strip ? random(12, 23) : random(4, 10),
      originX,
      originY,
      rotation,
      duration,
      delay,
      // Horizontal drag slows the initial spread; vertical acceleration is gravity.
      x: times.map(progress => {
        const time = progress * duration;
        const spread = (1 - Math.exp(-2.4 * time)) / (1 - Math.exp(-2.4 * duration));
        return originX + distanceX * spread + Math.sin(time * 9 + phase) * flutter * progress;
      }),
      y: times.map(progress => {
        const time = progress * duration;
        return originY + velocityY * time + 0.5 * gravity * time ** 2;
      }),
      rotate: [rotation, rotation + rotationSpeed * duration],
      rotateX: [random(0, 180), tumbleSpeed * duration],
    };
  });
}

export default function DateConfetti({ onComplete }: { onComplete: () => void }) {
  // Generate one burst per mount, never regenerating particles during scratching.
  const [particles] = useState(createParticles);
  const lastParticleIndex = particles.reduce((last, particle, index) =>
    particle.duration + particle.delay > particles[last].duration + particles[last].delay ? index : last, 0);

  return (
    <div className="scratch-celebration" aria-hidden="true">
      {particles.map((particle, index) => (
        <motion.span key={index} className="scratch-particle"
          style={{ backgroundColor: particle.color, width: particle.width, height: particle.height }}
          initial={{ x: particle.originX, y: particle.originY, opacity: 0, rotate: particle.rotation }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: [0, 1, 1, 0],
            scale: [0.85, 1, 1, 0.8],
            rotate: particle.rotate,
            rotateX: particle.rotateX,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'linear',
            opacity: { duration: particle.duration, delay: particle.delay, ease: 'linear', times: [0, 0.025, 0.8, 1] },
            scale: { duration: particle.duration, delay: particle.delay, ease: 'linear', times: [0, 0.08, 0.8, 1] },
          }}
          onAnimationComplete={index === lastParticleIndex ? onComplete : undefined} />
      ))}
    </div>
  );
}
