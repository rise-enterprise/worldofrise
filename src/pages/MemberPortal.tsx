import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyMember } from '@/hooks/useMyMember';
import { useTiers } from '@/hooks/useTiers';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { QrCode, Settings } from 'lucide-react';

import { LoungeParticles } from '@/components/member/lounge/LoungeParticles';
import { HeroIdentity } from '@/components/member/lounge/HeroIdentity';
import { StatusRing } from '@/components/member/lounge/StatusRing';
import { PrivilegesSection } from '@/components/member/lounge/PrivilegesSection';
import { InvitationsSection } from '@/components/member/lounge/InvitationsSection';
import { JourneyTimeline } from '@/components/member/lounge/JourneyTimeline';
import { ConciergeFloat } from '@/components/member/lounge/ConciergeFloat';

export default function MemberPortal() {
  const navigate = useNavigate();
  const { data: member, isLoading, error } = useMyMember();
  const { data: tiers } = useTiers();
  const [showQR, setShowQR] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-full border border-border/50 mx-auto animate-pulse" />
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-muted-foreground text-sm">
            {error ? 'Unable to load your experience' : 'Your private lounge awaits'}
          </p>
        </div>
      </div>
    );
  }

  const qrValue = JSON.stringify({
    type: 'RISE_MEMBER', id: member.id, name: member.name, tier: member.tierName,
  });

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Floating particles */}
      <LoungeParticles />

      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-primary/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center font-display font-light tracking-wider">
              Member QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="bg-background p-6 rounded-lg border border-border/30">
              <QRCodeSVG value={qrValue} size={180} level="H" includeMargin={false}
                fgColor="hsl(30, 10%, 12%)" bgColor="transparent" />
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Present at the venue</p>
            <div className="mt-3 text-center">
              <p className="font-display text-lg text-foreground">{member.name}</p>
              <p className="text-xs text-primary tracking-wider">{member.tierName}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top bar */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4"
      >
        <span className="text-[10px] text-primary/50 tracking-[0.4em] uppercase font-body">
          Private Lounge
        </span>
        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setShowQR(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <QrCode className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/member/profile/edit')} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto">
        <HeroIdentity member={member} />
        <StatusRing member={member} tiers={tiers || []} />
        <PrivilegesSection />
        <InvitationsSection />
        <JourneyTimeline visits={member.visits} />

        {/* Footer breathing room */}
        <div className="h-24" />
      </div>

      {/* Concierge */}
      <ConciergeFloat />
    </div>
  );
}
