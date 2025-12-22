import { useState } from 'react';
import { Guest, TIER_CONFIG } from '@/types/loyalty';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Coffee, UtensilsCrossed, Sparkles, ArrowLeft, LayoutDashboard, History, Calendar, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ConciergeChat } from './ConciergeChat';

interface MemberCardProps {
  guest: Guest;
}

export function MemberCard({ guest }: MemberCardProps) {
  const navigate = useNavigate();
  const [conciergeOpen, setConciergeOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-luxury flex flex-col">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
          <h1 
            className="font-display text-lg font-semibold text-gradient-gold cursor-pointer"
            onClick={() => navigate('/')}
          >
            RISE
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 pt-4">
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

        {/* Navigation Actions */}
        <div className="space-y-3 animate-slide-up pt-2" style={{ animationDelay: '600ms' }}>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="luxury" 
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-col h-auto py-3 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/member/history')}
            >
              <History className="h-5 w-5 mb-1" />
              <span className="text-xs">History</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-col h-auto py-3 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/member/events')}
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Events</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-col h-auto py-3 text-muted-foreground hover:text-foreground"
              onClick={() => setConciergeOpen(true)}
            >
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">Concierge</span>
            </Button>
          </div>
        </div>
        </div>
      </div>

      <ConciergeChat 
        open={conciergeOpen} 
        onOpenChange={setConciergeOpen}
        memberName={guest.name}
      />
    </div>
  );
}
