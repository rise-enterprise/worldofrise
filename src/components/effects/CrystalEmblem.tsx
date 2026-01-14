import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CrystalEmblemProps {
  className?: string;
}

export function CrystalEmblem({ className }: CrystalEmblemProps) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer glow */}
      <motion.div
        className="absolute w-[320px] h-[320px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--gold) / 0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Crystal facets container */}
      <div className="relative w-[280px] h-[280px]">
        {/* Diamond shape background */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {/* Outer diamond border */}
          <div
            className="absolute w-[200px] h-[200px] rotate-45"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gold) / 0.3) 0%, transparent 50%, hsl(var(--gold) / 0.2) 100%)',
              border: '1px solid hsl(var(--gold) / 0.4)',
              boxShadow: `
                0 0 60px hsl(var(--gold) / 0.2),
                inset 0 0 40px hsl(var(--gold) / 0.1)
              `,
            }}
          />

          {/* Inner diamond */}
          <div
            className="absolute w-[160px] h-[160px] rotate-45"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--background) / 0.9) 0%, hsl(var(--noir-obsidian) / 0.8) 100%)',
              border: '1px solid hsl(var(--gold) / 0.3)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* Crystal facet lines */}
          <svg
            className="absolute w-[200px] h-[200px] rotate-45"
            viewBox="0 0 200 200"
            fill="none"
          >
            {/* Diagonal facet lines */}
            <line x1="100" y1="0" x2="100" y2="200" stroke="hsl(var(--gold) / 0.2)" strokeWidth="0.5" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="hsl(var(--gold) / 0.2)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="200" y2="200" stroke="hsl(var(--gold) / 0.15)" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="0" y2="200" stroke="hsl(var(--gold) / 0.15)" strokeWidth="0.5" />
          </svg>
        </motion.div>

        {/* Prismatic light sweep */}
        <motion.div
          className="absolute inset-0 overflow-hidden rotate-45"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        >
          <motion.div
            className="absolute w-[50px] h-[300%] -top-[100%]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.3) 50%, transparent 100%)',
            }}
            animate={{
              x: [-100, 300],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Center text */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <span
            className="text-4xl font-display tracking-[0.5em] font-light"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--gold)) 0%, hsl(var(--gold-muted)) 50%, hsl(var(--gold)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px hsl(var(--gold) / 0.3)',
            }}
          >
            RISE
          </span>
          <div
            className="w-16 h-[1px] mt-2"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.6), transparent)',
            }}
          />
        </motion.div>

        {/* Corner sparkles */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.div
            key={angle}
            className="absolute w-2 h-2"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translateY(-100px)`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="w-full h-full rotate-45"
              style={{
                background: 'hsl(var(--gold))',
                boxShadow: '0 0 10px hsl(var(--gold) / 0.8)',
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
