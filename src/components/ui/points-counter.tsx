import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useSpring, useTransform } from 'framer-motion';

interface PointsCounterProps {
  value: number;
  duration?: number;
  className?: string;
  label?: string;
  showParticles?: boolean;
}

export function PointsCounter({
  value,
  duration = 2000,
  className,
  label,
  showParticles = true,
}: PointsCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  
  useEffect(() => {
    spring.set(value);
    
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    
    return () => unsubscribe();
  }, [value, spring]);

  const formattedValue = displayValue.toLocaleString();

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      {label && (
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-2">
          {label}
        </span>
      )}
      
      <div className="relative">
        {/* Gold particle effects */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/60"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
                  y: [0, -(15 + i * 8)],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                style={{
                  left: '50%',
                  bottom: '50%',
                }}
              />
            ))}
          </div>
        )}
        
        {/* Number display */}
        <motion.span
          className={cn(
            'font-display text-4xl md:text-5xl font-medium tracking-crystal',
            'bg-gradient-to-br from-primary via-primary to-gold-shadow',
            'bg-clip-text text-transparent'
          )}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3, delay: duration / 1000 }}
        >
          {formattedValue}
        </motion.span>
        
        {/* Subtle glow behind */}
        <div className="absolute inset-0 blur-xl bg-primary/10 -z-10" />
      </div>
    </div>
  );
}