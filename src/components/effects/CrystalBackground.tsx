import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface CrystalBackgroundProps {
  variant?: 'subtle' | 'ambient' | 'full' | 'intense';
  className?: string;
  children?: React.ReactNode;
}

// Generate deterministic pseudo-random values for consistent rendering
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

interface CrystalStrand {
  left: string;
  height: string;
  width: string;
  opacity: number;
  delay: string;
  duration: string;
  top: string;
}

interface CrystalSparkle {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
}

interface CrystalGlint {
  left: string;
  top: string;
  delay: string;
  size: number;
}

export function CrystalBackground({ 
  variant = 'subtle', 
  className, 
  children 
}: CrystalBackgroundProps) {
  
  // Generate crystal strands based on variant
  const strandCount = variant === 'intense' ? 28 : variant === 'full' ? 22 : variant === 'ambient' ? 14 : 8;
  const sparkleCount = variant === 'intense' ? 35 : variant === 'full' ? 25 : variant === 'ambient' ? 12 : 0;
  const glintCount = variant === 'intense' ? 14 : variant === 'full' ? 10 : variant === 'ambient' ? 5 : 0;
  
  const strands = useMemo<CrystalStrand[]>(() => {
    return Array.from({ length: strandCount }, (_, i) => ({
      left: `${seededRandom(i * 7) * 100}%`,
      height: `${40 + seededRandom(i * 13) * 60}%`,
      width: `${0.5 + seededRandom(i * 17) * 1.5}px`,
      opacity: 0.1 + seededRandom(i * 23) * 0.25,
      delay: `${seededRandom(i * 31) * 8}s`,
      duration: `${8 + seededRandom(i * 37) * 6}s`,
      top: `${seededRandom(i * 41) * 15}%`,
    }));
  }, [strandCount]);
  
  const sparkles = useMemo<CrystalSparkle[]>(() => {
    return Array.from({ length: sparkleCount }, (_, i) => ({
      left: `${5 + seededRandom(i * 11) * 90}%`,
      top: `${5 + seededRandom(i * 19) * 70}%`,
      size: 4 + seededRandom(i * 29) * 8,
      delay: `${seededRandom(i * 43) * 6}s`,
      duration: `${3 + seededRandom(i * 47) * 4}s`,
    }));
  }, [sparkleCount]);
  
  const glints = useMemo<CrystalGlint[]>(() => {
    return Array.from({ length: glintCount }, (_, i) => ({
      left: `${10 + seededRandom(i * 53) * 80}%`,
      top: `${10 + seededRandom(i * 59) * 60}%`,
      delay: `${seededRandom(i * 61) * 8}s`,
      size: 2 + seededRandom(i * 67) * 4,
    }));
  }, [glintCount]);

  const showWarmGradient = variant === 'full' || variant === 'intense';
  const showSparkles = variant !== 'subtle';
  const showGlints = variant === 'full' || variant === 'intense';
  const showDepthLayer = variant === 'full' || variant === 'intense';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-accent/20" />
      
      {/* Warm amber gradient at top (chandelier glow) */}
      {showWarmGradient && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, hsl(35 40% 55% / 0.06) 0%, hsl(35 30% 50% / 0.03) 25%, transparent 50%)',
          }}
        />
      )}
      
      {/* Depth blur layer - background crystals */}
      {showDepthLayer && (
        <div className="absolute inset-0 pointer-events-none" style={{ filter: 'blur(4px)' }}>
          {strands.slice(0, Math.floor(strandCount / 3)).map((strand, i) => (
            <div
              key={`depth-${i}`}
              className="absolute crystal-strand-glow-slow"
              style={{
                left: strand.left,
                top: strand.top,
                width: `${parseFloat(strand.width) * 2}px`,
                height: strand.height,
                background: `linear-gradient(180deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)`,
                opacity: strand.opacity * 0.5,
                animationDelay: strand.delay,
                animationDuration: strand.duration,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Shimmer layer - horizontal light sweep */}
      {(variant === 'full' || variant === 'ambient' || variant === 'intense') && (
        <div className="absolute inset-0 crystal-shimmer opacity-[0.04]" 
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      
      {/* Vertical crystal strands */}
      {strands.map((strand, i) => (
        <div
          key={`strand-${i}`}
          className="absolute crystal-strand-glow"
          style={{
            left: strand.left,
            top: strand.top,
            width: strand.width,
            height: strand.height,
            background: `linear-gradient(180deg, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0.2) 30%, hsl(var(--border) / 0.15) 70%, transparent 100%)`,
            opacity: strand.opacity,
            animationDelay: strand.delay,
            animationDuration: strand.duration,
            boxShadow: '0 0 4px hsl(var(--primary) / 0.1)',
          }}
        />
      ))}
      
      {/* Diamond sparkles */}
      {showSparkles && sparkles.map((sparkle, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute crystal-twinkle pointer-events-none"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.3) 100%)',
            transform: 'rotate(45deg)',
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
            boxShadow: `0 0 ${sparkle.size}px hsl(var(--primary) / 0.3)`,
          }}
        />
      ))}
      
      {/* Light glints */}
      {showGlints && glints.map((glint, i) => (
        <div
          key={`glint-${i}`}
          className="absolute crystal-glint pointer-events-none rounded-full"
          style={{
            left: glint.left,
            top: glint.top,
            width: `${glint.size}px`,
            height: `${glint.size}px`,
            background: 'hsl(var(--primary-foreground))',
            animationDelay: glint.delay,
            boxShadow: `0 0 ${glint.size * 3}px ${glint.size}px hsl(var(--primary) / 0.5)`,
          }}
        />
      ))}
      
      {/* Ambient orbs */}
      {(variant === 'full' || variant === 'ambient' || variant === 'intense') && (
        <>
          <div 
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full crystal-ambient-1"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)',
            }}
          />
          <div 
            className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full crystal-ambient-2"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent) / 0.06) 0%, transparent 70%)',
            }}
          />
        </>
      )}
      
      {/* Center ambient for intense variant */}
      {variant === 'intense' && (
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 rounded-full crystal-ambient-3"
          style={{
            background: 'radial-gradient(ellipse, hsl(35 40% 60% / 0.04) 0%, transparent 60%)',
          }}
        />
      )}
      
      {/* Light refraction overlay */}
      {(variant === 'full' || variant === 'intense') && (
        <div className="absolute inset-0 crystal-refract opacity-[0.03]" 
          style={{
            background: 'linear-gradient(135deg, hsl(200 30% 70% / 0.05) 0%, transparent 50%, hsl(35 30% 60% / 0.03) 100%)',
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
