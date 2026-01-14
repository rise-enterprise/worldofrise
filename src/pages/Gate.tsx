import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CrystalBackground } from '@/components/effects/CrystalBackground';
import { CrystalEmblem } from '@/components/effects/CrystalEmblem';
import { DiamondSparkles } from '@/components/effects/DiamondSparkles';

const Gate = () => {
  const navigate = useNavigate();

  return (
    <CrystalBackground variant="tiffany" className="min-h-screen flex flex-col">
      {/* Diamond sparkles overlay */}
      <DiamondSparkles count={35} />
      
      {/* Header - Private Society */}
      <motion.header
        className="pt-12 pb-6 text-center relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span
          className="text-xs tracking-[0.4em] uppercase font-body"
          style={{
            color: 'hsl(var(--gold) / 0.7)',
          }}
        >
          ─── Private Society ───
        </span>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Crystal Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <CrystalEmblem className="mb-8" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Where Access Is Earned
        </motion.p>

        {/* Brand Portals */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <GatePortal
            brand="NOIR"
            subtitle="Chocolatier & Café"
            description="Literary elegance in every detail"
            onClick={() => navigate('/member')}
            variant="noir"
          />
          <GatePortal
            brand="SASSO"
            subtitle="Fine Dining Italian"
            description="Heritage crafted with precision"
            onClick={() => navigate('/member')}
            variant="sasso"
          />
        </motion.div>

        {/* Request Invitation Button */}
        <motion.button
          className="mt-16 group relative overflow-hidden"
          onClick={() => navigate('/request-invitation')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="px-8 py-3 border transition-all duration-500"
            style={{
              borderColor: 'hsl(var(--gold) / 0.4)',
              background: 'hsl(var(--background) / 0.6)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span
              className="text-xs tracking-[0.3em] uppercase font-body"
              style={{
                color: 'hsl(var(--gold))',
              }}
            >
              Request an Invitation
            </span>
          </div>
          {/* Hover light sweep */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.1) 50%, transparent 100%)',
            }}
          />
        </motion.button>
      </main>

      {/* Footer */}
      <motion.footer
        className="py-8 text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs tracking-widest uppercase transition-colors duration-300 hover:text-foreground"
          style={{
            color: 'hsl(var(--muted-foreground) / 0.5)',
          }}
        >
          Administration
        </button>
      </motion.footer>
    </CrystalBackground>
  );
};

// Portal Card Component
interface GatePortalProps {
  brand: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  variant: 'noir' | 'sasso';
}

function GatePortal({ brand, subtitle, description, onClick, variant }: GatePortalProps) {
  const isNoir = variant === 'noir';

  return (
    <motion.button
      className="flex-1 group relative overflow-hidden"
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card background */}
      <div
        className="relative p-8 transition-all duration-500"
        style={{
          background: isNoir
            ? 'linear-gradient(135deg, hsl(var(--noir-obsidian)) 0%, hsl(220 30% 8%) 100%)'
            : 'linear-gradient(135deg, hsl(var(--noir-obsidian)) 0%, hsl(20 20% 10%) 100%)',
          border: '1px solid hsl(var(--gold) / 0.2)',
          boxShadow: `
            0 0 40px hsl(var(--gold) / 0.05),
            inset 0 1px 0 hsl(var(--gold) / 0.1)
          `,
        }}
      >
        {/* Crystal facet overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              linear-gradient(135deg, transparent 40%, hsl(var(--gold) / 0.15) 50%, transparent 60%),
              linear-gradient(225deg, transparent 40%, hsl(var(--gold) / 0.1) 50%, transparent 60%)
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Brand diamond icon */}
          <div
            className="w-3 h-3 mx-auto mb-4 rotate-45 transition-all duration-500 group-hover:scale-110"
            style={{
              background: isNoir
                ? 'linear-gradient(135deg, hsl(210 20% 60%) 0%, hsl(210 30% 80%) 100%)'
                : 'linear-gradient(135deg, hsl(var(--gold-muted)) 0%, hsl(var(--gold)) 100%)',
              boxShadow: isNoir
                ? '0 0 12px hsl(210 30% 70% / 0.5)'
                : '0 0 12px hsl(var(--gold) / 0.5)',
            }}
          />

          {/* Brand name */}
          <h2
            className="text-2xl font-display tracking-[0.4em] mb-2 transition-all duration-500"
            style={{
              color: 'hsl(var(--foreground))',
            }}
          >
            {brand}
          </h2>

          {/* Divider */}
          <div
            className="w-12 h-[1px] mx-auto mb-3 transition-all duration-500 group-hover:w-16"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.5), transparent)',
            }}
          />

          {/* Subtitle */}
          <p
            className="text-xs tracking-[0.2em] uppercase mb-2"
            style={{
              color: 'hsl(var(--gold) / 0.8)',
            }}
          >
            {subtitle}
          </p>

          {/* Description */}
          <p
            className="text-xs tracking-wide"
            style={{
              color: 'hsl(var(--muted-foreground) / 0.7)',
            }}
          >
            {description}
          </p>

          {/* Enter arrow */}
          <div
            className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0"
          >
            <span
              className="text-xs tracking-widest uppercase"
              style={{
                color: 'hsl(var(--gold) / 0.6)',
              }}
            >
              Enter →
            </span>
          </div>
        </div>

        {/* Hover light sweep */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, hsl(var(--gold) / 0.05) 50%, transparent 100%)',
          }}
          initial={false}
          transition={{ duration: 0.5 }}
        />

        {/* Corner accents */}
        <div
          className="absolute top-0 left-0 w-8 h-[1px] transition-all duration-500 group-hover:w-12"
          style={{ background: 'hsl(var(--gold) / 0.4)' }}
        />
        <div
          className="absolute top-0 left-0 w-[1px] h-8 transition-all duration-500 group-hover:h-12"
          style={{ background: 'hsl(var(--gold) / 0.4)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-8 h-[1px] transition-all duration-500 group-hover:w-12"
          style={{ background: 'hsl(var(--gold) / 0.4)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[1px] h-8 transition-all duration-500 group-hover:h-12"
          style={{ background: 'hsl(var(--gold) / 0.4)' }}
        />
      </div>
    </motion.button>
  );
}

export default Gate;
