import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Users, Sparkles, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-6 relative">
      <div className="w-full max-w-2xl text-center space-y-12 animate-fade-in">
        {/* Logo Subtitle */}
        <p className="text-sm tracking-[0.4em] text-muted-foreground uppercase">Holding</p>

        {/* Tagline */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
            A Private Circle of Distinction
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Experience luxury beyond transactions. Where every visit is remembered, 
            and every guest is celebrated.
          </p>
        </div>

        {/* Brand Pills */}
        <div className="flex justify-center gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="px-6 py-3 rounded-full bg-card border border-border/50">
            <p className="font-display text-foreground">NOIR Café</p>
            <p className="text-xs text-muted-foreground">نوار كافيه</p>
          </div>
          <div className="px-6 py-3 rounded-full bg-card border border-border/50">
            <p className="font-display text-foreground">SASSO</p>
            <p className="text-xs text-muted-foreground">ساسو</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex justify-center items-center gap-4 animate-slide-up flex-wrap" style={{ animationDelay: '400ms' }}>
          <h1 
            className="font-display text-4xl font-semibold text-gradient-gold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            RISE
          </h1>
          <Button 
            variant="outline" 
            size="xl"
            onClick={() => navigate('/member')}
            className="gap-3"
          >
            <Crown className="h-5 w-5" />
            Member Portal
          </Button>
          <Button 
            variant="luxury" 
            size="lg"
            onClick={() => navigate('/admin/login')}
            className="gap-2"
          >
            <Users className="h-5 w-5" />
            Admin Login
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="p-6 rounded-2xl bg-card border border-border/50 text-left">
            <Sparkles className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-2">Visit-Based Journey</h3>
            <p className="text-sm text-muted-foreground">
              Every experience counts. Build your story with us, visit by visit.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border/50 text-left">
            <Crown className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-2">Five Tiers of Privilege</h3>
            <p className="text-sm text-muted-foreground">
              From Initiation to RISE Black. Each level unlocks exclusive experiences.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border/50 text-left">
            <Users className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-2">Global Recognition</h3>
            <p className="text-sm text-muted-foreground">
              Your status travels with you. Qatar. Riyadh. Wherever RISE welcomes you.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '600ms' }}>
          Qatar 🇶🇦 • Saudi Arabia 🇸🇦
        </p>
      </div>
    </div>
  );
};

export default Index;
