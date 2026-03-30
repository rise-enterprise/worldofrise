import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "About", path: "/about" },
  { label: "Locations", path: "/locations" },
  { label: "Membership", path: "/request-invitation" },
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
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/95 backdrop-blur-sm border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="group">
            <span className="text-sm font-display tracking-[0.35em] uppercase text-foreground">
              RISE
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "text-[11px] tracking-[0.12em] uppercase font-body transition-colors duration-300",
                  location.pathname === link.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={() => navigate("/?login=true")}
              className="text-[11px] tracking-[0.12em] uppercase font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background pt-20 px-6"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    "text-left py-5 text-lg font-display tracking-wide border-b border-border/30 transition-colors",
                    location.pathname === link.path ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                onClick={() => { setMobileOpen(false); navigate("/?login=true"); }}
                className="mt-8 py-4 text-sm tracking-[0.12em] uppercase font-body text-foreground border border-foreground rounded-md"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}