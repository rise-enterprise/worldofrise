import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMembers } from '@/hooks/useMembers';
import { useTiers } from '@/hooks/useTiers';
import { CrystalMedallion } from '@/components/ui/crystal-medallion';
import { PointsCounter } from '@/components/ui/points-counter';
import { ProgressArc } from '@/components/ui/progress-arc';
import { LuxuryTimeline } from '@/components/ui/luxury-timeline';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ConciergeChat } from '@/components/member/ConciergeChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Settings, 
  MessageCircle, 
  QrCode, 
  Calendar,
  History,
  CalendarCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  Gift
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MemberPortal() {
  const navigate = useNavigate();
  const { data: guests = [], isLoading } = useMembers();
  const { data: tiers } = useTiers();
  const member = guests[0]; // Demo member
  
  const [showChat, setShowChat] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'noir' | 'sasso'>('noir');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto space-y-6 pt-8">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="obsidian" className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground tracking-wide">No member data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate tier progress
  const sortedTiers = tiers?.sort((a, b) => a.minVisits - b.minVisits) || [];
  const currentTierIndex = sortedTiers.findIndex(t => t.displayName === member.tierName);
  const nextTier = sortedTiers[currentTierIndex + 1];
  const currentTierMinVisits = sortedTiers[currentTierIndex]?.minVisits || 0;
  const nextTierMinVisits = nextTier?.minVisits;
  
  const progressPercentage = nextTierMinVisits 
    ? Math.min(100, ((member.totalVisits - currentTierMinVisits) / (nextTierMinVisits - currentTierMinVisits)) * 100)
    : 100;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const qrValue = JSON.stringify({
    type: 'RISE_MEMBER',
    id: member.id,
    name: member.name,
    tier: member.tierName,
  });

  const recentVisits = member.visits.slice(0, 4).map(visit => ({
    id: visit.id,
    title: visit.brand.charAt(0).toUpperCase() + visit.brand.slice(1),
    subtitle: visit.location,
    date: visit.date,
    icon: <MapPin className="w-3 h-3" />,
  }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[300px] bg-burgundy/5 blur-[100px] rounded-full" />
      </div>

      {/* Chat Overlay */}
      <ConciergeChat 
        open={showChat} 
        onOpenChange={setShowChat}
        memberName={member.name}
      />

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm glass-panel-heavy">
          <DialogHeader>
            <DialogTitle className="text-center font-display tracking-crystal">Your Member QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              {/* Gold ornate frame */}
              <div className="absolute -inset-4 border-2 border-primary/30 rounded-2xl" />
              <div className="absolute -inset-6 border border-primary/10 rounded-3xl" />
              
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
            </motion.div>
            <p className="mt-8 text-sm text-muted-foreground text-center tracking-refined">
              Show this code at the venue for quick check-in
            </p>
            <div className="mt-4 text-center">
              <p className="font-display text-lg text-foreground tracking-crystal">{member.name}</p>
              <p className="text-sm text-muted-foreground tracking-refined">{member.tierName} Member</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="relative z-10 p-4 max-w-lg mx-auto space-y-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-4"
        >
          <div className="flex items-center gap-4">
            <Avatar 
              className="h-14 w-14 ring-1 ring-border ring-offset-2 ring-offset-background cursor-pointer transition-all duration-500 hover:ring-primary/50"
              onClick={() => navigate('/member/profile/edit')}
            >
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="bg-muted text-foreground font-display text-lg">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground tracking-refined">{getGreeting()},</p>
              <h1 className="text-xl font-display font-medium text-foreground tracking-crystal">
                {member.name.split(' ')[0]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
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
        </motion.div>

        {/* Tier Card with Medallion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="obsidian" className="relative overflow-hidden">
            {/* Crystal accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
            
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Tier Medallion */}
                <CrystalMedallion 
                  tier={member.tierName || 'crystal'} 
                  size="lg"
                  animated
                />
                
                {/* Status Info */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">
                    Membership Status
                  </p>
                  <h2 className="text-2xl font-display font-medium text-foreground tracking-crystal mb-4">
                    {member.tierName}
                  </h2>
                  
                  {/* Progress to next tier */}
                  {nextTier && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground tracking-refined">
                          Progress to {nextTier.displayName}
                        </span>
                        <span className="text-foreground font-medium">
                          {nextTierMinVisits! - member.totalVisits} visits away
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary/60 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/30">
                <div>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">Total Visits</p>
                  <PointsCounter value={member.totalVisits} showParticles={false} className="!text-2xl" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">Points</p>
                  <PointsCounter value={member.totalPoints || 0} showParticles={false} className="!text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Brand Selector Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          {['noir', 'sasso'].map((brand) => (
            <Button
              key={brand}
              variant={activeTab === brand ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(brand as 'noir' | 'sasso')}
              className={cn(
                'flex-1 capitalize tracking-refined transition-all duration-300',
                activeTab === brand && 'bg-primary text-primary-foreground'
              )}
            >
              {brand}
            </Button>
          ))}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card variant="glass" className="light-shift">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs tracking-widest uppercase">Favorite</span>
              </div>
              <p className="font-display text-lg font-medium text-foreground tracking-crystal capitalize">
                {member.favoriteBrand}
              </p>
            </CardContent>
          </Card>
          <Card variant="glass" className="light-shift">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs tracking-widest uppercase">Last Visit</span>
              </div>
              <p className="font-display text-lg font-medium text-foreground tracking-crystal">
                {formatDistanceToNow(member.lastVisit, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Timeline */}
        {recentVisits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-medium text-foreground tracking-crystal">
                    Recent Activity
                  </h3>
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
                <LuxuryTimeline items={recentVisits} maxItems={3} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-3"
        >
          <Button 
            variant="crystal" 
            className="h-auto py-5 flex-col gap-2"
            onClick={() => navigate('/member/history')}
          >
            <History className="h-5 w-5" />
            <span className="text-xs tracking-refined">History</span>
          </Button>
          <Button 
            variant="crystal" 
            className="h-auto py-5 flex-col gap-2"
            onClick={() => navigate('/member/events')}
          >
            <CalendarCheck className="h-5 w-5" />
            <span className="text-xs tracking-refined">Events</span>
          </Button>
          <Button 
            variant="crystal" 
            className="h-auto py-5 flex-col gap-2 relative"
            onClick={() => {}}
          >
            <Gift className="h-5 w-5" />
            <span className="text-xs tracking-refined">Rewards</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-gentle-pulse" />
          </Button>
        </motion.div>

        {/* Concierge CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            variant="glass"
            className="cursor-pointer light-shift"
            onClick={() => setShowChat(true)}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-burgundy/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary/70" />
              </div>
              <div className="flex-1">
                <p className="font-display font-medium text-foreground tracking-crystal">
                  Private Assistance
                </p>
                <p className="text-sm text-muted-foreground tracking-refined">
                  Your personal concierge awaits
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}