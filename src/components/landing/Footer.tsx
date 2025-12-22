import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="py-12 bg-card border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="text-center md:text-left">
            <h3 className="font-display text-xl font-semibold text-gradient-gold">RISE</h3>
            <p className="text-xs text-muted-foreground mt-1">A Private Circle of Distinction</p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/join" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Join
            </Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
          </nav>

          {/* Locations */}
          <p className="text-sm text-muted-foreground">
            Qatar 🇶🇦 • Saudi Arabia 🇸🇦
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RISE Holding. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}