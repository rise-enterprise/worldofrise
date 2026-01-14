import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TIER_CONFIG, Tier } from '@/types/loyalty';
import { cn } from '@/lib/utils';
import { CrystalMedallion } from '@/components/ui/crystal-medallion';
import { motion } from 'framer-motion';

interface TierDistributionProps {
  distribution: Record<Tier, number>;
}

const tierOrder: Tier[] = ['black', 'inner-circle', 'elite', 'connoisseur', 'initiation'];

// Map tiers to medallion types
const tierToMedallion: Record<Tier, string> = {
  'black': 'royal',
  'inner-circle': 'royal',
  'elite': 'obsidian',
  'connoisseur': 'onyx',
  'initiation': 'crystal',
};

export function TierDistribution({ distribution }: TierDistributionProps) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <Card variant="obsidian" className="animate-slide-up relative overflow-hidden" style={{ animationDelay: '200ms' }}>
      {/* Crystal corner accents */}
      <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
      <div className="absolute top-0 right-0 w-8 h-px bg-gradient-to-l from-primary/50 to-transparent" />
      <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
          <CardTitle className="text-lg tracking-wide font-display">Privilege Hierarchy</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground/60 tracking-refined ml-3">Member journey across privilege levels</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {tierOrder.map((tier, index) => {
          const config = TIER_CONFIG[tier];
          const count = distribution[tier] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const isTopTier = tier === 'black' || tier === 'inner-circle';

          return (
            <motion.div 
              key={tier} 
              className="group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Crystal Medallion */}
                  <CrystalMedallion 
                    tier={tierToMedallion[tier]} 
                    size="sm" 
                    animated={isTopTier}
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="flex flex-col">
                    <Badge variant={tier as any} className="text-xs tracking-refined">
                      {config.displayName}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/40 hidden sm:inline font-body mt-0.5">
                      {config.arabicName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.span 
                    className={cn(
                      "text-sm font-medium font-display",
                      isTopTier ? "text-primary" : "text-foreground"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {count.toLocaleString()}
                  </motion.span>
                  <span className="text-xs text-muted-foreground/50 font-body">({percentage}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-[#0B0D11] rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    tier === 'black' ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/60' :
                    tier === 'inner-circle' ? 'bg-gradient-to-r from-amber-500 to-amber-600/60' :
                    tier === 'elite' ? 'bg-gradient-to-r from-zinc-400 to-zinc-500/60' :
                    tier === 'connoisseur' ? 'bg-gradient-to-r from-zinc-500 to-zinc-600/60' :
                    'bg-gradient-to-r from-slate-500 to-slate-600/60'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
        
        {/* Total indicator */}
        <motion.div 
          className="pt-4 border-t border-[rgba(217,222,231,0.08)] flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-xs text-muted-foreground/60 tracking-refined uppercase">Total Members</span>
          <span className="font-display text-lg text-primary">{total.toLocaleString()}</span>
        </motion.div>
      </CardContent>
    </Card>
  );
}
