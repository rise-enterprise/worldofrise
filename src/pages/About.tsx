import { PublicNavigation } from '@/components/landing/PublicNavigation';
import { Footer } from '@/components/landing/Footer';
import { Crown, Sparkles, Gift, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-24 bg-gradient-luxury">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              About <span className="text-gradient-gold">RISE</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A private loyalty circle designed for guests who appreciate exceptional experiences. 
              Where every visit is remembered, and every guest is celebrated.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="prose prose-invert mx-auto">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-6">
                RISE was born from a simple belief: loyalty should be personal, not transactional. 
                We created a program that recognizes and rewards the guests who make our venues special.
              </p>
              <p className="text-muted-foreground mb-6">
                From NOIR Café's artisanal coffee experiences to SASSO's Italian fine dining, 
                RISE connects you to a portfolio of exceptional hospitality across Qatar and Saudi Arabia.
              </p>
              <p className="text-muted-foreground">
                Your journey with us is unique. As you visit our venues, you naturally progress through 
                five tiers of membership, each unlocking new privileges and personalized experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-4">
                Our Promise
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">Recognition</h3>
                <p className="text-sm text-muted-foreground">Every visit counts. Your loyalty is always acknowledged.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">Excellence</h3>
                <p className="text-sm text-muted-foreground">Curated experiences that exceed expectations.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">Generosity</h3>
                <p className="text-sm text-muted-foreground">Meaningful rewards that enhance your experience.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">A private circle of like-minded individuals.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}