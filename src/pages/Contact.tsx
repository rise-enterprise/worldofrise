import { useState } from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent. We'll be in touch shortly.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 40%, hsl(var(--gold) / 0.03) 0%, transparent 60%)",
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-6">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-6xl font-display tracking-wide text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-muted-foreground/50 text-base max-w-lg mx-auto">
            We'd love to hear from you. Whether you have a question, feedback, or partnership inquiry.
          </p>
        </motion.div>
      </section>

      {/* Contact content */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-card/30 border-border/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-card/30 border-border/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-card/30 border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">Message *</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-card/30 border-border/20 min-h-[140px] resize-none"
                  required
                />
              </div>
              <Button type="submit" variant="vip-gold" size="lg" disabled={sending} className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2 space-y-8"
          >
            <div className="p-6 rounded-xl border border-border/10 bg-card/15">
              <Mail className="w-4 h-4 text-primary/50 mb-3" />
              <h3 className="text-sm font-body font-medium text-foreground mb-1">Email</h3>
              <p className="text-xs text-muted-foreground/50">hello@riseholding.com</p>
            </div>

            <div className="p-6 rounded-xl border border-border/10 bg-card/15">
              <MapPin className="w-4 h-4 text-primary/50 mb-3" />
              <h3 className="text-sm font-body font-medium text-foreground mb-1">Headquarters</h3>
              <p className="text-xs text-muted-foreground/50">Doha, Qatar</p>
            </div>

            <div className="p-6 rounded-xl border border-border/10 bg-card/15 space-y-2">
              <h3 className="text-sm font-body font-medium text-foreground mb-1">Press & Partnerships</h3>
              <p className="text-xs text-muted-foreground/50">For press inquiries and partnership opportunities, please reach out via email.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
