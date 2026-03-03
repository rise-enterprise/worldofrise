import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";
import { CursorGlow } from "@/components/effects/CursorGlow";

/* ── Particle Assembly Logo ── */
function RISEParticleAssembly() {
  return (
    <div className="relative w-64 h-28 md:w-80 md:h-36 mx-auto flex items-center justify-center">
      {/* Ambient glow behind text */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(200,162,74,0.08) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* RISE text assembling from particles */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, filter: "blur(12px)", scale: 0.9 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] select-none"
          style={{
            color: "#C8A24A",
            textShadow: "0 0 40px rgba(200,162,74,0.15), 0 0 80px rgba(200,162,74,0.05)",
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
          }}
        >
          RISE
        </h1>
      </motion.div>

      {/* Particle scatter effect */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full"
          style={{
            backgroundColor: i % 3 === 0 ? "#C8A24A" : "#8a8a94",
            left: `${15 + Math.random() * 70}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          initial={{
            opacity: 0.8,
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 80,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            x: 0,
            y: 0,
          }}
          transition={{
            duration: 2,
            delay: 0.2 + i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}

      {/* Siri-style concentric pulse rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(138,138,148,0.06)",
            borderRadius: "50%",
            margin: "auto",
            width: `${60 + ring * 30}%`,
            height: `${60 + ring * 40}%`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.08, 0.3],
          }}
          transition={{
            duration: 3 + ring * 0.5,
            repeat: Infinity,
            delay: ring * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Industrial depth lines ── */
function IndustrialDepth() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Horizontal steel line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          top: "30%",
          background: "linear-gradient(90deg, transparent 10%, rgba(138,138,148,0.04), transparent 90%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          top: "70%",
          background: "linear-gradient(90deg, transparent 15%, rgba(138,138,148,0.03), transparent 85%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      />
      {/* Vertical accent */}
      <motion.div
        className="absolute top-0 bottom-0 w-px"
        style={{
          left: "50%",
          background: "linear-gradient(180deg, transparent 20%, rgba(200,162,74,0.03), transparent 80%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      />
    </div>
  );
}

const Gate = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
        style={{ backgroundColor: "#060608" }}>
        <CursorGlow />
        <motion.div className="absolute top-4 right-4 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ThemeToggle className="text-[#8a8a94]/60 hover:text-[#8a8a94]" />
        </motion.div>
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-foreground overflow-hidden relative flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#060608" }}
    >
      <CursorGlow />
      <IndustrialDepth />

      {/* Theme toggle */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <ThemeToggle className="text-[#8a8a94]/40 hover:text-[#8a8a94]" />
      </motion.div>

      {/* System identifier */}
      <motion.span
        className="text-[8px] tracking-[0.5em] uppercase font-mono mb-12"
        style={{ color: "#4a4a54" }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : -15 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        ─── INTELLIGENCE HEADQUARTERS ───
      </motion.span>

      {/* Particle Assembly RISE Logo */}
      <RISEParticleAssembly />

      {/* Subtitle */}
      <motion.p
        className="text-[9px] tracking-[0.35em] uppercase font-mono mt-8"
        style={{ color: "#5a5a64" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        LOYALTY INTELLIGENCE · OPERATIONAL COMMAND
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="flex flex-col sm:flex-row items-center gap-4 mt-14"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.4 }}
      >
        {/* Enter Headquarters — matte steel button */}
        <motion.button
          className="relative px-10 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase font-mono overflow-hidden transition-all duration-500"
          style={{
            backgroundColor: "rgba(200,162,74,0.06)",
            border: "1px solid rgba(200,162,74,0.15)",
            color: "#C8A24A",
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 40px -10px rgba(200,162,74,0.15)",
            borderColor: "rgba(200,162,74,0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogin(true)}
        >
          {/* Metallic hover sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(200,162,74,0.06) 50%, transparent 60%)",
            }}
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          Enter Headquarters
        </motion.button>

        {/* Request Invitation — minimal steel */}
        <motion.button
          className="px-10 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase font-mono transition-all duration-500"
          style={{
            backgroundColor: "transparent",
            border: "1px solid rgba(138,138,148,0.08)",
            color: "#5a5a64",
          }}
          whileHover={{
            scale: 1.02,
            color: "#8a8a94",
            borderColor: "rgba(138,138,148,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/request-invitation")}
        >
          Request Access
        </motion.button>
      </motion.div>

      {/* Bottom system line */}
      <motion.p
        className="absolute bottom-6 left-0 right-0 text-center text-[7px] tracking-[0.3em] uppercase font-mono"
        style={{ color: "#3a3a44" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        RISE · WHERE ACCESS IS ENGINEERED
      </motion.p>
    </div>
  );
};

export default Gate;
