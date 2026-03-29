import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";
import PublicLayout from "@/components/public/PublicLayout";

const Gate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (searchParams.get("login") === "true") setShowLogin(true);
  }, [searchParams]);

  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-8"
          >
            A Private World of Privileges
          </motion.p>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-light tracking-[0.08em] leading-none mb-8 text-foreground"
          >
            RISE
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-base md:text-lg text-muted-foreground font-body max-w-md mx-auto leading-relaxed mb-14"
          >
            Membership by invitation only. An experience reserved for the discerning few.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase font-body bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-300"
            >
              Enter
            </button>
            <button
              onClick={() => navigate("/request-invitation")}
              className="px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase font-body text-muted-foreground border border-border rounded-md hover:text-foreground hover:border-foreground/30 transition-all duration-300"
            >
              Request Membership
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-border to-transparent" />
        </motion.div>
      </section>

      {/* ═══ PHILOSOPHY ═══ */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-6">
              Philosophy
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-foreground leading-tight mb-8">
              Not a loyalty program.<br />
              <span className="italic">A relationship.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              RISE is built on the belief that true luxury is personal. Every privilege, 
              every experience, every gesture is curated around you — quietly, intentionally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ BRANDS ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-4">
              Our Maisons
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-light text-foreground">
              Two Worlds, One Standard
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-px bg-border/50">
            {[
              {
                name: "NOIR Café",
                desc: "Where coffee becomes ritual. A sanctuary of refined taste, literary atmosphere, and curated experiences.",
              },
              {
                name: "SASSO",
                desc: "Italian fine dining reimagined. Authentic craftsmanship meets contemporary elegance in every detail.",
              },
            ].map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="bg-background p-12 md:p-16"
              >
                <h3 className="text-2xl md:text-3xl font-display font-light text-foreground mb-6">
                  {brand.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-8">
                  {brand.desc}
                </p>
                <button
                  onClick={() => navigate("/about")}
                  className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body flex items-center gap-2"
                >
                  Discover <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MEMBERSHIP TIERS ═══ */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-4">
              Membership
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-light text-foreground mb-4">
              Privileges, Not Points
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Each level of membership unlocks a deeper relationship with our world.
            </p>
          </motion.div>

          <div className="space-y-0 border-t border-border/50">
            {[
              { name: "Crystal", desc: "Your journey begins. Complimentary welcomes, birthday celebrations, and priority access." },
              { name: "Onyx", desc: "A deeper connection. Private tastings, seasonal previews, and curated dining moments." },
              { name: "Obsidian", desc: "Inner circle privileges. Exclusive events, personal concierge, and bespoke experiences." },
              { name: "Royal", desc: "By invitation only. The highest expression of our hospitality, tailored entirely to you." },
            ].map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 py-8 border-b border-border/50"
              >
                <h3 className="text-2xl md:text-3xl font-display font-light text-foreground md:w-48 shrink-0">
                  {tier.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tier.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DESTINATIONS ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-4">
              Destinations
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-light text-foreground">
              Where We Are
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/50">
            {["Doha", "Riyadh", "Abu Dhabi", "London"].map((city, i) => (
              <motion.button
                key={city}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => navigate("/locations")}
                className="bg-background aspect-[3/4] flex items-end p-6 group"
              >
                <div>
                  <p className="text-xl md:text-2xl font-display font-light text-foreground group-hover:text-primary transition-colors duration-300">
                    {city}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-foreground mb-6">
            An invitation awaits
          </h2>
          <p className="text-muted-foreground mb-10">
            Membership is by invitation only. Share your interest and we'll be in touch.
          </p>
          <button
            onClick={() => navigate("/request-invitation")}
            className="px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase font-body bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-300"
          >
            Request Membership
          </button>
        </motion.div>
      </section>
    </PublicLayout>
  );
};

export default Gate;