import { Guest, TIER_CONFIG } from '@/types/loyalty';
import { Badge } from '@/components/ui/badge';
import { Crown, Coffee, UtensilsCrossed, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  guest: Guest;
}

export function MemberCard({ guest }: MemberCardProps) {
  const tierConfig = TIER_CONFIG[guest.tier];
  const nextTierVisits = 
    guest.tier === 'initiation' ? 5 - guest.totalVisits :
    guest.tier === 'connoisseur' ? 15 - guest.totalVisits :
    guest.tier === 'elite' ? 30 - guest.totalVisits :
    guest.tier === 'inner-circle' ? 50 - guest.totalVisits : 0;

  const progressPercentage = 
    guest.tier === 'initiation' ? (guest.totalVisits / 5) * 100 :
    guest.tier === 'connoisseur' ? ((guest.totalVisits - 5) / 10) * 100 :
    guest.tier === 'elite' ? ((guest.totalVisits - 15) / 15) * 100 :
    guest.tier === 'inner-circle' ? ((guest.totalVisits - 30) / 20) * 100 : 100;

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Card */}
        <div 
          className={cn(
            'relative overflow-hidden rounded-3xl p-8 shadow-luxury',
            'bg-gradient-to-br from-card via-card to-noir',
            'border border-border/50',
            guest.tier === 'black' && 'border-primary/30 shadow-gold'
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-2xl font-semibold text-gradient-gold">RISE</h1>
                <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Holding</p>
              </div>
              <Crown className="h-8 w-8 text-primary" />
            </div>

            {/* Member Info */}
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Member</p>
                <h2 className="font-display text-2xl font-medium text-foreground">{guest.name}</h2>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={guest.tier as any} className="text-sm px-4 py-1.5">
                  {tierConfig.displayName}
                </Badge>
                <span className="text-sm text-muted-foreground font-display">{tierConfig.arabicName}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <p className="font-display text-4xl font-medium text-foreground">{guest.totalVisits}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Visits</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    {guest.favoriteBrand === 'noir' ? (
                      <Coffee className="h-5 w-5 text-foreground" />
                    ) : (
                      <UtensilsCrossed className="h-5 w-5 text-sasso-accent" />
                    )}
                    <span className="text-sm text-foreground">
                      {guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Preferred</p>
                </div>
              </div>

              {/* Progress to next tier */}
              {guest.tier !== 'black' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Journey to next tier</span>
                    <span className="text-primary font-medium">{nextTierVisits} visits away</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-gold rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Privileges */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display text-lg font-medium text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Your Privileges
          </h3>
          
          <div className="space-y-2">
            {tierConfig.privileges.map((privilege, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 animate-slide-up"
                style={{ animationDelay: `${300 + index * 50}ms` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-sm text-foreground">{privilege}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50">
            <Coffee className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">NOIR Café</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50">
            <UtensilsCrossed className="h-4 w-4 text-sasso-accent" />
            <span className="text-xs text-muted-foreground">SASSO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
