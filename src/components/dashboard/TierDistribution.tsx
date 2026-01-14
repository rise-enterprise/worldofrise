import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TIER_CONFIG, Tier } from '@/types/loyalty';
import { cn } from '@/lib/utils';

interface TierDistributionProps {
  distribution: Record<Tier, number>;
}

const tierOrder: Tier[] = ['black', 'inner-circle', 'elite', 'connoisseur', 'initiation'];

export function TierDistribution({ distribution }: TierDistributionProps) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <CardTitle className="text-lg tracking-wide font-display">Privilege Hierarchy</CardTitle>
        <p className="text-xs text-muted-foreground/60 tracking-refined">Member journey across privilege levels</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {tierOrder.map((tier, index) => {
          const config = TIER_CONFIG[tier];
          const count = distribution[tier];
          const percentage = Math.round((count / total) * 100);
          const isTopTier = tier === 'black' || tier === 'inner-circle';

          return (
            <div 
              key={tier} 
              className="animate-slide-up"
              style={{ animationDelay: `${400 + index * 150}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant={tier as any} className="text-xs tracking-refined">
                    {config.displayName}
                  </Badge>
                  <span className="text-xs text-muted-foreground/50 hidden sm:inline font-body">
                    {config.arabicName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm font-medium font-display",
                    isTopTier ? "text-primary" : "text-foreground"
                  )}>{count}</span>
                  <span className="text-xs text-muted-foreground/50 font-body">({percentage}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-[#0B0D11] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    tier === 'black' ? 'bg-gradient-to-r from-primary to-primary/60' :
                    tier === 'inner-circle' ? 'bg-tier-inner-circle' :
                    tier === 'elite' ? 'bg-tier-elite' :
                    tier === 'connoisseur' ? 'bg-tier-connoisseur' :
                    'bg-tier-initiation'
                  )}
                  style={{ 
                    width: `${percentage}%`,
                    animationDelay: `${600 + index * 150}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
