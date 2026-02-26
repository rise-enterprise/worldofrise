import { motion } from 'framer-motion';

export function AICoreOrb() {
  return (
    <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute inset-3 rounded-full border border-primary/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      {/* Core glow */}
      <div className="absolute inset-6 rounded-full" style={{
        background: 'radial-gradient(circle, hsl(var(--gold) / 0.25) 0%, hsl(var(--gold) / 0.08) 50%, transparent 70%)',
      }} />
      {/* Center diamond */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-6 md:w-8 md:h-8 rotate-45 border border-primary/50"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--gold) / 0.3) 0%, hsl(var(--gold) / 0.1) 100%)',
            boxShadow: '0 0 20px hsl(var(--gold) / 0.3)',
          }}
        />
      </motion.div>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/10"
        animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
      />
    </div>
  );
}
