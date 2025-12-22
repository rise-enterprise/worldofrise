import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { Crown, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function PublicNavigation() {
  const { user, member, signOut, isLoading } = useMemberAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-gradient-gold">RISE</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          {user && member ? (
            <>
              <Link to="/member" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Status
              </Link>
              <Link to="/rewards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Rewards
              </Link>
            </>
          ) : null}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="w-24 h-10 bg-muted animate-pulse rounded-md" />
          ) : user && member ? (
            <div className="flex items-center gap-4">
              <Link to="/member" className="flex items-center gap-2 text-sm text-foreground">
                <Crown className="h-4 w-4 text-primary" />
                <span>{member.full_name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="luxury" onClick={() => navigate('/join')}>
                Join Now
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border/30 transition-all duration-300",
        mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}>
        <div className="container mx-auto px-6 py-4 space-y-4">
          <Link 
            to="/" 
            className="block py-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="block py-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            About
          </Link>
          {user && member ? (
            <>
              <Link 
                to="/member" 
                className="block py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                My Status
              </Link>
              <Link 
                to="/rewards" 
                className="block py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Rewards
              </Link>
              <button 
                className="w-full text-left py-2 text-destructive"
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                Login
              </Button>
              <Button variant="luxury" onClick={() => { navigate('/join'); setMobileOpen(false); }}>
                Join Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}