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
    <Card variant="crystal" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <CardTitle className="text-lg tracking-crystal">Tier Distribution</CardTitle>
        <p className="text-xs text-muted-foreground tracking-refined">Member journey across privilege levels</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {tierOrder.map((tier, index) => {
          const config = TIER_CONFIG[tier];
          const count = distribution[tier];
          const percentage = Math.round((count / total) * 100);

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
                  <span className="text-xs text-muted-foreground hidden sm:inline font-body">
                    {config.arabicName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground font-body">{count}</span>
                  <span className="text-xs text-muted-foreground font-body">({percentage}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-crystal',
                    tier === 'black' ? 'bg-tier-black' :
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
