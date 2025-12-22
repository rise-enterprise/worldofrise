import { Coffee, UtensilsCrossed } from 'lucide-react';

export function BrandsSection() {
  return (
    <section className="py-24 bg-card/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Our Portfolio</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            One Program, Multiple Experiences
          </h2>
          <p className="text-muted-foreground">
            Your RISE status is recognized across all our brands and locations.
          </p>
        </div>

        {/* Brands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* NOIR */}
          <div className="group p-8 rounded-3xl bg-noir border border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-background/10 flex items-center justify-center">
                <Coffee className="h-7 w-7 text-foreground" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">NOIR Café</h3>
                <p className="text-sm text-muted-foreground font-display">نوار كافيه</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              An artisanal coffee experience where every cup tells a story. 
              Specialty roasts, intimate ambiance, and refined hospitality.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-background/10 text-xs text-muted-foreground">Doha</span>
              <span className="px-3 py-1 rounded-full bg-background/10 text-xs text-muted-foreground">Riyadh</span>
            </div>
          </div>

          {/* SASSO */}
          <div className="group p-8 rounded-3xl bg-sasso border border-border/50 hover:border-sasso-accent/30 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-background/10 flex items-center justify-center">
                <UtensilsCrossed className="h-7 w-7 text-sasso-accent" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">SASSO</h3>
                <p className="text-sm text-muted-foreground font-display">Italian Fine Dining</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Authentic Italian gastronomy reimagined. Handcrafted pasta, 
              curated wines, and an atmosphere of understated elegance.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-background/10 text-xs text-muted-foreground">Doha</span>
              <span className="px-3 py-1 rounded-full bg-background/10 text-xs text-muted-foreground">Riyadh</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}