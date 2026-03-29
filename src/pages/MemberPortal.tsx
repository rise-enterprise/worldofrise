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
  Settings, QrCode, Calendar, History,
  ChevronRight, ChevronDown, ChevronUp, MapPin,
  Gift, Star
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
        <div className="p-6 max-w-lg mx-auto space-y-4 pt-8">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md">
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

  const qrValue = JSON.stringify({ type: 'RISE_MEMBER', id: member.id, name: member.name, tier: member.tierName });
  const recentVisits = member.visits.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-center font-display font-light">Member QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="bg-background p-6 rounded-lg border border-border">
              <QRCodeSVG value={qrValue} size={180} level="H" includeMargin={false} fgColor="hsl(30, 10%, 12%)" bgColor="transparent" />
            </div>
            <p className="mt-6 text-sm text-muted-foreground text-center">Present at the venue</p>
            <div className="mt-3 text-center">
              <p className="font-display text-lg text-foreground">{member.name}</p>
              <p className="text-sm text-primary">{member.tierName}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-[100dvh] flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-10 w-10 border border-border cursor-pointer"
              onClick={() => navigate('/member/profile/edit')}
            >
              <AvatarImage src={member.avatarUrl || undefined} alt={member.name} />
              <AvatarFallback className="bg-secondary text-foreground font-display text-sm">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-base font-display text-foreground leading-tight">
                {member.name.split(' ')[0]}
              </h1>
              <p className="text-[10px] text-primary tracking-[0.15em] uppercase font-body">{member.tierName}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setShowQR(true)} className="h-8 w-8">
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/member/profile/edit')} className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="px-5 pb-3 shrink-0">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
            <div className="text-center">
              <p className="text-lg font-display text-foreground leading-none">{member.totalPoints || 0}</p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Privileges</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-display text-foreground leading-none">{member.totalVisits}</p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Visits</p>
            </div>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
              onClick={() => setDashboardExpanded(!dashboardExpanded)}>
              {dashboardExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {nextTier && (
            <div className="mt-2 px-1">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1.5">
                <span className="uppercase tracking-widest">{member.tierName}</span>
                <span>{visitsToNext} visit{visitsToNext !== 1 ? 's' : ''} to {nextTier.displayName}</span>
              </div>
              <div className="h-[3px] bg-secondary rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }} />
              </div>
            </div>
          )}
        </motion.div>

        {/* Expandable */}
        <AnimatePresence>
          {dashboardExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
              className="overflow-hidden shrink-0"
            >
              <div className="px-5 pb-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-3 bg-card border border-border">
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Preferred</p>
                    <p className="font-display text-sm text-foreground capitalize">{member.favoriteBrand}</p>
                  </div>
                  <div className="rounded-lg p-3 bg-card border border-border">
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Last Visit</p>
                    <p className="font-display text-sm text-foreground">
                      {daysSinceLastVisit !== null ? daysSinceLastVisit === 0 ? 'Today' : `${daysSinceLastVisit}d ago` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: History, label: 'History', path: '/member/history' },
                    { icon: Calendar, label: 'Events', path: '/member/events' },
                    { icon: Gift, label: 'Privileges', path: '/member/rewards' },
                  ].map(item => (
                    <button key={item.label}
                      onClick={() => navigate(item.path)}
                      className="py-3 flex flex-col items-center gap-1.5 min-h-[44px] text-xs rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-200"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {recentVisits.length > 0 && (
                  <div className="rounded-lg p-3 bg-card border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-xs text-foreground">Recent Activity</h3>
                      <button className="text-muted-foreground text-[10px] hover:text-foreground flex items-center gap-0.5"
                        onClick={() => navigate('/member/history')}>
                        View all <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentVisits.map(visit => (
                        <div key={visit.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
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

        {/* Companion */}
        <div className="flex-1 min-h-0 border-t border-border">
          <CompanionChat member={member} className="h-full" />
        </div>
      </div>
    </div>
  );
}