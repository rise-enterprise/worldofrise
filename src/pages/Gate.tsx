import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CrystalBackground } from '@/components/effects/CrystalBackground';

export default function Gate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-noir-black relative overflow-hidden flex flex-col items-center justify-center">
      {/* Ambient Crystal Background */}
      <CrystalBackground variant="subtle" />
      
      {/* Moving Light Reflections */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[200px]"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-burgundy/5 rounded-full blur-[180px]"
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        
        {/* RISE Insignia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/60 text-xs tracking-[0.4em] uppercase font-light">
              Private Society
            </span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display tracking-[0.3em] text-foreground mb-2">
            RISE
          </h1>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto" />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mb-16"
        >
          <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide mb-2">
            Where Access Is Earned
          </p>
          <p className="text-sm text-muted-foreground/60 tracking-widest uppercase">
            Not a program. A circle.
          </p>
        </motion.div>

        {/* Brand Portals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row gap-6 md:gap-12 w-full max-w-2xl"
        >
          {/* NOIR Portal */}
          <GatePortal
            brand="NOIR"
            subtitle="Chocolatier & Café"
            description="Dark elegance. Poetic ritual."
            onClick={() => navigate('/member/login')}
            variant="noir"
          />
          
          {/* SASSO Portal */}
          <GatePortal
            brand="SASSO"
            subtitle="Italian Fine Dining"
            description="Roman heritage. Culinary mastery."
            onClick={() => navigate('/member/login')}
            variant="sasso"
          />
        </motion.div>

        {/* Request Invitation Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          className="mt-16"
        >
          <button
            onClick={() => navigate('/request-invitation')}
            className="text-sm text-muted-foreground/60 hover:text-primary/80 transition-colors duration-300 tracking-widest uppercase group"
          >
            Request an Invitation
            <span className="block w-0 group-hover:w-full h-[1px] bg-primary/40 transition-all duration-500 mt-1" />
          </button>
        </motion.div>

        {/* Admin Access (hidden, subtle) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={() => navigate('/admin/login')}
            className="text-xs text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors duration-300"
          >
            Administration
          </button>
        </motion.div>
      </div>
    </div>
  );
}

interface GatePortalProps {
  brand: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  variant: 'noir' | 'sasso';
}

function GatePortal({ brand, subtitle, description, onClick, variant }: GatePortalProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        group relative flex-1 min-h-[200px] md:min-h-[280px] p-8
        bg-noir-surface/40 backdrop-blur-sm
        border border-crystal/10 hover:border-crystal/20
        rounded-sm overflow-hidden
        transition-all duration-500 ease-out
        ${variant === 'sasso' ? 'hover:border-burgundy/30' : 'hover:border-primary/30'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover Light Sweep */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div 
          className={`
            absolute inset-0 
            ${variant === 'sasso' 
              ? 'bg-gradient-to-br from-burgundy/5 via-transparent to-transparent' 
              : 'bg-gradient-to-br from-primary/5 via-transparent to-transparent'
            }
          `}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between text-left">
        <div>
          <h2 className="text-3xl md:text-4xl font-display tracking-[0.2em] text-foreground mb-2">
            {brand}
          </h2>
          <p className="text-sm text-muted-foreground/80 tracking-wide">
            {subtitle}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground/50 tracking-wider mb-4">
            {description}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/40 group-hover:text-primary/60 transition-colors duration-300">
            <span className="tracking-widest uppercase">Enter</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </div>
        </div>
      </div>
      
      {/* Corner Accent */}
      <div 
        className={`
          absolute bottom-0 right-0 w-16 h-16
          ${variant === 'sasso' 
            ? 'bg-gradient-to-tl from-burgundy/10 to-transparent' 
            : 'bg-gradient-to-tl from-primary/10 to-transparent'
          }
        `}
      />
    </motion.button>
  );
}
