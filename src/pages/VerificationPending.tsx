import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { CrystalBackground } from '@/components/effects/CrystalBackground';
import { Button } from '@/components/ui/button';

export default function VerificationPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-noir-black relative overflow-hidden flex flex-col items-center justify-center">
      <CrystalBackground variant="subtle" />
      
      {/* Ambient Light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* Insignia */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-primary/40" />
          <span className="text-primary/60 text-xs tracking-[0.3em] uppercase">
            RISE
          </span>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-primary/40" />
        </div>

        {/* Icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 mx-auto mb-8 rounded-full border border-primary/20 flex items-center justify-center"
        >
          <Clock className="w-8 h-8 text-primary/50" />
        </motion.div>
        
        <h1 className="text-2xl md:text-3xl font-display tracking-wider text-foreground mb-4">
          Verification in Progress
        </h1>
        
        <p className="text-muted-foreground/70 mb-4 leading-relaxed">
          Your request is being reviewed with the attention it deserves.
        </p>
        
        <p className="text-sm text-muted-foreground/50 mb-12 leading-relaxed">
          We will reach out to you shortly. In the meantime, 
          feel free to visit one of our establishments.
        </p>

        {/* Status Indicator */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-noir-surface/40 border border-crystal/10 rounded-sm mb-12">
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
          <span className="text-xs text-muted-foreground/60 tracking-widest uppercase">
            Under Review
          </span>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground/60 hover:text-foreground"
          >
            Return to Gate
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
