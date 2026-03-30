import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyMember } from '@/hooks/useMyMember';

function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; phase: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -Math.random() * 0.08 - 0.02,
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.25 + 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.006;
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;

        const a = p.alpha * (0.4 + 0.6 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 150, 80, ${a})`;
        ctx.fill();

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
        g.addColorStop(0, `rgba(180, 150, 80, ${a * 0.25})`);
        g.addColorStop(1, 'rgba(180, 150, 80, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function MemberWelcome() {
  const navigate = useNavigate();
  const { data: member, isLoading } = useMyMember();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-muted-foreground/50 tracking-[0.4em] uppercase font-body"
        >
          Preparing your world
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <AmbientCanvas />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 4, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* RISE watermark */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            >
              <span className="text-[120px] md:text-[180px] font-display font-light tracking-[0.2em] text-foreground/[0.03]">
                RISE
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Greeting */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-[10px] text-muted-foreground/60 tracking-[0.35em] uppercase font-body mb-5"
            >
              {getGreeting()}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Name */}
        <AnimatePresence>
          {phase >= 2 && member && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center"
            >
              <h1 className="font-display text-4xl md:text-6xl font-light text-foreground tracking-[0.06em] leading-tight">
                {member.name}
              </h1>

              {/* Gold divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="mt-6 mb-5 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary/40 to-transparent origin-center"
              />

              {/* Tier & stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex items-center justify-center gap-5"
              >
                <span className="text-[11px] text-primary tracking-[0.25em] uppercase font-body">
                  {member.tierName}
                </span>
                <span className="w-px h-3.5 bg-border/50" />
                <span className="text-[11px] text-muted-foreground/60 tracking-wider font-body">
                  <span className="text-foreground/80">{member.totalVisits}</span> visits
                </span>
                {(member.totalPoints || 0) > 0 && (
                  <>
                    <span className="w-px h-3.5 bg-border/50" />
                    <span className="text-[11px] text-muted-foreground/60 tracking-wider font-body">
                      <span className="text-foreground/80">{member.totalPoints}</span> privileges
                    </span>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-14"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/member')}
                className="relative px-10 py-4 text-[10px] tracking-[0.2em] uppercase font-body
                           bg-foreground text-background rounded-md overflow-hidden
                           transition-all duration-500 hover:shadow-[0_0_30px_rgba(180,150,80,0.12)]
                           group"
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                <span className="relative">Enter Your Private Lounge</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle bottom text */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="mt-8 text-[9px] text-muted-foreground/30 tracking-[0.3em] uppercase font-body"
            >
              Your world awaits
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
