import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { CrystalEmblem } from '@/components/effects/CrystalEmblem';
import { Button } from '@/components/ui/button';

export default function VerificationPending() {
  const navigate = useNavigate();

  return (
    <CrystalPageWrapper variant="tiffany" sparkleCount={25}>
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-lg"
        >
          {/* Insignia */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/60 text-xs tracking-[0.3em] uppercase">
              RISE
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          {/* Animated Crystal Emblem with Clock */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-full border-2 border-primary/30 flex items-center justify-center bg-background/50 backdrop-blur-xl">
              <Clock className="w-10 h-10 text-primary/60" />
            </div>
            {/* Rotating outer ring */}
            <motion.div
              className="absolute inset-0 w-24 h-24 mx-auto rounded-full border border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          
          <h1 className="text-2xl md:text-3xl font-display tracking-crystal text-foreground mb-4">
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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-background/50 border border-primary/20 rounded-lg mb-12 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            <span className="text-xs text-muted-foreground/60 tracking-widest uppercase">
              Under Review
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground/60 hover:text-primary"
            >
              Return to Gate
            </Button>
          </div>
        </motion.div>
      </div>
    </CrystalPageWrapper>
  );
}
