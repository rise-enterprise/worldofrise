import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyMember } from '@/hooks/useMyMember';
import { useTiers } from '@/hooks/useTiers';
import { CompanionChat } from '@/components/member/CompanionChat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeSVG } from 'qrcode.react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Settings, QrCode, Calendar, History, CalendarCheck,
  ChevronRight, ChevronDown, ChevronUp, Sparkles, MapPin,
  Gift, Flame, Star, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MemberPortal() {
  const navigate = useNavigate();
  const { data: member, isLoading, error } = useMyMember();
  const { data: tiers } = useTiers();
  const [showQR, setShowQR] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 max-w-lg mx-auto space-y-4 pt-8">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl p-8 text-center max-w-md">
          <p className="text-muted-foreground">{error ? 'Unable to load member data' : 'No member data available'}</p>
        </div>
      </div>
    );
  }

  const sortedTiers = tiers?.sort((a, b) => a.minVisits - b.minVisits) || [];
  const currentTierIndex = sortedTiers.findIndex(t => t.displayName === member.tierName);
  const nextTier = sortedTiers[currentTierIndex + 1];
  const currentTierMinVisits = sortedTiers[currentTierIndex]?.minVisits || 0;
  const nextTierMinVisits = nextTier?.minVisits;
  const progressPercentage = nextTierMinVisits
    ? Math.min(100, ((member.totalVisits - currentTierMinVisits) / (nextTierMinVisits - currentTierMinVisits)) * 100)
    : 100;
  const visitsToNext = nextTierMinVisits ? nextTierMinVisits - member.totalVisits : 0;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const daysSinceLastVisit = member.lastVisit
    ? Math.floor((Date.now() - member.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const last30Days = member.visits.filter(v =>
    (Date.now() - v.date.getTime()) / (1000 * 60 * 60 * 24) <= 30
  ).length;

  const qrValue = JSON.stringify({ type: 'RISE_MEMBER', id: member.id, name: member.name, tier: member.tierName });

  const recentVisits = member.visits.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm bg-card/95 backdrop-blur-2xl border-border/30">
          <DialogHeader>
            <DialogTitle className="text-center font-display tracking-crystal">Member QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <div className="absolute -inset-4 border border-primary/20 rounded-2xl" />
              <div className="bg-card p-6 rounded-2xl border border-border/20">
                <QRCodeSVG value={qrValue} size={180} level="H" includeMargin={false} fgColor="hsl(var(--foreground))" bgColor="transparent" />
              </div>
            </motion.div>
            <p className="mt-6 text-sm text-muted-foreground text-center">Show at the venue for check-in</p>
            <div className="mt-3 text-center">
              <p className="font-display text-lg text-foreground tracking-crystal">{member.name}</p>
              <p className="text-sm text-primary">{member.tierName} Member</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-[100dvh] flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-10 w-10 ring-1 ring-primary/20 ring-offset-1 ring-offset-background cursor-pointer"
              onClick={() => navigate('/member/profile/edit')}
            >
              <AvatarImage src={member.avatarUrl || undefined} alt={member.name} />
              <AvatarFallback className="bg-muted text-foreground font-display text-sm">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-base font-display font-medium text-foreground tracking-crystal leading-tight">
                {member.name.split(' ')[0]}
              </h1>
              <p className="text-[11px] text-primary/80 tracking-widest uppercase font-body">{member.tierName}</p>
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

        {/* Status Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="px-4 pb-2 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/20">
            {/* Tier Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.05))' }}>
              <Crown className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-display font-medium text-foreground leading-none">{member.totalPoints || 0}</p>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Points</p>
              </div>
              <div className="h-6 w-px bg-border/20" />
              <div className="text-center">
                <p className="text-lg font-display font-medium text-foreground leading-none">{member.totalVisits}</p>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Visits</p>
              </div>
              {last30Days > 0 && (
                <>
                  <div className="h-6 w-px bg-border/20" />
                  <div className="flex items-center gap-1 text-primary">
                    <Flame className="h-3.5 w-3.5" />
                    <span className="text-sm font-display font-medium">{last30Days}</span>
                    <span className="text-[10px] text-muted-foreground tracking-widest uppercase">mo</span>
                  </div>
                </>
              )}
            </div>

            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
              onClick={() => setDashboardExpanded(!dashboardExpanded)}>
              {dashboardExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Tier Progress */}
          {nextTier && (
            <div className="mt-2 px-1">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                <span className="tracking-widest uppercase">{member.tierName}</span>
                <span className="text-primary/80 font-medium">
                  {visitsToNext} visit{visitsToNext !== 1 ? 's' : ''} to {nextTier.displayName}
                </span>
              </div>
              <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(var(--gold) / 0.6), hsl(var(--gold)))' }}
                  initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} />
              </div>
            </div>
          )}
        </motion.div>

        {/* Expandable Dashboard */}
        <AnimatePresence>
          {dashboardExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden shrink-0"
            >
              <div className="px-4 pb-3 space-y-3">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 bg-card/50 border border-border/15 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Star className="h-3 w-3 text-primary" />
                      <span className="text-[10px] tracking-widest uppercase">Favorite</span>
                    </div>
                    <p className="font-display text-sm font-medium text-foreground capitalize">{member.favoriteBrand}</p>
                  </div>
                  <div className="rounded-xl p-3 bg-card/50 border border-border/15 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span className="text-[10px] tracking-widest uppercase">Last Visit</span>
                    </div>
                    <p className="font-display text-sm font-medium text-foreground">
                      {daysSinceLastVisit !== null
                        ? daysSinceLastVisit === 0 ? 'Today' : `${daysSinceLastVisit}d ago`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: History, label: 'History', path: '/member/history' },
                    { icon: CalendarCheck, label: 'Events', path: '/member/events' },
                    { icon: Gift, label: 'Rewards', path: '/member/rewards', pulse: true },
                  ].map(item => (
                    <button key={item.label}
                      onClick={() => navigate(item.path)}
                      className="relative h-auto py-3 flex flex-col items-center gap-1.5 min-h-[44px] text-xs rounded-xl bg-card/40 border border-border/15 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all duration-200"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="tracking-refined">{item.label}</span>
                      {item.pulse && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-gentle-pulse" />}
                    </button>
                  ))}
                </div>

                {/* Recent Activity */}
                {recentVisits.length > 0 && (
                  <div className="rounded-xl p-3 bg-card/50 border border-border/15 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-xs font-medium text-foreground tracking-crystal uppercase">Recent Activity</h3>
                      <button className="text-muted-foreground text-[10px] hover:text-primary flex items-center gap-0.5"
                        onClick={() => navigate('/member/history')}>
                        View all <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentVisits.map(visit => (
                        <div key={visit.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-primary/60" />
                            <span className="text-xs text-foreground capitalize">{visit.brand}</span>
                            <span className="text-[10px] text-muted-foreground">· {visit.location}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {visit.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Companion */}
        <div className="flex-1 min-h-0 border-t border-border/15">
          <CompanionChat member={member} className="h-full" />
        </div>
      </div>
    </div>
  );
}
