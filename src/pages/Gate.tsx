import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { EnergyGrid } from "@/components/effects/EnergyGrid";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { AICoreOrb } from "@/components/gate/AICoreOrb";
import { IntelligenceModule } from "@/components/gate/IntelligenceModule";
import { GateBrandPortal } from "@/components/gate/GateBrandPortal";
import { DiamondSparkles } from "@/components/effects/DiamondSparkles";
import { Eye, TrendingUp, Zap, Sparkles } from "lucide-react";

const Gate = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <CursorGlow />
        <EnergyGrid />
        <DiamondSparkles count={15} />
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
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

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <EnergyGrid />
        <DiamondSparkles count={25} />

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

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Explore</span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-primary/30 to-transparent"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* ═══════ INTELLIGENCE MODULES ═══════ */}
      <section className="relative py-24 md:py-32 px-6">
        <EnergyGrid />
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary/60 font-body">The Intelligence Layer</span>
            <h2 className="font-display text-3xl md:text-5xl font-medium mt-4 tracking-crystal">
              An Ecosystem That <span className="gold-gradient-text">Understands</span> You.
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-5">
            <IntelligenceModule
              icon={<Eye className="w-5 h-5" />}
              title="Your Visits. Predicted."
              subtitle="RISE AI analyzes your patterns to anticipate when you'll visit next and prepare your preferred experience."
              delay={0}
            />
            <IntelligenceModule
              icon={<Sparkles className="w-5 h-5" />}
              title="Your Rewards. Optimized."
              subtitle="Intelligent reward timing ensures you redeem at the perfect moment for maximum value."
              delay={0.1}
            />
            <IntelligenceModule
              icon={<TrendingUp className="w-5 h-5" />}
              title="Your Tier. Accelerated."
              subtitle="Smart progression tracking identifies the fastest path to your next tier milestone."
              delay={0.2}
            />
            <IntelligenceModule
              icon={<Zap className="w-5 h-5" />}
              title="Your Experience. Personalized."
              subtitle="Every touchpoint adapts to your preferences, creating a bespoke loyalty journey."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ═══════ BRAND PORTAL ═══════ */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary/60 font-body">Our Brands</span>
            <h2 className="font-display text-3xl md:text-5xl font-medium mt-4 tracking-crystal">
              Two Worlds. <span className="gold-gradient-text">One Society</span>.
            </h2>
          </ScrollReveal>

          <GateBrandPortal onEnter={() => setShowLogin(true)} theme={theme} />
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="relative py-24 md:py-32 px-6">
        <ScrollReveal className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-crystal mb-6">
            Ready to Enter?
          </h2>
          <p className="text-muted-foreground tracking-refined mb-10">
            Join a private network where loyalty is intelligent, rewards are personal, and every visit is remembered.
          </p>
          <motion.button
            className="px-10 py-4 rounded-xl border border-primary/40 bg-primary/10 backdrop-blur-xl text-primary text-sm tracking-[0.25em] uppercase font-body transition-all duration-300 hover:bg-primary/20 hover:border-primary/60 hover:shadow-gold-glow"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogin(true)}
          >
            Begin Your Journey
          </motion.button>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground/40 tracking-[0.2em] uppercase font-body">
          RISE Loyalty Intelligence · Where Access Is Earned
        </p>
      </footer>
    </div>
  );
};

export default Gate;
