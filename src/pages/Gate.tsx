import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";

function RISELogo() {
  return (
    <div className="relative w-64 h-28 md:w-80 md:h-36 mx-auto flex items-center justify-center">
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, rgba(var(--vessel-gold-alpha), 0.06) 0%, transparent 70%)` }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] select-none"
          style={{ color: `rgb(var(--vessel-gold-alpha))`, fontWeight: 700 }}
        >
          RISE
        </h1>
      </motion.div>
      {[1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full"
          style={{
            border: `1px solid rgba(var(--vessel-gold-alpha), 0.06)`,
            margin: "auto",
            width: `${60 + ring * 30}%`,
            height: `${60 + ring * 40}%`,
            inset: 0,
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 4 + ring * 0.6, repeat: Infinity, delay: ring * 0.5, ease: "easeInOut" }}
        />
      ))}
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: "hsl(var(--vessel-bg))" }}>
        <UnifiedLoginForm onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-center px-6 transition-colors duration-300" style={{ backgroundColor: "hsl(var(--vessel-bg))" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, hsl(var(--vessel-bg)) 0%, hsl(var(--vessel-bg) / 0.85) 50%, hsl(var(--vessel-bg)) 100%)" }} />

      <motion.span
        className="relative text-[9px] tracking-[0.4em] uppercase mb-12"
        style={{ color: `rgb(var(--vessel-muted-alpha))` }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: loaded ? 0.6 : 0, y: loaded ? 0 : -10 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        GLOBAL HOSPITALITY INTELLIGENCE
      </motion.span>

      <RISELogo />

      <motion.p
        className="relative text-[10px] tracking-[0.25em] uppercase mt-6"
        style={{ color: `rgb(var(--vessel-muted-alpha))` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        NOIR · SASSO · GLOBAL HOSPITALITY
      </motion.p>

      <motion.div
        className="relative flex flex-col sm:flex-row items-center gap-4 mt-14"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <motion.button
          className="px-12 py-4 rounded-lg text-[10px] tracking-[0.3em] uppercase transition-all duration-400"
          style={{
            backgroundColor: `rgb(var(--vessel-gold-alpha))`,
            color: "#ffffff",
            border: "none",
          }}
          whileHover={{ scale: 1.02, boxShadow: `0 8px 30px -8px rgba(var(--vessel-gold-alpha), 0.3)` }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogin(true)}
        >
          Enter
        </motion.button>

        <motion.button
          className="px-10 py-4 rounded-lg text-[10px] tracking-[0.25em] uppercase transition-all duration-400"
          style={{
            backgroundColor: "transparent",
            border: `1px solid rgba(var(--vessel-gold-alpha), 0.15)`,
            color: `rgb(var(--vessel-muted-alpha))`,
          }}
          whileHover={{ scale: 1.02, borderColor: `rgba(var(--vessel-gold-alpha), 0.3)`, color: `rgb(var(--vessel-gold-alpha))` }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/request-invitation")}
        >
          Request Access
        </motion.button>
      </motion.div>

      <motion.p
        className="absolute bottom-6 left-0 right-0 text-center text-[8px] tracking-[0.3em] uppercase"
        style={{ color: `rgb(var(--vessel-muted-alpha))`, opacity: 0.3 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3, duration: 1 }}
      >
        RISE · GLOBAL HOSPITALITY INTELLIGENCE
      </motion.p>
    </div>
  );
};

export default Gate;
