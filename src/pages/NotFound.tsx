import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 40% 30% at 50% 40%, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%),
          radial-gradient(ellipse 30% 25% at 30% 60%, hsl(var(--gold) / 0.03) 0%, transparent 50%)
        `,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md"
      >
        <motion.h1
          className="text-7xl md:text-9xl font-display text-foreground/10 mb-4 leading-none"
          style={{
            backgroundImage: "linear-gradient(135deg, hsl(var(--foreground) / 0.15) 0%, hsl(var(--primary) / 0.3) 50%, hsl(var(--foreground) / 0.15) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </motion.h1>
        
        <h2 className="text-xl font-display tracking-wide text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-muted-foreground/40 mb-10">
          This passage does not exist within our realm.
        </p>
        
        <Button variant="outline" size="lg" onClick={() => navigate('/')} className="border-border/20">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
