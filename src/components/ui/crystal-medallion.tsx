import { cn } from '@/lib/utils';
import { Crown, Diamond, Shield, Sparkles } from 'lucide-react';

type TierLevel = 'crystal' | 'onyx' | 'obsidian' | 'royal';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface CrystalMedallionProps {
  tier: TierLevel | string;
  size?: Size;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

const tierConfig: Record<TierLevel, {
  icon: React.ElementType;
  gradient: string;
  border: string;
  glow: string;
  label: string;
  arabicLabel: string;
}> = {
  crystal: {
    icon: Diamond,
    gradient: 'from-slate-200 via-white to-slate-300',
    border: 'border-slate-300/50',
    glow: 'shadow-[0_0_30px_rgba(226,232,240,0.3)]',
    label: 'Crystal',
    arabicLabel: 'كريستال',
  },
  onyx: {
    icon: Shield,
    gradient: 'from-zinc-800 via-zinc-900 to-black',
    border: 'border-zinc-600/50',
    glow: 'shadow-[0_0_30px_rgba(39,39,42,0.5)]',
    label: 'Onyx',
    arabicLabel: 'أونيكس',
  },
  obsidian: {
    icon: Crown,
    gradient: 'from-zinc-900 via-black to-zinc-800',
    border: 'border-primary/30',
    glow: 'shadow-[0_0_40px_rgba(200,162,74,0.2)]',
    label: 'Obsidian',
    arabicLabel: 'أوبسيديان',
  },
  royal: {
    icon: Crown,
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    border: 'border-primary/50',
    glow: 'shadow-[0_0_50px_rgba(200,162,74,0.4)]',
    label: 'Royal',
    arabicLabel: 'ملكي',
  },
};

const sizeConfig: Record<Size, {
  container: string;
  icon: string;
  label: string;
}> = {
  sm: {
    container: 'w-12 h-12',
    icon: 'w-5 h-5',
    label: 'text-xs',
  },
  md: {
    container: 'w-20 h-20',
    icon: 'w-8 h-8',
    label: 'text-sm',
  },
  lg: {
    container: 'w-28 h-28',
    icon: 'w-10 h-10',
    label: 'text-base',
  },
  xl: {
    container: 'w-36 h-36',
    icon: 'w-14 h-14',
    label: 'text-lg',
  },
};

// Map legacy tier names to new system
function mapToTierLevel(tier: string): TierLevel {
  const normalized = tier.toLowerCase();
  if (normalized.includes('royal') || normalized.includes('black') || normalized.includes('inner')) return 'royal';
  if (normalized.includes('obsidian') || normalized.includes('elite')) return 'obsidian';
  if (normalized.includes('onyx') || normalized.includes('connoisseur')) return 'onyx';
  return 'crystal';
}

export function CrystalMedallion({ 
  tier, 
  size = 'md', 
  animated = true,
  showLabel = false,
  className 
}: CrystalMedallionProps) {
  const tierLevel = mapToTierLevel(tier);
  const config = tierConfig[tierLevel];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div 
        className={cn(
          'relative flex items-center justify-center rounded-full',
          sizeStyles.container,
          config.glow,
          animated && 'animate-gentle-pulse'
        )}
      >
        {/* Outer ring with metallic effect */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br',
          config.gradient,
          config.border,
          'border-2'
        )} />
        
        {/* Inner medallion */}
        <div className={cn(
          'absolute inset-1.5 rounded-full bg-gradient-to-br',
          config.gradient,
          'opacity-90'
        )} />
        
        {/* Shine effect */}
        <div className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-tr from-white/30 via-transparent to-transparent',
          animated && 'animate-medallion-shine'
        )} />
        
        {/* Icon */}
        <Icon className={cn(
          sizeStyles.icon,
          tierLevel === 'royal' ? 'text-zinc-900' : 'text-foreground/90',
          'relative z-10 drop-shadow-lg'
        )} />
        
        {/* Crystal refraction effect */}
        {animated && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/40 via-transparent to-transparent animate-crystal-prism" />
          </div>
        )}
      </div>
      
      {showLabel && (
        <span className={cn(
          'font-display tracking-crystal text-foreground',
          sizeStyles.label
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
}