import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Users, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle crystal background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-accent/20" />
      
      {/* Vertical crystal accent lines */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent" />
      <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent" />

      <div className="w-full max-w-2xl text-center space-y-16 relative z-10">
        {/* Logo */}
        <div 
          className="space-y-3 animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          <h1 
            className="font-display text-5xl md:text-6xl font-medium text-foreground tracking-wide cursor-pointer hover:text-primary/80 transition-colors duration-500"
            onClick={() => navigate('/')}
          >
            RISE
          </h1>
          <p className="text-xs tracking-[0.5em] text-muted-foreground uppercase font-body">
            Loyalty
          </p>
        </div>

        {/* Tagline */}
        <div 
          className="space-y-6 animate-slide-up" 
          style={{ animationDelay: '300ms' }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-normal text-foreground leading-relaxed tracking-crystal">
            A Private World of Privileges
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto font-body text-sm leading-relaxed tracking-refined">
            Where every visit is remembered, and every guest is celebrated.
          </p>
        </div>

        {/* Brand Pills */}
        <div 
          className="flex justify-center gap-8 animate-slide-up" 
          style={{ animationDelay: '500ms' }}
        >
          <div className="glass-panel px-8 py-4 rounded-xl text-center">
            <p className="font-display text-lg text-foreground tracking-crystal">NOIR Café</p>
            <p className="text-xs text-muted-foreground mt-1 font-body">نوار كافيه</p>
          </div>
          <div className="glass-panel px-8 py-4 rounded-xl text-center">
            <p className="font-display text-lg text-foreground tracking-crystal">SASSO</p>
            <p className="text-xs text-muted-foreground mt-1 font-body">ساسو</p>
          </div>
        </div>

        {/* CTAs */}
        <div 
          className="flex justify-center items-center gap-6 animate-slide-up flex-wrap" 
          style={{ animationDelay: '700ms' }}
        >
          <Button 
            variant="crystal"
            size="xl"
            onClick={() => navigate('/member')}
            className="gap-3"
          >
            <Crown className="h-5 w-5" />
            Enter the Circle
          </Button>
          <Button 
            variant="ghost" 
            size="lg"
            onClick={() => navigate('/admin/login')}
            className="gap-2 text-muted-foreground"
          >
            <Users className="h-4 w-4" />
            Admin
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Features */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 animate-slide-up" 
          style={{ animationDelay: '900ms' }}
        >
          <div className="glass-panel p-8 rounded-2xl text-left light-shift">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mb-6">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-3 tracking-crystal">Visit-Based Journey</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every experience counts. Build your story with us, visit by visit.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl text-left light-shift">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mb-6">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-3 tracking-crystal">Five Tiers of Privilege</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From Initiation to RISE Black. Each level unlocks exclusive experiences.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl text-left light-shift">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mb-6">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-3 tracking-crystal">Global Recognition</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your status travels with you. Qatar. Riyadh. Wherever RISE welcomes you.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p 
          className="text-xs text-muted-foreground tracking-widest font-body animate-fade-in" 
          style={{ animationDelay: '1100ms' }}
        >
          Qatar · Saudi Arabia
        </p>
      </div>
    </div>
  );
};

export default Index;
