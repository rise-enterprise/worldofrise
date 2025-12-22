import { PublicNavigation } from '@/components/landing/PublicNavigation';
import { Footer } from '@/components/landing/Footer';
import { Gift, Star, Coffee, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const rewards = [
  {
    id: 1,
    title: 'Complimentary Dessert',
    description: 'Enjoy a house dessert on us at any SASSO location',
    points: 500,
    brand: 'sasso',
    tier: 'All Members',
  },
  {
    id: 2,
    title: 'Signature Coffee',
    description: 'A specialty coffee of your choice at NOIR Café',
    points: 300,
    brand: 'noir',
    tier: 'All Members',
  },
  {
    id: 3,
    title: 'Private Dining Experience',
    description: 'An exclusive private dining session for two',
    points: 5000,
    brand: 'sasso',
    tier: 'Inner Circle+',
  },
  {
    id: 4,
    title: 'Chef Table Experience',
    description: 'A curated 7-course menu prepared by our executive chef',
    points: 8000,
    brand: 'sasso',
    tier: 'RISE Black',
  },
];

export default function Rewards() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <main className="pt-16">
        {/* Header */}
        <section className="py-16 bg-gradient-luxury">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <Gift className="h-12 w-12 text-primary mx-auto mb-6" />
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Rewards
            </h1>
            <p className="text-lg text-muted-foreground">
              Redeem your points for exclusive experiences and privileges
            </p>
          </div>
        </section>

        {/* Rewards Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {rewards.map((reward) => (
                <div 
                  key={reward.id}
                  className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {reward.brand === 'noir' ? (
                        <Coffee className="h-5 w-5 text-foreground" />
                      ) : (
                        <UtensilsCrossed className="h-5 w-5 text-sasso-accent" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {reward.tier}
                    </Badge>
                  </div>

                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    {reward.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {reward.points.toLocaleString()} points
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Redeem
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}