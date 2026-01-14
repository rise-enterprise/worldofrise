import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DiamondSparklesProps {
  count?: number;
  className?: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function DiamondSparkles({ count = 30, className }: DiamondSparklesProps) {
  const sparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: seededRandom(i * 1.5) * 100,
      y: seededRandom(i * 2.3) * 100,
      size: 2 + seededRandom(i * 3.7) * 4,
      delay: seededRandom(i * 4.1) * 5,
      duration: 2 + seededRandom(i * 5.9) * 3,
    }));
  }, [count]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Diamond shape */}
          <div
            className="w-full h-full rotate-45"
            style={{
              background: `linear-gradient(135deg, 
                hsl(var(--gold) / 0.9) 0%, 
                hsl(0 0% 100% / 0.9) 50%, 
                hsl(var(--gold) / 0.9) 100%
              )`,
              boxShadow: `
                0 0 ${sparkle.size * 2}px hsl(var(--gold) / 0.6),
                0 0 ${sparkle.size * 4}px hsl(var(--gold) / 0.3)
              `,
            }}
          />
        </motion.div>
      ))}

      {/* Large prismatic flares */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={`flare-${i}`}
          className="absolute w-1 h-20"
          style={{
            left: `${20 + i * 25}%`,
            top: `${30 + i * 15}%`,
            background: `linear-gradient(180deg, 
              transparent 0%, 
              hsl(var(--gold) / 0.2) 30%,
              hsl(var(--gold) / 0.4) 50%,
              hsl(var(--gold) / 0.2) 70%,
              transparent 100%
            )`,
            transform: 'rotate(45deg)',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleY: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + i,
            delay: i * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
