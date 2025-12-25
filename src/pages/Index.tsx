import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Users, Sparkles, ArrowRight, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="w-full max-w-2xl text-center space-y-10 animate-fade-in relative z-10">
        {/* Logo */}
        <div className="space-y-3">
          <h1 
            className="font-display text-5xl font-bold text-gradient-burgundy cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            RISE
          </h1>
          <p className="text-sm tracking-[0.4em] text-muted-foreground uppercase font-medium">Holding</p>
        </div>

        {/* Tagline */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-relaxed">
            A Private Circle of Distinction
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Experience luxury beyond transactions. Where every visit is remembered, 
            and every guest is celebrated.
          </p>
        </div>

        {/* Brand Pills */}
        <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="px-6 py-3 rounded-full bg-card border border-border shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-default">
            <p className="font-display font-semibold text-foreground">NOIR Café</p>
            <p className="text-xs text-muted-foreground">نوار كافيه</p>
          </div>
          <div className="px-6 py-3 rounded-full bg-card border border-border shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-default">
            <p className="font-display font-semibold text-foreground">SASSO</p>
            <p className="text-xs text-muted-foreground">ساسو</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex justify-center items-center gap-4 animate-slide-up flex-wrap" style={{ animationDelay: '400ms' }}>
          <Button 
            variant="qatar-outline"
            size="lg"
            onClick={() => navigate('/member')}
            className="gap-3"
          >
            <Crown className="h-5 w-5" />
            Member Portal
          </Button>
          <Button 
            variant="qatar" 
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Visit-Based Journey</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every experience counts. Build your story with us, visit by visit.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Five Tiers of Privilege</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From Initiation to RISE Black. Each level unlocks exclusive experiences.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground mb-2">Global Recognition</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your status travels with you. Qatar. Riyadh. Wherever RISE welcomes you.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground animate-slide-up font-medium" style={{ animationDelay: '600ms' }}>
          Qatar 🇶🇦 • Saudi Arabia 🇸🇦
        </p>
      </div>
    </div>
  );
};

export default Index;