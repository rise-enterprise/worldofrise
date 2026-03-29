import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyMember } from '@/hooks/useMyMember';
import { Sparkles } from 'lucide-react';

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground tracking-widest uppercase">Preparing your world</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, hsl(var(--gold)) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(var(--neon-purple)) 0%, transparent 70%)' }} />
      </div>

      {/* RISE wordmark */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="mb-10"
          >
            <h2 className="text-5xl md:text-7xl font-display font-medium tracking-[0.15em] text-foreground/10 select-none">
              RISE
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting + Name */}
      <AnimatePresence>
        {phase >= 2 && member && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md relative z-10"
          >
            <p className="text-muted-foreground tracking-[0.2em] uppercase text-xs mb-4 font-body">
              {getGreeting()}
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-crystal mb-6">
              {member.name}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="text-primary font-display text-lg">{member.tierName}</span>
              </span>
              <span className="w-px h-4 bg-border/30" />
              <span>
                <span className="text-foreground font-medium">{member.totalVisits}</span> visits
              </span>
              <span className="w-px h-4 bg-border/30" />
              <span>
                <span className="text-primary">{member.totalPoints?.toLocaleString() || 0}</span> pts
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enter CTA */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-12">
            <motion.button
              onClick={() => navigate('/member')}
              className="group relative px-10 py-4 rounded-xl text-primary-foreground font-body text-sm tracking-widest uppercase overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-shadow)) 100%)' }}
              whileHover={{ scale: 1.02, boxShadow: '0 12px 40px -8px hsl(var(--gold) / 0.35)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Enter Your World
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
