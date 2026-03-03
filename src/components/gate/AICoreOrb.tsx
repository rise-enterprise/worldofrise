import { motion } from 'framer-motion';

/**
 * Gate-level RISE emblem — 2D particle assembly version
 * Used on the landing page before entering the 3D headquarters
 */
export function AICoreOrb() {
  return (
    <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
      {/* Industrial outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(138,138,148,0.1)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner titanium ring */}
      <motion.div
        className="absolute inset-3 rounded-full"
        style={{ border: "1px solid rgba(138,138,148,0.06)" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      {/* Core gold glow */}
      <div className="absolute inset-6 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(200,162,74,0.15) 0%, rgba(200,162,74,0.04) 50%, transparent 70%)',
      }} />
      {/* Center diamond — gold accent */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-5 h-5 md:w-7 md:h-7 rotate-45"
          style={{
            border: '1px solid rgba(200,162,74,0.3)',
            background: 'linear-gradient(135deg, rgba(200,162,74,0.15) 0%, rgba(200,162,74,0.05) 100%)',
            boxShadow: '0 0 20px rgba(200,162,74,0.15)',
          }}
        />
      </motion.div>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(138,138,148,0.06)" }}
        animate={{ scale: [1, 1.3, 1.3], opacity: [0.4, 0, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
      />
    </div>
  );
}
