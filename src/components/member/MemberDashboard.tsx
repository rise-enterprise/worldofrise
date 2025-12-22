import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { Crown, Coffee, UtensilsCrossed, Sparkles, Gift, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function MemberDashboard() {
  const { member, tier, isLoading } = useMemberAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Unable to load member data</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Calculate tier progress
  const tierThresholds = [
    { name: 'Initiation', min: 0, max: 5 },
    { name: 'Connoisseur', min: 5, max: 15 },
    { name: 'Elite', min: 15, max: 30 },
    { name: 'Inner Circle', min: 30, max: 50 },
    { name: 'RISE Black', min: 50, max: Infinity },
  ];

  const currentTierIndex = tierThresholds.findIndex(
    t => member.total_visits >= t.min && member.total_visits < t.max
  );
  const currentTier = tierThresholds[currentTierIndex] || tierThresholds[0];
  const nextTier = tierThresholds[currentTierIndex + 1];
  
  const progressPercent = nextTier 
    ? ((member.total_visits - currentTier.min) / (currentTier.max - currentTier.min)) * 100
    : 100;
  
  const visitsToNext = nextTier ? nextTier.min - member.total_visits : 0;

  return (
    <div className="py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Welcome Header */}
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-2">Welcome back</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            {member.full_name}
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1.5 border-primary/30 text-primary">
            {tier?.name || currentTier.name}
          </Badge>
        </div>

        {/* Status Card */}
        <div className="bg-card border border-border/50 rounded-3xl p-8 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visits */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Visits</p>
                  <p className="font-display text-3xl font-semibold text-foreground">
                    {member.total_visits}
                  </p>
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Points Balance</p>
                  <p className="font-display text-3xl font-semibold text-foreground">
                    {member.total_points.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Journey to {nextTier.name}</span>
                <span className="text-sm text-primary font-medium">{visitsToNext} visits away</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <button 
            onClick={() => navigate('/rewards')}
            className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-left"
          >
            <Gift className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
              Rewards
            </h3>
            <p className="text-sm text-muted-foreground">Redeem your points</p>
          </button>

          <button 
            onClick={() => navigate('/member/history')}
            className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-left"
          >
            <Calendar className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
              History
            </h3>
            <p className="text-sm text-muted-foreground">View your visits</p>
          </button>

          <button 
            onClick={() => navigate('/member/events')}
            className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-left"
          >
            <Sparkles className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
              Events
            </h3>
            <p className="text-sm text-muted-foreground">Exclusive invitations</p>
          </button>
        </div>

        {/* Brands */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 text-center">
            Your status is recognized at
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border/50">
              <Coffee className="h-4 w-4" />
              <span className="text-sm text-foreground">NOIR Café</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border/50">
              <UtensilsCrossed className="h-4 w-4 text-sasso-accent" />
              <span className="text-sm text-foreground">SASSO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}