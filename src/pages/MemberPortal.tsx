import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyMember } from '@/hooks/useMyMember';
import { useTiers } from '@/hooks/useTiers';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { CrystalMedallion } from '@/components/ui/crystal-medallion';
import { PointsCounter } from '@/components/ui/points-counter';
import { LuxuryTimeline } from '@/components/ui/luxury-timeline';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CompanionChat } from '@/components/member/CompanionChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Settings, 
  QrCode, 
  Calendar,
  History,
  CalendarCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Gift,
  Flame,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MemberPortal() {
  const navigate = useNavigate();
  const { data: member, isLoading, error } = useMyMember();
  const { data: tiers } = useTiers();
  
  const [showQR, setShowQR] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);

  if (isLoading) {
    return (
      <CrystalPageWrapper variant="subtle" sparkleCount={10}>
        <div className="h-screen flex flex-col">
          <div className="p-4 max-w-lg mx-auto space-y-4 pt-8 w-full">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="flex-1" />
        </div>
      </CrystalPageWrapper>
    );
  }

  if (error || !member) {
    return (
      <CrystalPageWrapper variant="subtle" sparkleCount={10}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card variant="obsidian" className="max-w-md w-full crystal-panel-gold">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground tracking-wide">
                {error ? 'Unable to load member data' : 'No member data available'}
              </p>
            </CardContent>
          </Card>
        </div>
      </CrystalPageWrapper>
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

  const visitsToNext = nextTierMinVisits ? nextTierMinVisits - member.totalVisits : 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const daysSinceLastVisit = member.lastVisit 
    ? Math.floor((Date.now() - member.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Visit streak (visits in last 30 days)
  const last30Days = member.visits.filter(v => 
    (Date.now() - v.date.getTime()) / (1000 * 60 * 60 * 24) <= 30
  ).length;

  const qrValue = JSON.stringify({
    type: 'RISE_MEMBER',
    id: member.id,
    name: member.name,
    tier: member.tierName,
  });

  const recentVisits = member.visits.slice(0, 3).map(visit => ({
    id: visit.id,
    title: visit.brand.charAt(0).toUpperCase() + visit.brand.slice(1),
    subtitle: visit.location,
    date: visit.date,
    icon: <MapPin className="w-3 h-3" />,
  }));

  return (
    <CrystalPageWrapper variant="tiffany" sparkleCount={15}>
      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm crystal-panel-gold">
          <DialogHeader>
            <DialogTitle className="text-center font-display tracking-crystal">Your Member QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute -inset-4 border-2 border-primary/30 rounded-2xl" />
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
            <p className="mt-6 text-sm text-muted-foreground text-center tracking-refined">
              Show this code at the venue for quick check-in
            </p>
            <div className="mt-3 text-center">
              <p className="font-display text-lg text-foreground tracking-crystal">{member.name}</p>
              <p className="text-sm text-muted-foreground tracking-refined">{member.tierName} Member</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-Screen Companion Layout */}
      <div className="h-[100dvh] flex flex-col max-w-lg mx-auto">
        {/* Compact Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0"
        >
          <div className="flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 ring-1 ring-primary/30 ring-offset-1 ring-offset-background cursor-pointer"
              onClick={() => navigate('/member/profile/edit')}
            >
              <AvatarImage src={member.avatarUrl || undefined} alt={member.name} />
              <AvatarFallback className="bg-muted text-foreground font-display text-sm">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-base font-display font-medium text-foreground tracking-crystal leading-tight">
                {member.name.split(' ')[0]}
              </h1>
              <p className="text-[11px] text-primary/80 tracking-widest uppercase font-body">
                {member.tierName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setShowQR(true)} className="text-muted-foreground hover:text-primary h-8 w-8">
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/member/profile/edit')} className="text-muted-foreground hover:text-primary h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Compact Status Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-4 pb-2 shrink-0"
        >
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card/60 backdrop-blur-sm border border-border/20">
            {/* Tier Medallion - small */}
            <CrystalMedallion tier={member.tierName || 'crystal'} size="sm" animated />
            
            {/* Quick Stats */}
            <div className="flex-1 flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-display font-medium text-foreground leading-none">{member.totalPoints || 0}</p>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Points</p>
              </div>
              <div className="h-6 w-px bg-border/30" />
              <div className="text-center">
                <p className="text-lg font-display font-medium text-foreground leading-none">{member.totalVisits}</p>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Visits</p>
              </div>
              {last30Days > 0 && (
                <>
                  <div className="h-6 w-px bg-border/30" />
                  <div className="flex items-center gap-1 text-primary">
                    <Flame className="h-3.5 w-3.5" />
                    <span className="text-sm font-display font-medium">{last30Days}</span>
                    <span className="text-[10px] text-muted-foreground tracking-widest uppercase">This Mo</span>
                  </div>
                </>
              )}
            </div>

            {/* Expand button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
              onClick={() => setDashboardExpanded(!dashboardExpanded)}
            >
              {dashboardExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Tier Progress - always visible */}
          {nextTier && (
            <div className="mt-2 px-1">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                <span className="tracking-widest uppercase">{member.tierName}</span>
                <span className="text-primary/80 font-medium">
                  {visitsToNext} visit{visitsToNext !== 1 ? 's' : ''} to {nextTier.displayName}
                </span>
              </div>
              <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Expandable Dashboard Section */}
        <AnimatePresence>
          {dashboardExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden shrink-0"
            >
              <div className="px-4 pb-3 space-y-3">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <Card variant="glass" className="crystal-panel">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-[10px] tracking-widest uppercase">Favorite</span>
                      </div>
                      <p className="font-display text-sm font-medium text-foreground capitalize">
                        {member.favoriteBrand}
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="glass" className="crystal-panel">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span className="text-[10px] tracking-widest uppercase">Last Visit</span>
                      </div>
                      <p className="font-display text-sm font-medium text-foreground">
                        {daysSinceLastVisit !== null
                          ? daysSinceLastVisit === 0 ? 'Today' : `${daysSinceLastVisit}d ago`
                          : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="crystal" 
                    className="h-auto py-3 flex-col gap-1.5 min-h-[44px] text-xs"
                    onClick={() => navigate('/member/history')}
                  >
                    <History className="h-4 w-4" />
                    <span className="tracking-refined">History</span>
                  </Button>
                  <Button 
                    variant="crystal" 
                    className="h-auto py-3 flex-col gap-1.5 min-h-[44px] text-xs"
                    onClick={() => navigate('/member/events')}
                  >
                    <CalendarCheck className="h-4 w-4" />
                    <span className="tracking-refined">Events</span>
                  </Button>
                  <Button 
                    variant="crystal" 
                    className="h-auto py-3 flex-col gap-1.5 relative min-h-[44px] text-xs"
                    onClick={() => navigate('/member/rewards')}
                  >
                    <Gift className="h-4 w-4" />
                    <span className="tracking-refined">Rewards</span>
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-gentle-pulse" />
                  </Button>
                </div>

                {/* Recent Activity */}
                {recentVisits.length > 0 && (
                  <Card variant="glass" className="crystal-panel">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-xs font-medium text-foreground tracking-crystal uppercase">
                          Recent Activity
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground h-auto py-0.5 px-1.5 text-[10px] hover:text-primary"
                          onClick={() => navigate('/member/history')}
                        >
                          View all
                          <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                      </div>
                      <LuxuryTimeline items={recentVisits} maxItems={3} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Companion Chat - Takes remaining space */}
        <div className="flex-1 min-h-0 border-t border-border/20">
          <CompanionChat member={member} className="h-full" />
        </div>
      </div>
    </CrystalPageWrapper>
  );
}
