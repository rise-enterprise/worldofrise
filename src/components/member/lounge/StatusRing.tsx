import { motion } from 'framer-motion';
import type { Guest, TierConfig } from '@/types/loyalty';

interface StatusRingProps {
  member: Guest;
  tiers: TierConfig[];
}

export function StatusRing({ member, tiers }: StatusRingProps) {
  const sortedTiers = [...tiers].sort((a, b) => a.minVisits - b.minVisits);
  const currentTierIndex = sortedTiers.findIndex(t => t.displayName === member.tierName);
  const nextTier = sortedTiers[currentTierIndex + 1];
  const currentMin = sortedTiers[currentTierIndex]?.minVisits || 0;
  const nextMin = nextTier?.minVisits;
  const progress = nextMin
    ? Math.min(100, ((member.totalVisits - currentMin) / (nextMin - currentMin)) * 100)
    : 100;
  const visitsToNext = nextMin ? nextMin - member.totalVisits : 0;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="flex flex-col items-center px-6 pb-12"
    >
      <div className="flex items-center gap-10">
        {/* Status ring */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Track */}
            <circle cx="60" cy="60" r="54" fill="none"
              stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Progress */}
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ delay: 1.2, duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
            />
            {/* Glow dot at end */}
            <motion.circle
              cx="60" cy="6" r="3" fill="hsl(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4] }}
              transition={{ delay: 2.5, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-display text-foreground">{member.totalVisits}</span>
            <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">Visits</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-display text-foreground">{member.totalPoints || 0}</p>
            <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">Privileges</p>
          </div>
          {nextTier && (
            <div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary">{visitsToNext}</span> visit{visitsToNext !== 1 ? 's' : ''} to
              </p>
              <p className="text-xs text-foreground font-display tracking-wide">{nextTier.displayName}</p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
