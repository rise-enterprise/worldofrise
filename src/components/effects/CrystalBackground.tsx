import { cn } from '@/lib/utils';

interface CrystalBackgroundProps {
  variant?: 'subtle' | 'ambient' | 'full';
  className?: string;
  children?: React.ReactNode;
}

export function CrystalBackground({ 
  variant = 'subtle', 
  className, 
  children 
}: CrystalBackgroundProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-accent/20" />
      
      {/* Shimmer layer - horizontal light sweep */}
      {(variant === 'full' || variant === 'ambient') && (
        <div className="absolute inset-0 crystal-shimmer opacity-[0.04]" />
      )}
      
      {/* Ambient orb 1 - top left */}
      {(variant === 'full' || variant === 'ambient') && (
        <div 
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full crystal-ambient-1"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)',
          }}
        />
      )}
      
      {/* Ambient orb 2 - bottom right */}
      {(variant === 'full' || variant === 'ambient') && (
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full crystal-ambient-2"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.05) 0%, transparent 70%)',
          }}
        />
      )}
      
      {/* Ambient orb 3 - center (full only) */}
      {variant === 'full' && (
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3/4 h-1/2 rounded-full crystal-ambient-3"
          style={{
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.02) 0%, transparent 60%)',
          }}
        />
      )}
      
      {/* Light refraction overlay */}
      {variant === 'full' && (
        <div className="absolute inset-0 crystal-refract opacity-[0.03]" />
      )}
      
      {/* Vertical crystal accent lines */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent crystal-line-pulse" />
      <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent crystal-line-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Additional accent lines for full variant */}
      {variant === 'full' && (
        <>
          <div className="absolute left-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/15 to-transparent crystal-line-pulse" style={{ animationDelay: '4s' }} />
          <div className="absolute right-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/15 to-transparent crystal-line-pulse" style={{ animationDelay: '6s' }} />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}