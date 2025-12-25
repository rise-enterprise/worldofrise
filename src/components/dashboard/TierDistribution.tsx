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
    <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <CardTitle className="text-lg">Tier Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">Member journey across privilege levels</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {tierOrder.map((tier, index) => {
          const config = TIER_CONFIG[tier];
          const count = distribution[tier];
          const percentage = Math.round((count / total) * 100);

          return (
            <div 
              key={tier} 
              className="animate-slide-up"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant={tier as any} className="text-xs">
                    {config.displayName}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {config.arabicName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    tier === 'black' ? 'bg-gradient-gold' :
                    tier === 'inner-circle' ? 'bg-tier-inner-circle' :
                    tier === 'elite' ? 'bg-tier-elite' :
                    tier === 'connoisseur' ? 'bg-tier-connoisseur' :
                    'bg-muted-foreground'
                  )}
                  style={{ 
                    width: `${percentage}%`,
                    animationDelay: `${500 + index * 100}ms`
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
