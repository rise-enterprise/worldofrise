import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, MapPin, Star, Shield, Sparkles } from "lucide-react";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";
import PublicLayout from "@/components/public/PublicLayout";

const Gate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  useEffect(() => {
    if (searchParams.get("login") === "true") setShowLogin(true);
  }, [searchParams]);

  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 50% 30% at 50% 20%, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 30% 20% at 70% 80%, hsl(var(--gold) / 0.03) 0%, transparent 50%)
          `,
        }} />
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <PublicLayout>
      {/* ═══ HERO SECTION ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Layered ambient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 20%, hsl(var(--neon-purple) / 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 20% 80%, hsl(var(--neon-magenta) / 0.04) 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 80% 30%, hsl(var(--gold) / 0.05) 0%, transparent 50%)
            `,
          }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground) / 0.3) 1px, transparent 1px)`,
            backgroundSize: "100px 100px",
          }} />
        </div>

        {/* Floating orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 200 + i * 80,
              height: 200 + i * 80,
              left: `${10 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: i % 2 === 0
                ? `radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 70%)`
                : `radial-gradient(circle, hsl(var(--gold) / 0.03) 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-primary/50 font-body">
              Global Hospitality Intelligence
            </span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-medium tracking-[0.15em] leading-none mb-6"
            style={{
              backgroundImage: `linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--gold)) 40%, hsl(var(--foreground)) 70%, hsl(var(--neon-purple-light) / 0.6) 100%)`,
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gateShimmer 10s ease-in-out infinite",
            }}
          >
            RISE
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground/60 font-body max-w-lg mx-auto leading-relaxed mb-12"
          >
            A private world of privileges for the discerning few.
            <br className="hidden sm:block" />
            <span className="text-foreground/40">NOIR Café · SASSO · Global</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              className="group relative px-10 py-4 rounded-xl text-sm tracking-[0.15em] uppercase font-body font-medium overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-shadow)) 100%)",
                color: "hsl(var(--primary-foreground))",
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px -8px hsl(var(--gold) / 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLogin(true)}
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>

            <motion.button
              className="px-10 py-4 rounded-xl text-sm tracking-[0.15em] uppercase font-body border border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/request-invitation")}
            >
              Request Access
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══ BRANDS SECTION ═══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-4">
              Our World
            </span>
            <h2 className="text-3xl md:text-5xl font-display tracking-wide text-foreground">
              Two Brands, One Vision
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                name: "NOIR Café",
                desc: "Where coffee becomes ritual. A sanctuary of refined taste, literary atmosphere, and curated experiences across Doha, Riyadh, Abu Dhabi, and London.",
                gradient: "from-[hsl(220,15%,8%)] to-[hsl(220,12%,12%)]",
                accent: "neon-purple",
              },
              {
                name: "SASSO",
                desc: "Italian fine dining reimagined. Authentic craftsmanship meets contemporary elegance in every dish, every setting, every moment.",
                gradient: "from-[hsl(25,15%,8%)] to-[hsl(25,10%,12%)]",
                accent: "gold",
              },
            ].map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`group relative rounded-2xl overflow-hidden border border-border/15 bg-gradient-to-b ${brand.gradient} p-10 md:p-14 cursor-pointer transition-all duration-500 hover:border-primary/20`}
                style={{
                  boxShadow: "0 8px 40px -12px rgba(0,0,0,0.4)",
                }}
              >
                {/* Accent glow */}
                <div
                  className="absolute top-0 left-1/4 right-1/4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(var(--${brand.accent}) / 0.4), transparent)` }}
                />

                <h3 className="text-2xl md:text-3xl font-display tracking-wide text-foreground mb-4">
                  {brand.name}
                </h3>
                <p className="text-muted-foreground/50 leading-relaxed text-sm md:text-base max-w-md">
                  {brand.desc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-primary/40 group-hover:text-primary/70 transition-colors duration-300">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-body">Discover</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES / WHY RISE ═══ */}
      <section className="relative py-32 px-6">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)",
        }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-4">
              Membership
            </span>
            <h2 className="text-3xl md:text-5xl font-display tracking-wide text-foreground mb-4">
              Privileges, Not Points
            </h2>
            <p className="text-muted-foreground/50 max-w-lg mx-auto text-sm md:text-base">
              RISE is not a loyalty program. It's an invitation to a world of refined experiences.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Star, title: "Tier Progression", desc: "From Initiation to Inner Circle. Each level unlocks deeper privileges." },
              { icon: Shield, title: "Exclusive Access", desc: "Private events, tastings, and experiences reserved for members." },
              { icon: Sparkles, title: "AI Concierge", desc: "Personalized recommendations powered by intelligent hospitality." },
              { icon: MapPin, title: "Global Network", desc: "Privileges across Doha, Riyadh, Abu Dhabi, and London." },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-xl border border-border/10 p-7 bg-card/30 backdrop-blur-sm hover:border-primary/15 hover:bg-card/50 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center mb-5 group-hover:border-primary/25 transition-colors">
                  <feat.icon className="w-4 h-4 text-primary/60" />
                </div>
                <h4 className="text-sm font-body font-medium text-foreground tracking-wide mb-2">
                  {feat.title}
                </h4>
                <p className="text-xs text-muted-foreground/50 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LOCATIONS PREVIEW ═══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-4">
              Destinations
            </span>
            <h2 className="text-3xl md:text-5xl font-display tracking-wide text-foreground">
              Where We Are
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Doha", "Riyadh", "Abu Dhabi", "London"].map((city, i) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border/10 bg-card/20 flex items-end p-6 cursor-pointer hover:border-primary/20 transition-all duration-500"
              >
                {/* Gradient fill */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-gold/5 group-hover:from-neon-purple/10 group-hover:to-gold/8 transition-all duration-700" />
                <div className="relative z-10">
                  <MapPin className="w-4 h-4 text-primary/40 mb-2" />
                  <p className="text-lg font-display tracking-wide text-foreground">{city}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate("/locations")}
              className="text-[11px] tracking-[0.2em] uppercase text-primary/50 hover:text-primary transition-colors font-body flex items-center gap-2 mx-auto"
            >
              View all locations <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 50% 40% at 50% 50%, hsl(var(--gold) / 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 30% 60%, hsl(var(--neon-purple) / 0.03) 0%, transparent 50%)
          `,
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-display tracking-wide text-foreground mb-6">
            Ready to Enter?
          </h2>
          <p className="text-muted-foreground/50 mb-10 text-sm md:text-base">
            Membership is by invitation only. Request access and join our global community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              className="px-10 py-4 rounded-xl text-sm tracking-[0.15em] uppercase font-body font-medium"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-shadow)) 100%)",
                color: "hsl(var(--primary-foreground))",
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px -8px hsl(var(--gold) / 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/request-invitation")}
            >
              Request Invitation
            </motion.button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-10 py-4 text-sm tracking-[0.15em] uppercase font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              Already a member? Sign In
            </button>
          </div>
        </motion.div>
      </section>

      <style>{`
        @keyframes gateShimmer {
          0%, 100% { background-position: 300% 0; }
          50% { background-position: -300% 0; }
        }
      `}</style>
    </PublicLayout>
  );
};

export default Gate;
