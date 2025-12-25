import { TIER_CONFIG, Tier } from '@/types/loyalty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Star, Crown, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const tierOrder: Tier[] = ['initiation', 'connoisseur', 'elite', 'inner-circle', 'black'];

export function PrivilegesView() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Privileges & Rewards
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage tier privileges and exclusive experiences across RISE brands
          </p>
        </div>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Add New Privilege
        </Button>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tierOrder.map((tier, index) => {
          const config = TIER_CONFIG[tier];
          return (
            <Card 
              key={tier}
              variant="elevated"
              className={cn(
                'animate-slide-up relative overflow-hidden',
                tier === 'black' && 'border-primary/30 shadow-gold'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier === 'black' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent" />
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tier === 'black' ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Star className="h-5 w-5 text-primary" />
                    )}
                    <CardTitle className="font-display text-lg">{config.displayName}</CardTitle>
                  </div>
                  <Badge variant={tier as any}>{config.arabicName}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.minVisits === 0 ? 'Starting tier' : `${config.minVisits}+ visits required`}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {config.privileges.map((privilege, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{privilege}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Special Privileges Section */}
      <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Special & Seasonal Privileges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-muted/50 to-transparent">
              <h4 className="font-medium text-foreground mb-1">Birthday Celebration</h4>
              <p className="text-sm text-muted-foreground">Complimentary signature experience on member's birthday</p>
              <Badge variant="outline" className="mt-2">All Tiers</Badge>
            </div>
            <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-muted/50 to-transparent">
              <h4 className="font-medium text-foreground mb-1">Anniversary Milestone</h4>
              <p className="text-sm text-muted-foreground">Special recognition at 10, 25, 50 visit milestones</p>
              <Badge variant="outline" className="mt-2">Connoisseur+</Badge>
            </div>
            <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-muted/50 to-transparent">
              <h4 className="font-medium text-foreground mb-1">Ramadan Exclusive</h4>
              <p className="text-sm text-muted-foreground">Special iftar experiences and seasonal offerings</p>
              <Badge variant="outline" className="mt-2">Élite+</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
