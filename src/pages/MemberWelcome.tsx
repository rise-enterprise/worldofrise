import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CrystalMedallion } from '@/components/ui/crystal-medallion';
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
    // Stagger the reveal animation
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground tracking-refined">Preparing your experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[150px] rounded-full" />
        
        {/* Crystal vertical lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent"
            style={{ left: `${20 + i * 15}%` }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 0.5, scaleY: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 1.5 }}
          />
        ))}
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* RISE Logo / Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="mb-8"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl animate-gentle-pulse" />
            
            {/* Crystal emblem */}
            <div className="relative w-32 h-32 rounded-full border-2 border-primary/30 flex items-center justify-center bg-card/50 backdrop-blur-xl">
              <span className="font-display text-4xl text-primary tracking-widest">R</span>
              
              {/* Rotating ring effect */}
              <motion.div
                className="absolute inset-0 rounded-full border border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
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
    </div>
  );
}