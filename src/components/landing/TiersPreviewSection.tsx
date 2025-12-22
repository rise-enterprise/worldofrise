import { cn } from '@/lib/utils';
import { Crown, Check } from 'lucide-react';

const tiers = [
  {
    name: 'Initiation',
    nameAr: 'البداية',
    visits: '0–4',
    color: 'tier-initiation',
    benefits: ['Welcome recognition', 'Visit tracking', 'Exclusive updates'],
  },
  {
    name: 'Connoisseur',
    nameAr: 'الخبير',
    visits: '5–14',
    color: 'tier-connoisseur',
    benefits: ['Priority seating', 'Birthday recognition', 'Seasonal surprises'],
  },
  {
    name: 'Elite',
    nameAr: 'النخبة',
    visits: '15–29',
    color: 'tier-elite',
    benefits: ['Exclusive events access', 'Personalized service', 'Chef selections'],
    featured: true,
  },
  {
    name: 'Inner Circle',
    nameAr: 'الدائرة الداخلية',
    visits: '30–49',
    color: 'tier-inner-circle',
    benefits: ['Private dining priority', 'Dedicated concierge', 'Annual celebration'],
  },
  {
    name: 'RISE Black',
    nameAr: 'رايز بلاك',
    visits: '50+',
    color: 'tier-black',
    benefits: ['Ultimate privileges', 'Global recognition', 'Bespoke experiences'],
  },
];

export function TiersPreviewSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">The Tiers</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Five Levels of Distinction
          </h2>
          <p className="text-muted-foreground">
            Progress through our tiers with each visit. Every level brings new privileges and recognition.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={cn(
                'p-6 rounded-2xl border transition-all duration-300 animate-fade-in',
                tier.featured 
                  ? 'bg-primary/10 border-primary/30 scale-105' 
                  : 'bg-card border-border/50 hover:border-primary/20'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Tier Header */}
              <div className="flex items-center justify-between mb-4">
                <Crown className={cn(
                  'h-5 w-5',
                  tier.featured ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className="text-xs text-muted-foreground">{tier.visits} visits</span>
              </div>

              {/* Tier Name */}
              <h3 className="font-display text-lg font-medium text-foreground mb-1">
                {tier.name}
              </h3>
              <p className="text-xs text-muted-foreground font-display mb-4">{tier.nameAr}</p>

              {/* Benefits */}
              <ul className="space-y-2">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}