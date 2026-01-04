import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Award, 
  Calendar, 
  ChevronRight,
  MessageCircle,
  History,
  CalendarCheck,
  Sparkles,
  MapPin,
  Settings,
  QrCode,
  X
} from 'lucide-react';
import { Guest } from '@/types/loyalty';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConciergeChat } from './ConciergeChat';
import { useTiers } from '@/hooks/useTiers';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  guest: Guest;
}

const tierColors: Record<string, { bg: string; text: string; accent: string }> = {
  'Initiation': { bg: 'bg-muted', text: 'text-foreground', accent: 'bg-tier-initiation' },
  'Bronze': { bg: 'bg-muted', text: 'text-foreground', accent: 'bg-tier-connoisseur' },
  'Silver': { bg: 'bg-secondary', text: 'text-foreground', accent: 'bg-tier-elite' },
  'Gold': { bg: 'bg-accent', text: 'text-foreground', accent: 'bg-tier-inner-circle' },
  'Platinum': { bg: 'bg-primary/10', text: 'text-foreground', accent: 'bg-tier-inner-circle' },
  'Diamond': { bg: 'bg-noir', text: 'text-foreground', accent: 'bg-tier-black' },
};

export function MemberCard({ guest }: MemberCardProps) {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { data: tiers } = useTiers();

  // Calculate tier progress dynamically from database
  const sortedTiers = tiers?.sort((a, b) => a.minVisits - b.minVisits) || [];
  const currentTierIndex = sortedTiers.findIndex(t => t.displayName === guest.tierName);
  const nextTier = sortedTiers[currentTierIndex + 1];
  const currentTierMinVisits = sortedTiers[currentTierIndex]?.minVisits || 0;
  const nextTierMinVisits = nextTier?.minVisits;
  
  const visitsToNextTier = nextTierMinVisits ? nextTierMinVisits - guest.totalVisits : 0;
  const progressPercentage = nextTierMinVisits 
    ? Math.min(100, ((guest.totalVisits - currentTierMinVisits) / (nextTierMinVisits - currentTierMinVisits)) * 100)
    : 100;

  const tierStyle = tierColors[guest.tierName] || tierColors['Initiation'];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // QR code contains member ID for scanning at venue
  const qrValue = JSON.stringify({
    type: 'RISE_MEMBER',
    id: guest.id,
    name: guest.name,
    tier: guest.tierName,
  });

  const recentVisits = guest.visits.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Chat Overlay */}
      <ConciergeChat 
        open={showChat} 
        onOpenChange={setShowChat}
        memberName={guest.name}
      />

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm glass-panel-heavy">
          <DialogHeader>
            <DialogTitle className="text-center font-display tracking-crystal">Your Member QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-8">
            <div className="bg-card p-6 rounded-2xl shadow-crystal border border-border/30">
              <QRCodeSVG 
                value={qrValue}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="hsl(var(--foreground))"
                bgColor="transparent"
              />
            </div>
            <p className="mt-6 text-sm text-muted-foreground text-center tracking-refined">
              Show this code at the venue for quick check-in
            </p>
            <div className="mt-4 text-center">
              <p className="font-display text-lg text-foreground tracking-crystal">{guest.name}</p>
              <p className="text-sm text-muted-foreground tracking-refined">{guest.tierName} Member</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Header with Avatar and Greeting */}
        <div className="flex items-center justify-between pt-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <Avatar 
              className="h-14 w-14 ring-1 ring-border ring-offset-2 ring-offset-background cursor-pointer transition-all duration-500 hover:ring-primary/50"
              onClick={() => navigate('/member/profile/edit')}
            >
              <AvatarImage src={guest.avatarUrl} alt={guest.name} />
              <AvatarFallback className="bg-accent text-foreground font-display text-lg">
                {getInitials(guest.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground tracking-refined">{getGreeting()},</p>
              <h1 className="text-xl font-display font-medium text-foreground tracking-crystal">{guest.name.split(' ')[0]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowQR(true)} className="text-muted-foreground hover:text-foreground">
              <QrCode className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/member/profile/edit')} className="text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowChat(true)} className="text-muted-foreground hover:text-foreground">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Membership Card with QR */}
        <Card 
          variant="crystal" 
          className="relative overflow-hidden animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          {/* Crystal accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          
          <CardContent className="relative p-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">Membership Status</p>
                <h2 className="text-2xl font-display font-medium text-foreground mt-2 tracking-crystal">{guest.tierName}</h2>
              </div>
              <div 
                className="glass-panel p-2 rounded-xl cursor-pointer hover:border-primary/30 transition-all duration-500"
                onClick={() => setShowQR(true)}
              >
                <QRCodeSVG 
                  value={qrValue}
                  size={48}
                  level="L"
                  includeMargin={false}
                  fgColor="hsl(var(--foreground))"
                  bgColor="transparent"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground tracking-refined">Progress to {nextTier?.displayName || 'Max'}</span>
                <span className="font-medium text-foreground tracking-refined">
                  {nextTier ? `${visitsToNextTier} visits away` : 'Max tier achieved'}
                </span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/60 rounded-full transition-all duration-1000 ease-crystal"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-border/30">
              <div>
                <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">Total Visits</p>
                <p className="text-2xl font-display font-medium text-foreground mt-1 tracking-crystal">{guest.totalVisits}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">Points</p>
                <p className="text-2xl font-display font-medium text-foreground mt-1 tracking-crystal">{guest.totalPoints?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div 
          className="grid grid-cols-2 gap-4 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <Card variant="glass" className="light-shift">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs tracking-widest uppercase">Favorite</span>
              </div>
              <p className="font-display text-lg font-medium text-foreground tracking-crystal">{guest.favoriteBrand}</p>
            </CardContent>
          </Card>
          <Card variant="glass" className="light-shift">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs tracking-widest uppercase">Last Visit</span>
              </div>
              <p className="font-display text-lg font-medium text-foreground tracking-crystal">
                {formatDistanceToNow(guest.lastVisit, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visits */}
        {recentVisits.length > 0 && (
          <Card 
            variant="glass" 
            className="animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-medium text-foreground tracking-crystal">Recent Visits</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground h-auto py-1 px-2 hover:text-foreground"
                  onClick={() => navigate('/member/history')}
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {recentVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                        <span className="text-xs font-display font-medium text-foreground tracking-wide">
                          {visit.brand[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground tracking-refined capitalize">{visit.brand}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="tracking-refined">{visit.location}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground tracking-refined">
                      {format(visit.date, 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div 
          className="grid grid-cols-2 gap-4 pt-2 animate-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <Button 
            variant="crystal" 
            className="h-auto py-5 flex-col gap-3"
            onClick={() => navigate('/member/history')}
          >
            <History className="h-5 w-5" />
            <span className="tracking-refined">Visit History</span>
          </Button>
          <Button 
            variant="crystal" 
            className="h-auto py-5 flex-col gap-3"
            onClick={() => navigate('/member/events')}
          >
            <CalendarCheck className="h-5 w-5" />
            <span className="tracking-refined">Events</span>
          </Button>
        </div>

        {/* Concierge CTA */}
        <Card 
          variant="glass"
          className="cursor-pointer light-shift animate-slide-up"
          style={{ animationDelay: '500ms' }}
          onClick={() => setShowChat(true)}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary/70" />
            </div>
            <div className="flex-1">
              <p className="font-display font-medium text-foreground tracking-crystal">Need assistance?</p>
              <p className="text-sm text-muted-foreground tracking-refined">Chat with our concierge</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
