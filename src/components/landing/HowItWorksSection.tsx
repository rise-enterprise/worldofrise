import { Sparkles, TrendingUp, Gift, Star } from 'lucide-react';

const steps = [
  {
    icon: Sparkles,
    title: 'Visit & Earn',
    description: 'Each visit to our venues is automatically recorded. No cards, no stamps—just pure experience.',
  },
  {
    icon: TrendingUp,
    title: 'Rise Through Tiers',
    description: 'From Initiation to RISE Black. Five exclusive tiers, each unlocking new privileges.',
  },
  {
    icon: Gift,
    title: 'Unlock Rewards',
    description: 'Exclusive experiences, priority reservations, and curated surprises await at every level.',
  },
  {
    icon: Star,
    title: 'Be Recognized',
    description: 'Your preferences remembered, your presence celebrated. A truly personal experience.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">The Journey</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            How RISE Works
          </h2>
          <p className="text-muted-foreground">
            A visits-based loyalty experience designed for guests who appreciate the finer things.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-medium text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}