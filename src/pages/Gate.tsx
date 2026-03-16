import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";

const Gate = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-background">
        {/* Neon ambient on login */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 50% 30% at 50% 20%, hsl(var(--neon-purple) / 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 30% 20% at 70% 80%, hsl(var(--neon-magenta) / 0.04) 0%, transparent 50%)
            `,
          }}
        />
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-center px-6 bg-background">
      {/* Cybernetic ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 30%, hsl(var(--gold) / 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 20% 80%, hsl(var(--neon-magenta) / 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 30% 25% at 80% 20%, hsl(var(--neon-purple) / 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(var(--gold) / 0.04) 0%, transparent 60%)
          `,
        }} />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.01]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-purple) / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-purple) / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Floating neon particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px rounded-full"
          style={{
          background: i % 4 === 0
              ? "hsl(var(--gold) / 0.5)"
              : i % 3 === 0
                ? "hsl(var(--neon-purple) / 0.4)"
                : i % 3 === 1
                  ? "hsl(var(--neon-magenta) / 0.3)"
                  : "hsl(var(--gold) / 0.35)",
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 4) * 20}%`,
            boxShadow: `0 0 6px currentColor`,
          }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}

      {/* Top tag */}
      <motion.span
        className="relative text-[9px] tracking-[0.5em] uppercase mb-16 text-primary/40"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: loaded ? 0.5 : 0, y: loaded ? 0 : -10 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Global Hospitality Intelligence
      </motion.span>

      {/* Logo block */}
      <div className="relative">
        {/* Neon glow */}
        <motion.div
          className="absolute -inset-20 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse at center, hsl(var(--neon-purple) / 0.08) 0%, hsl(var(--neon-magenta) / 0.04) 40%, transparent 70%)
            `,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.h1
          className="relative text-6xl md:text-8xl font-bold tracking-[0.3em] select-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundImage: `linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--neon-purple-light)) 50%, hsl(var(--foreground)) 100%)`,
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gateShimmer 8s ease-in-out infinite",
          }}
        >
          RISE
        </motion.h1>
      </div>

      {/* Brand line */}
      <motion.div
        className="relative flex items-center gap-4 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--neon-purple) / 0.3))' }} />
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Noir · Sasso · Global
        </p>
        <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, hsl(var(--neon-purple) / 0.3), transparent)' }} />
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        className="relative flex flex-col sm:flex-row items-center gap-3 mt-16"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <motion.button
          className="px-14 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase font-medium transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--neon-purple)) 0%, hsl(var(--neon-magenta)) 100%)',
            color: 'white',
          }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -8px hsl(var(--neon-purple) / 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogin(true)}
        >
          Enter
        </motion.button>

        <motion.button
          className="px-12 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase border border-neon-purple/20 text-muted-foreground transition-all duration-300 hover:border-neon-purple/40 hover:text-foreground"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/request-invitation")}
        >
          Request Access
        </motion.button>
      </motion.div>

      {/* Bottom watermark */}
      <motion.p
        className="absolute bottom-6 left-0 right-0 text-center text-[8px] tracking-[0.3em] uppercase text-muted-foreground/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3, duration: 1 }}
      >
        RISE · Global Hospitality Intelligence
      </motion.p>

      <style>{`
        @keyframes gateShimmer {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Gate;
