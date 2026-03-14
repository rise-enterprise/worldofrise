import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface IntelligenceModuleProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  delay?: number;
}

export function IntelligenceModule({ icon, title, subtitle, delay = 0 }: IntelligenceModuleProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        className="relative p-6 md:p-8 rounded-2xl border transition-all duration-500 overflow-hidden"
        style={{
          background: hovered
            ? 'linear-gradient(135deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.4) 100%)'
            : 'linear-gradient(135deg, hsl(var(--card) / 0.5) 0%, hsl(var(--card) / 0.2) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: hovered
            ? '0 0 40px hsl(var(--neon-purple) / 0.08), inset 0 1px 0 hsl(var(--neon-purple) / 0.1)'
            : 'inset 0 1px 0 hsl(var(--crystal-silver) / 0.04)',
          borderColor: hovered ? 'hsl(var(--neon-purple) / 0.25)' : 'hsl(var(--border) / 0.15)',
        }}
      >
        {/* Neon top-edge accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--neon-purple) / 0.4), hsl(var(--neon-magenta) / 0.2), transparent)',
            opacity: hovered ? 1 : 0.3,
          }}
        />

        {/* Data flow lines on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px"
              style={{
                top: `${30 + i * 20}%`,
                left: 0,
                right: 0,
                background: `linear-gradient(90deg, transparent, hsl(var(--neon-purple) / 0.1), transparent)`,
                animation: `flowLine ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </motion.div>

        {/* Glow orb */}
        <motion.div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          animate={{
            opacity: hovered ? 0.6 : 0.15,
            scale: hovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="text-neon-purple"
              animate={{ scale: hovered ? 1.15 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
            <div
              className="h-px flex-1"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--neon-purple) / 0.2), transparent)',
              }}
            />
          </div>
          <h3 className="font-display text-lg md:text-xl font-medium text-foreground tracking-crystal mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground tracking-refined leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <style>{`
        @keyframes flowLine {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
