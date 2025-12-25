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

const tierColors: Record<string, { bg: string; text: string; ring: string }> = {
  'Initiation': { bg: 'bg-slate-600', text: 'text-slate-100', ring: 'ring-slate-500' },
  'Bronze': { bg: 'bg-amber-700', text: 'text-amber-100', ring: 'ring-amber-600' },
  'Silver': { bg: 'bg-slate-400', text: 'text-slate-900', ring: 'ring-slate-400' },
  'Gold': { bg: 'bg-yellow-500', text: 'text-yellow-950', ring: 'ring-yellow-500' },
  'Platinum': { bg: 'bg-purple-600', text: 'text-purple-100', ring: 'ring-purple-500' },
  'Diamond': { bg: 'bg-cyan-500', text: 'text-cyan-950', ring: 'ring-cyan-400' },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Chat Overlay */}
      <ConciergeChat 
        open={showChat} 
        onOpenChange={setShowChat}
        memberName={guest.name}
      />

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Your Member QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCodeSVG 
                value={qrValue}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Show this code at the venue for quick check-in
            </p>
            <div className="mt-4 text-center">
              <p className="font-semibold text-foreground">{guest.name}</p>
              <p className="text-sm text-muted-foreground">{guest.tierName} Member</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Header with Avatar and Greeting */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Avatar 
              className={cn("h-12 w-12 ring-2 ring-offset-2 ring-offset-background cursor-pointer", tierStyle.ring)}
              onClick={() => navigate('/member/profile/edit')}
            >
              <AvatarImage src={guest.avatarUrl} alt={guest.name} />
              <AvatarFallback className={cn(tierStyle.bg, tierStyle.text, "font-semibold")}>
                {getInitials(guest.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{getGreeting()},</p>
              <h1 className="text-lg font-semibold text-foreground">{guest.name.split(' ')[0]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowQR(true)}>
              <QrCode className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/member/profile/edit')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowChat(true)}>
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Membership Card with QR */}
        <Card className={cn(
          "relative overflow-hidden border-0",
          tierStyle.bg
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className={cn("text-xs opacity-80", tierStyle.text)}>Membership Tier</p>
                <h2 className={cn("text-2xl font-bold", tierStyle.text)}>{guest.tierName}</h2>
              </div>
              <div 
                className="bg-white p-1.5 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowQR(true)}
              >
                <QRCodeSVG 
                  value={qrValue}
                  size={48}
                  level="L"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={cn("opacity-80", tierStyle.text)}>Progress to {nextTier?.displayName || 'Max'}</span>
                <span className={cn("font-medium", tierStyle.text)}>
                  {nextTier ? `${visitsToNextTier} visits away` : 'Max tier!'}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/20" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
              <div>
                <p className={cn("text-xs opacity-80", tierStyle.text)}>Total Visits</p>
                <p className={cn("text-xl font-bold", tierStyle.text)}>{guest.totalVisits}</p>
              </div>
              <div>
                <p className={cn("text-xs opacity-80", tierStyle.text)}>Points</p>
                <p className={cn("text-xl font-bold", tierStyle.text)}>{guest.totalPoints?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">Favorite Brand</span>
              </div>
              <p className="font-semibold text-foreground">{guest.favoriteBrand}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Last Visit</span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {formatDistanceToNow(guest.lastVisit, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visits */}
        {recentVisits.length > 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Recent Visits</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground h-auto py-1 px-2"
                  onClick={() => navigate('/member/history')}
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        visit.brand === 'noir' ? 'bg-zinc-800' : 'bg-amber-100'
                      )}>
                        <span className={cn(
                          "text-xs font-medium",
                          visit.brand === 'noir' ? 'text-zinc-100' : 'text-amber-900'
                        )}>
                          {visit.brand[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{visit.brand}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{visit.location}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(visit.date, 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/member/history')}
          >
            <History className="h-5 w-5" />
            <span>Visit History</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/member/events')}
          >
            <CalendarCheck className="h-5 w-5" />
            <span>Events</span>
          </Button>
        </div>

        {/* Concierge CTA */}
        <Card 
          className="bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => setShowChat(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Need assistance?</p>
              <p className="text-sm text-muted-foreground">Chat with our concierge</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
