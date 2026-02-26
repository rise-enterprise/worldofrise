import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { AICoreOrb } from "@/components/gate/AICoreOrb";

const Gate = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <CursorGlow />
        <motion.div
          className="absolute top-4 right-4 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ThemeToggle className="text-primary/60 hover:text-primary hover:bg-primary/10" />
        </motion.div>
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative flex flex-col items-center justify-center px-6">
      <CursorGlow />

      {/* Theme toggle */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ThemeToggle className="text-primary/60 hover:text-primary hover:bg-primary/10" />
      </motion.div>

      {/* Private Society header */}
      <motion.span
        className="text-xs tracking-[0.4em] uppercase font-body text-primary/60 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ─── Private Society ───
      </motion.span>

      {/* AI Core Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <AICoreOrb />
      </motion.div>

      {/* Hero headline */}
      <motion.h1
        className="font-display text-4xl md:text-6xl lg:text-7xl font-medium text-center mt-10 tracking-crystal leading-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6 }}
      >
        Welcome to{' '}
        <span className="gold-gradient-text">Intelligent Loyalty</span>.
      </motion.h1>

      <motion.p
        className="text-sm md:text-base tracking-[0.2em] uppercase text-muted-foreground mt-6 font-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        Powered by RISE AI
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="flex flex-col sm:flex-row items-center gap-4 mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        <motion.button
          className="px-8 py-3.5 rounded-xl border border-primary/40 bg-primary/10 backdrop-blur-xl text-primary text-sm tracking-[0.2em] uppercase font-body transition-all duration-300 hover:bg-primary/20 hover:border-primary/60 hover:shadow-gold-glow"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLogin(true)}
        >
          Enter the Society
        </motion.button>

        <motion.button
          className="px-8 py-3.5 rounded-xl border border-border/30 bg-card/30 backdrop-blur-xl text-muted-foreground text-sm tracking-[0.2em] uppercase font-body transition-all duration-300 hover:text-foreground hover:border-border/60"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/request-invitation")}
        >
          Request Invitation
        </motion.button>
      </motion.div>

      {/* Tagline at bottom */}
      <motion.p
        className="absolute bottom-6 left-0 right-0 text-center text-xs text-muted-foreground/40 tracking-[0.2em] uppercase font-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        RISE Loyalty Intelligence · Where Access Is Earned
      </motion.p>
    </div>
  );
};

export default Gate;
