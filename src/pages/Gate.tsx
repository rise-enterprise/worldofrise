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
      {/* Warm champagne glow behind text */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(200,162,74,0.1) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* RISE text assembling */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, filter: "blur(12px)", scale: 0.9 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 2.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] select-none"
          style={{
            color: "#C8A24A",
            textShadow: "0 0 50px rgba(200,162,74,0.12), 0 0 100px rgba(200,162,74,0.04)",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontWeight: 700,
          }}
        >
          RISE
        </h1>
      </motion.div>

      {/* Warm gold particle scatter */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[1.5px] h-[1.5px] rounded-full"
          style={{
            backgroundColor: "#C8A24A",
            left: `${15 + Math.random() * 70}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          initial={{
            opacity: 0.6,
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 60,
          }}
          animate={{
            opacity: [0, 0.5, 0],
            x: 0,
            y: 0,
          }}
          transition={{
            duration: 2.5,
            delay: 0.3 + i * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}

      {/* Champagne concentric pulse rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(200,162,74,0.04)",
            borderRadius: "50%",
            margin: "auto",
            width: `${60 + ring * 30}%`,
            height: `${60 + ring * 40}%`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.06, 0.3],
          }}
          transition={{
            duration: 4 + ring * 0.6,
            repeat: Infinity,
            delay: ring * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Marble vein lines ── */
function MarbleVeins() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Organic warm stone vein — horizontal */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          top: "32%",
          background: "linear-gradient(90deg, transparent 10%, rgba(200,162,74,0.03), transparent 90%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1.5 }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          top: "68%",
          background: "linear-gradient(90deg, transparent 15%, rgba(200,162,74,0.025), transparent 85%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.5 }}
      />
      {/* Vertical champagne accent */}
      <motion.div
        className="absolute top-0 bottom-0 w-px"
        style={{
          left: "50%",
          background: "linear-gradient(180deg, transparent 25%, rgba(200,162,74,0.02), transparent 75%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
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
        style={{ backgroundColor: "#0a0a0f" }}>
        <CursorGlow />
        <motion.div className="absolute top-4 right-4 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ThemeToggle className="text-[#8a8578]/60 hover:text-[#8a8578]" />
        </motion.div>
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-foreground overflow-hidden relative flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <CursorGlow />
      <MarbleVeins />

      {/* Theme toggle */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <ThemeToggle className="text-[#8a8578]/40 hover:text-[#8a8578]" />
      </motion.div>

      {/* System identifier */}
      <motion.span
        className="text-[8px] tracking-[0.5em] uppercase mb-12"
        style={{ color: "#8a8578", fontFamily: "'Georgia', serif", letterSpacing: "0.5em" }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: loaded ? 0.6 : 0, y: loaded ? 0 : -15 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        GLOBAL LUXURY INTELLIGENCE
      </motion.span>

      {/* Particle Assembly RISE Logo */}
      <RISEParticleAssembly />

      {/* Subtitle */}
      <motion.p
        className="text-[9px] tracking-[0.35em] uppercase mt-8"
        style={{ color: "#8a8578", fontFamily: "'Georgia', serif" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.2, delay: 2.2 }}
      >
        NOIR · SASSO · GLOBAL HOSPITALITY
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="flex flex-col sm:flex-row items-center gap-4 mt-14"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.6 }}
      >
        {/* Enter — luxury minimal */}
        <motion.button
          className="relative px-12 py-4 rounded-lg text-[10px] tracking-[0.35em] uppercase overflow-hidden transition-all duration-500"
          style={{
            backgroundColor: "rgba(200,162,74,0.05)",
            border: "1px solid rgba(200,162,74,0.12)",
            color: "#C8A24A",
            fontFamily: "'Georgia', serif",
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 50px -15px rgba(200,162,74,0.12)",
            borderColor: "rgba(200,162,74,0.25)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogin(true)}
        >
          {/* Warm champagne hover sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(200,162,74,0.04) 50%, transparent 60%)",
            }}
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8 }}
          />
          Enter
        </motion.button>

        {/* Request Access — warm stone */}
        <motion.button
          className="px-10 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase transition-all duration-500"
          style={{
            backgroundColor: "transparent",
            border: "1px solid rgba(200,162,74,0.06)",
            color: "#8a8578",
            fontFamily: "'Georgia', serif",
          }}
          whileHover={{
            scale: 1.02,
            color: "#C8A24A",
            borderColor: "rgba(200,162,74,0.12)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/request-invitation")}
        >
          Request Access
        </motion.button>
      </motion.div>

      {/* Bottom tagline */}
      <motion.p
        className="absolute bottom-6 left-0 right-0 text-center text-[7px] tracking-[0.4em] uppercase"
        style={{ color: "#8a8578", fontFamily: "'Georgia', serif", opacity: 0.3 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3.5, duration: 1.5 }}
      >
        RISE · GLOBAL HOSPITALITY INTELLIGENCE
      </motion.p>
    </div>
  );
};

export default Gate;
