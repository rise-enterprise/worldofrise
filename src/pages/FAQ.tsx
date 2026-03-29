import { motion } from "framer-motion";
import PublicLayout from "@/components/public/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "Membership",
    items: [
      { q: "How do I become a RISE member?", a: "Membership is by invitation. You can request access through our website. Each application is reviewed personally by our team." },
      { q: "Is there a membership fee?", a: "RISE membership is complimentary. It's our way of recognizing and rewarding our most valued guests." },
      { q: "How do tiers work?", a: "RISE has multiple tiers from Initiation to Inner Circle. You progress based on visits and engagement. Each tier unlocks deeper privileges." },
      { q: "Can I use my membership at all locations?", a: "Yes. Your RISE membership is recognized across all NOIR Café and SASSO locations globally." },
    ],
  },
  {
    category: "Points & Rewards",
    items: [
      { q: "How do I earn points?", a: "Points are earned with every visit to a NOIR Café or SASSO location. The number of points varies by tier and brand." },
      { q: "How do I redeem rewards?", a: "Browse available rewards in your member portal. Select a reward and present it at your next visit." },
      { q: "Do points expire?", a: "Points remain active as long as you maintain regular visits. Extended inactivity may affect your balance." },
    ],
  },
  {
    category: "Account & Privacy",
    items: [
      { q: "How is my data protected?", a: "We take privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties." },
      { q: "Can I update my preferences?", a: "Yes, you can update your profile, dining preferences, and notification settings anytime from your member portal." },
    ],
  },
];

export default function FAQ() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 40%, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)",
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-6">
            Support
          </span>
          <h1 className="text-4xl md:text-6xl font-display tracking-wide text-foreground mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground/50 text-base max-w-lg mx-auto">
            Everything you need to know about RISE membership and privileges.
          </p>
        </motion.div>
      </section>

      {/* FAQ sections */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.1 }}
            >
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-primary/40 font-body mb-6">
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`${si}-${i}`}
                    className="border border-border/10 rounded-xl px-6 bg-card/15 data-[state=open]:border-primary/15 transition-colors"
                  >
                    <AccordionTrigger className="text-sm font-body text-foreground tracking-wide hover:text-primary py-5 hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground/60 leading-relaxed pb-5">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
