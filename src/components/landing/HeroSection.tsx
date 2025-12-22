import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crown } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-luxury" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 mb-8 animate-fade-in">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Private Loyalty Circle</span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          Where Every Visit<br />
          <span className="text-gradient-gold">Becomes a Story</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          An exclusive loyalty experience for discerning guests. Earn recognition, 
          unlock privileges, and join a private circle of distinction across our portfolio.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Button 
            variant="luxury" 
            size="xl"
            onClick={() => navigate('/join')}
            className="gap-3"
          >
            Join the Program
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="xl"
            onClick={() => navigate('/login')}
          >
            Member Login
          </Button>
        </div>

        {/* Locations */}
        <p className="mt-16 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
          Qatar 🇶🇦 • Saudi Arabia 🇸🇦
        </p>
      </div>
    </section>
  );
}