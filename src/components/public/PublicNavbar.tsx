import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Locations", path: "/locations" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
];

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/80 backdrop-blur-2xl border-b border-border/20 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="relative group"
          >
            <span className="text-lg md:text-xl font-display tracking-[0.3em] uppercase text-foreground group-hover:text-primary transition-colors duration-300">
              RISE
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-500" />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-body transition-all duration-300 rounded-lg",
                  location.pathname === link.path
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/request-invitation")}
              className="px-5 py-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground border border-border/40 rounded-lg hover:border-primary/40 hover:text-foreground transition-all duration-300"
            >
              Request Access
            </button>
            <button
              onClick={() => navigate("/?login=true")}
              className="px-5 py-2 text-[10px] tracking-[0.2em] uppercase text-primary-foreground rounded-lg transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-shadow)) 100%)",
              }}
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl pt-20 px-6"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    "text-left py-4 px-4 text-lg font-display tracking-wide border-b border-border/10 transition-colors",
                    location.pathname === link.path ? "text-primary" : "text-foreground"
                  )}
                >
                  {link.label}
                </motion.button>
              ))}
              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={() => navigate("/request-invitation")}
                  className="py-4 text-sm tracking-[0.15em] uppercase border border-border/40 rounded-lg text-muted-foreground"
                >
                  Request Access
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate("/?login=true"); }}
                  className="py-4 text-sm tracking-[0.15em] uppercase rounded-lg text-primary-foreground"
                  style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-shadow)))" }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
