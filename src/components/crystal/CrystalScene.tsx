import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CrystalObject } from './CrystalObject';
import { ParticleField } from './CrystalEnvironment';
import { motion, AnimatePresence } from 'framer-motion';

interface CrystalSceneProps {
  memberName?: string;
  tierName?: string;
  onEnter?: () => void;
  onRequestMembership?: () => void;
}

export function CrystalScene({
  memberName = 'RISE',
  tierName,
  onEnter,
  onRequestMembership,
}: CrystalSceneProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [showUI, setShowUI] = useState(true);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
    setShowUI((prev) => !prev);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0908]">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: 3, // ACESFilmic
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#0a0908']} />
        <fog attach="fog" args={['#0a0908', 8, 25]} />

        <ambientLight intensity={0.08} color="#f5efe4" />

        <Suspense fallback={null}>
          <CrystalObject
            memberName={memberName}
            tierName={tierName || 'Crystal'}
            isExpanded={isExpanded}
            onToggle={handleToggle}
            activeLayer={activeLayer}
            onLayerHover={setActiveLayer}
          />
          <ParticleField count={600} />
        </Suspense>
      </Canvas>

      {/* HTML overlay — minimal, only when not expanded */}
      <AnimatePresence>
        {showUI && (
          <>
            {/* Top-left brand mark */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="fixed top-8 left-8 z-20"
            >
              <p className="text-[10px] tracking-[0.5em] uppercase text-[#a48b5c]/50 font-body">
                RISE
              </p>
            </motion.div>

            {/* Bottom center — invitation text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20 text-center"
            >
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#a48b5c]/40 font-body mb-6">
                A private world of privileges
              </p>
              <div className="flex items-center gap-6">
                <button
                  onClick={onEnter}
                  className="px-8 py-3 text-[10px] tracking-[0.2em] uppercase text-[#f5efe4]/80 border border-[#a48b5c]/20 rounded-none hover:border-[#a48b5c]/50 hover:text-[#f5efe4] transition-all duration-700 font-body"
                >
                  Enter
                </button>
                <button
                  onClick={onRequestMembership}
                  className="px-8 py-3 text-[10px] tracking-[0.2em] uppercase text-[#a48b5c]/40 hover:text-[#a48b5c]/70 transition-all duration-700 font-body"
                >
                  Request Membership
                </button>
              </div>
            </motion.div>

            {/* Bottom-right — interaction hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 2.5 }}
              className="fixed bottom-8 right-8 z-20"
            >
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#a48b5c]/20 font-body">
                Click the crystal to explore
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Expanded state — privilege labels */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed top-8 right-8 z-20"
          >
            <button
              onClick={handleToggle}
              className="text-[10px] tracking-[0.2em] uppercase text-[#a48b5c]/50 hover:text-[#a48b5c]/80 transition-colors duration-500 font-body"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(10,9,8,0.6) 100%)',
        }}
      />
    </div>
  );
}
