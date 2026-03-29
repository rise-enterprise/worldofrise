import { motion } from "framer-motion";
import PublicLayout from "@/components/public/PublicLayout";
import { Gem, Globe, Heart, Users } from "lucide-react";

const values = [
  { icon: Gem, title: "Refined Excellence", desc: "Every detail curated with intention. From the beans we source to the experiences we craft." },
  { icon: Heart, title: "Genuine Hospitality", desc: "Warmth that transcends borders. Personal attention that makes every visit memorable." },
  { icon: Globe, title: "Global Vision", desc: "A network of exceptional venues spanning Doha, Riyadh, Abu Dhabi, and London." },
  { icon: Users, title: "Community First", desc: "RISE members form a global community of individuals who appreciate the finer things." },
];

export default function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 30%, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%)",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-6">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-display tracking-wide text-foreground mb-6">
            Built on Passion,<br />Driven by Taste
          </h1>
          <p className="text-muted-foreground/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            RISE Holding brings together two exceptional hospitality brands under one vision: 
            creating spaces where people feel extraordinary.
          </p>
        </motion.div>
      </section>

      {/* Brand story */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-16"
          >
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-display tracking-wide text-foreground mb-4">NOIR Café</h2>
                <p className="text-muted-foreground/50 leading-relaxed text-sm">
                  Born in Doha, NOIR Café has grown into a global destination for those who seek more than coffee. 
                  It's a sanctuary of refined taste—where literary atmosphere meets exceptional hospitality. 
                  Each location is a carefully curated space that invites contemplation, conversation, and connection.
                </p>
              </div>
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-card/50 to-muted/20 border border-border/10 flex items-center justify-center">
                <span className="text-3xl font-display tracking-[0.2em] text-muted-foreground/20">NOIR</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 aspect-[4/3] rounded-2xl bg-gradient-to-br from-card/50 to-muted/20 border border-border/10 flex items-center justify-center">
                <span className="text-3xl font-display tracking-[0.2em] text-muted-foreground/20">SASSO</span>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-2xl md:text-3xl font-display tracking-wide text-foreground mb-4">SASSO</h2>
                <p className="text-muted-foreground/50 leading-relaxed text-sm">
                  SASSO reimagines Italian fine dining with reverence for tradition and a spirit of innovation. 
                  Every dish tells a story of craftsmanship, heritage, and indulgence. Our restaurants are 
                  designed to be stages for extraordinary culinary moments.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-4">Values</span>
            <h2 className="text-3xl md:text-4xl font-display tracking-wide text-foreground">What Guides Us</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl border border-border/10 bg-card/20 hover:border-primary/15 transition-all duration-500"
              >
                <v.icon className="w-5 h-5 text-primary/50 mb-4" />
                <h3 className="text-sm font-body font-medium text-foreground tracking-wide mb-2">{v.title}</h3>
                <p className="text-xs text-muted-foreground/50 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
