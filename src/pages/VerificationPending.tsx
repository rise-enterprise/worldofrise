import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerificationPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 30% at 50% 30%, hsl(var(--gold) / 0.04) 0%, transparent 60%),
          radial-gradient(ellipse 30% 25% at 70% 70%, hsl(var(--neon-purple) / 0.03) 0%, transparent 50%)
        `,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Pulsing clock icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-10"
        >
          <div className="w-20 h-20 mx-auto rounded-full border border-primary/20 flex items-center justify-center bg-card/30 backdrop-blur-xl">
            <Clock className="w-8 h-8 text-primary/50" />
          </div>
          <motion.div
            className="absolute inset-0 w-20 h-20 mx-auto rounded-full border border-primary/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-6">
          RISE
        </span>
        
        <h1 className="text-2xl md:text-3xl font-display tracking-wide text-foreground mb-4">
          Verification in Progress
        </h1>
        
        <p className="text-muted-foreground/50 mb-3 leading-relaxed text-sm">
          Your request is being reviewed with the attention it deserves.
        </p>
        <p className="text-xs text-muted-foreground/30 mb-12 leading-relaxed">
          We will reach out to you shortly.
        </p>

        {/* Status pill */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-card/30 border border-border/10 rounded-full mb-12 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
          <span className="text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase font-body">
            Under Review
          </span>
        </div>
        
        <div>
          <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground/40 hover:text-primary text-sm">
            Return Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
