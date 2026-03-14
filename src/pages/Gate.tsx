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
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-center px-6 bg-background">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 80%, hsl(var(--gold) / 0.02) 0%, transparent 50%)" }} />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px rounded-full"
          style={{ background: "hsl(var(--gold) / 0.4)", left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}

      {/* Top tag */}
      <motion.span
        className="relative text-[9px] tracking-[0.5em] uppercase mb-16 text-muted-foreground"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: loaded ? 0.5 : 0, y: loaded ? 0 : -10 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Global Hospitality Intelligence
      </motion.span>

      {/* Logo block */}
      <div className="relative">
        {/* Gold glow */}
        <motion.div
          className="absolute -inset-20 rounded-full"
          style={{ background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.06) 0%, transparent 70%)" }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.h1
          className="relative text-6xl md:text-8xl font-bold tracking-[0.3em] select-none text-primary"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
        <div className="w-8 h-px bg-primary/30" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Noir · Sasso · Global
        </p>
        <div className="w-8 h-px bg-primary/30" />
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        className="relative flex flex-col sm:flex-row items-center gap-3 mt-16"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <motion.button
          className="px-14 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase font-medium bg-primary text-primary-foreground transition-all duration-300"
          whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -8px hsl(var(--gold) / 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogin(true)}
        >
          Enter
        </motion.button>

        <motion.button
          className="px-12 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase border border-border text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-foreground"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/request-invitation")}
        >
          Request Access
        </motion.button>
      </motion.div>

      {/* Bottom watermark */}
      <motion.p
        className="absolute bottom-6 left-0 right-0 text-center text-[8px] tracking-[0.3em] uppercase text-muted-foreground/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3, duration: 1 }}
      >
        RISE · Global Hospitality Intelligence
      </motion.p>
    </div>
  );
};

export default Gate;
