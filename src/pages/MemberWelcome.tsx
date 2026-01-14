import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { CrystalMedallion } from '@/components/ui/crystal-medallion';
import { CrystalEmblem } from '@/components/effects/CrystalEmblem';
import { Button } from '@/components/ui/button';
import { useMembers } from '@/hooks/useMembers';
import { Sparkles } from 'lucide-react';

export default function MemberWelcome() {
  const navigate = useNavigate();
  const { data: guests = [], isLoading } = useMembers();
  const member = guests[0];
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 500);
    const buttonTimer = setTimeout(() => setShowButton(true), 1500);
    
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <CrystalPageWrapper variant="tiffany" sparkleCount={25}>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground tracking-refined">Preparing your experience...</p>
          </motion.div>
        </div>
      </CrystalPageWrapper>
    );
  }

  return (
    <CrystalPageWrapper variant="tiffany" sparkleCount={30}>
      {/* Main content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* RISE Crystal Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="mb-8"
        >
          <CrystalEmblem size="lg" />
        </motion.div>

        <AnimatePresence>
          {showContent && member && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-md"
            >
              {/* Greeting */}
              <p className="text-muted-foreground tracking-[0.2em] uppercase text-sm mb-3">
                {getGreeting()}
              </p>
              
              {/* Member name */}
              <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-crystal mb-6">
                {member.name}
              </h1>
              
              {/* Tier medallion */}
              <div className="flex justify-center mb-8">
                <CrystalMedallion 
                  tier={member.tierName || 'crystal'} 
                  size="lg" 
                  showLabel 
                  animated 
                />
              </div>
              
              {/* Tier status */}
              <p className="text-muted-foreground tracking-refined mb-12">
                <span className="text-foreground font-medium">{member.totalVisits}</span> visits · 
                <span className="text-primary ml-1">{member.totalPoints?.toLocaleString() || 0}</span> points
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Button
                size="lg"
                variant="vip-gold"
                onClick={() => navigate('/member')}
                className="group relative overflow-hidden px-10 py-6 text-lg tracking-refined"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Enter Your World
                </span>
                
                {/* Animated shine */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CrystalPageWrapper>
  );
}
