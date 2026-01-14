import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressArcProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  animated?: boolean;
}

const sizeConfig = {
  sm: { width: 80, fontSize: 'text-lg' },
  md: { width: 120, fontSize: 'text-2xl' },
  lg: { width: 160, fontSize: 'text-3xl' },
};

export function ProgressArc({
  progress,
  size = 'md',
  strokeWidth = 8,
  showLabel = true,
  label,
  sublabel,
  className,
  animated = true,
}: ProgressArcProps) {
  const config = sizeConfig[size];
  const radius = (config.width - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        {/* Background arc */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.width}
          height={config.width}
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Progress arc with crystal effect */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.width}
          height={config.width}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(42 60% 60%)" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: animated ? 1.5 : 0,
              ease: [0.23, 1, 0.32, 1],
            }}
          />
        </svg>
        
        {/* Glow effect on the progress */}
        <svg
          className="absolute inset-0 -rotate-90 blur-sm"
          width={config.width}
          height={config.width}
        >
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: animated ? 1.5 : 0,
              ease: [0.23, 1, 0.32, 1],
            }}
          />
        </svg>
        
        {/* Center content */}
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn(
                'font-display font-medium text-foreground tracking-crystal',
                config.fontSize
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {Math.round(clampedProgress)}%
            </motion.span>
            {sublabel && (
              <span className="text-xs text-muted-foreground tracking-refined mt-1">
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
      
      {label && (
        <span className="text-sm text-muted-foreground tracking-refined mt-3">
          {label}
        </span>
      )}
    </div>
  );
}