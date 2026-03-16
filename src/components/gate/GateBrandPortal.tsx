import { motion } from 'framer-motion';
import noirLogoDark from '@/assets/noir-logo.png';
import noirLogoLight from '@/assets/noir-logo-light.png';
import sassoLogo from '@/assets/sasso-logo.png';

interface GateBrandPortalProps {
  onEnter: () => void;
  theme: 'light' | 'dark';
}

export function GateBrandPortal({ onEnter, theme }: GateBrandPortalProps) {
  const currentNoirLogo = theme === 'light' ? noirLogoLight : noirLogoDark;

  return (
    <motion.button
      className="w-full group relative overflow-hidden"
      onClick={onEnter}
      whileHover={{ scale: 1.01, y: -4 }}
      whileTap={{ scale: 0.99 }}
    >
      <div
        className="relative p-8 md:p-12 rounded-2xl transition-all duration-500 border border-primary/10 group-hover:border-primary/25"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.3) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'inset 0 1px 0 hsl(var(--neon-purple) / 0.05)',
        }}
      >
        {/* Neon top-edge */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-40 group-hover:opacity-80 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--neon-purple) / 0.4), hsl(var(--neon-magenta) / 0.2), transparent)',
          }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-6 md:gap-12 mb-8">
            <div className="flex flex-col items-center">
              <img
                src={currentNoirLogo}
                alt="NOIR"
                className="h-14 md:h-20 mb-2 transition-transform duration-500 group-hover:scale-110"
              />
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60">
                Ultra dining experience
              </span>
            </div>

            <div
              className="h-14 w-px"
              style={{ background: 'linear-gradient(180deg, transparent, hsl(var(--neon-purple) / 0.3), transparent)' }}
            />

            <div className="flex flex-col items-center">
              <img
                src={sassoLogo}
                alt="SASSO"
                className="h-14 md:h-20 mb-2 transition-transform duration-500 group-hover:scale-110"
              />
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60">
                Fine Dining Italian
              </span>
            </div>
          </div>

          <div
            className="w-20 h-px mx-auto mb-4 transition-all duration-500 group-hover:w-28"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--neon-purple) / 0.4), transparent)' }}
          />

          <p className="text-xs tracking-wide text-center text-neon-purple/50">
            Enter the Ultra loyalty experience
          </p>

          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
            <span className="text-xs tracking-widest uppercase text-neon-purple/50">
              Sign In →
            </span>
          </div>
        </div>

        {/* Corner accents — neon purple */}
        <div className="absolute top-0 left-0 w-8 h-px bg-neon-purple/25 group-hover:w-12 transition-all duration-500" />
        <div className="absolute top-0 left-0 h-8 w-px bg-neon-purple/25 group-hover:h-12 transition-all duration-500" />
        <div className="absolute bottom-0 right-0 w-8 h-px bg-neon-magenta/20 group-hover:w-12 transition-all duration-500" />
        <div className="absolute bottom-0 right-0 h-8 w-px bg-neon-magenta/20 group-hover:h-12 transition-all duration-500" />
      </div>
    </motion.button>
  );
}
