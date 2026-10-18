import { wedding } from '../../data/wedding';

interface PhotoProps {
  name: keyof typeof wedding.photos;
  alt: string;
  className?: string;
  eager?: boolean;
}

export function Photo({ name, alt, className = '', eager = false }: PhotoProps) {
  return <img className={className} src={wedding.photos[name]}
    srcSet={`/assets/${name}-small.webp 800w, ${wedding.photos[name]} 1800w`}
    sizes="(max-width: 600px) 100vw, 60vw" alt={alt}
    loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}
