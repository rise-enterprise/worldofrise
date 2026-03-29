import { motion } from "framer-motion";
import PublicLayout from "@/components/public/PublicLayout";

export default function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="min-h-[70vh] flex items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center max-w-3xl"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-6">
            Our Story
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-light text-foreground leading-tight mb-8">
            Built on Passion,<br />Driven by Taste
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            RISE Holding brings together two exceptional hospitality brands under one vision: 
            creating spaces where people feel extraordinary.
          </p>
        </motion.div>
      </section>

      {/* Brand Story */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div>
              <h2 className="text-3xl font-display font-light text-foreground mb-6">NOIR Café</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Born in Doha, NOIR Café has grown into a global destination for those who seek more than coffee. 
                It's a sanctuary of refined taste — where literary atmosphere meets exceptional hospitality. 
                Each location is a carefully curated space that invites contemplation, conversation, and connection.
              </p>
            </div>
            <div className="aspect-[4/3] bg-secondary/50 rounded-sm flex items-center justify-center">
              <span className="text-2xl font-display tracking-[0.15em] text-muted-foreground/30">NOIR</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div className="order-2 md:order-1 aspect-[4/3] bg-secondary/50 rounded-sm flex items-center justify-center">
              <span className="text-2xl font-display tracking-[0.15em] text-muted-foreground/30">SASSO</span>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-display font-light text-foreground mb-6">SASSO</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                SASSO reimagines Italian fine dining with reverence for tradition and a spirit of innovation. 
                Every dish tells a story of craftsmanship, heritage, and indulgence. Our restaurants are 
                designed to be stages for extraordinary culinary moments.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-4">Values</p>
            <h2 className="text-3xl md:text-4xl font-display font-light text-foreground">What Guides Us</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-px bg-border/50">
            {[
              { title: "Refined Excellence", desc: "Every detail curated with intention. From the beans we source to the experiences we craft." },
              { title: "Genuine Hospitality", desc: "Warmth that transcends borders. Personal attention that makes every visit memorable." },
              { title: "Global Vision", desc: "A network of exceptional venues spanning Doha, Riyadh, Abu Dhabi, and London." },
              { title: "Community", desc: "RISE members form a global community of individuals who appreciate the finer things." },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-10"
              >
                <h3 className="text-sm font-body font-medium text-foreground mb-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}