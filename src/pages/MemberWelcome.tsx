import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyMember } from '@/hooks/useMyMember';

export default function MemberWelcome() {
  const navigate = useNavigate();
  const { data: member, isLoading } = useMyMember();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground tracking-widest uppercase font-body">Preparing your world</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <AnimatePresence>
        {phase >= 1 && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: 1.2 }}
            className="text-6xl md:text-8xl font-display font-light tracking-[0.1em] text-foreground select-none mb-10"
          >
            RISE
          </motion.h2>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase >= 2 && member && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-md">
            <p className="text-muted-foreground tracking-[0.2em] uppercase text-xs mb-4 font-body">{getGreeting()}</p>
            <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">{member.name}</h1>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="text-primary font-display text-lg">{member.tierName}</span>
              <span className="w-px h-4 bg-border" />
              <span><span className="text-foreground">{member.totalVisits}</span> visits</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mt-12">
            <button
              onClick={() => navigate('/member')}
              className="px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase font-body bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-300"
            >
              Enter Your Lounge
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}