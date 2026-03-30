import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoldenBeatsSceneProps {
  onEnter?: () => void;
  onRequestMembership?: () => void;
}

export function GoldenBeatsScene({ onEnter, onRequestMembership }: GoldenBeatsSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const t = now / 1000;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.46;
      const baseR = Math.min(w, h) * 0.18;
      const bars = 72;

      // Outer atmospheric glow
      const atmosGrad = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR * 3);
      atmosGrad.addColorStop(0, "rgba(196, 168, 122, 0.04)");
      atmosGrad.addColorStop(0.5, "rgba(180, 155, 110, 0.015)");
      atmosGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = atmosGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw golden bars
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;

        const wave1 = Math.sin(t * 1.0 + i * 0.35) * 0.5 + 0.5;
        const wave2 = Math.sin(t * 0.7 + i * 0.6) * 0.5 + 0.5;
        const wave3 = Math.sin(t * 1.5 + i * 0.2) * 0.5 + 0.5;
        const wave4 = Math.sin(t * 0.4 + i * 0.9) * 0.5 + 0.5;

        const barHeight = (wave1 * 0.3 + wave2 * 0.3 + wave3 * 0.2 + wave4 * 0.2) * baseR * 0.55 + baseR * 0.04;

        const innerR = baseR;
        const outerR = baseR + barHeight;

        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;

        const alpha = 0.15 + wave1 * 0.35 + wave2 * 0.15;

        // Bar glow
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(196, 168, 122, ${alpha * 0.3})`;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Bar core
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(210, 185, 140, ${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Inner glow
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.9);
      const breathe = Math.sin(t * 0.8) * 0.5 + 0.5;
      innerGlow.addColorStop(0, `rgba(220, 200, 155, ${0.035 + breathe * 0.025})`);
      innerGlow.addColorStop(0.5, `rgba(190, 165, 120, ${0.015 + breathe * 0.01})`);
      innerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Subtle ring
      ctx.beginPath();
      ctx.arc(cx, cy, baseR - 2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(196, 168, 122, ${0.06 + breathe * 0.03})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Floating particles
      for (let i = 0; i < 40; i++) {
        const pAngle = (i / 40) * Math.PI * 2 + t * 0.05;
        const pR = baseR * 1.6 + Math.sin(t * 0.3 + i * 2.1) * baseR * 0.5;
        const px2 = cx + Math.cos(pAngle) * pR;
        const py2 = cy + Math.sin(pAngle) * pR;
        const pAlpha = 0.08 + Math.sin(t + i * 1.7) * 0.06;
        const pSize = 0.8 + Math.sin(t * 0.5 + i) * 0.4;

        ctx.beginPath();
        ctx.arc(px2, py2, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 168, 122, ${pAlpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0908]">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* RISE monogram */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingBottom: "8vh" }}
      >
        <span
          className="font-display font-light select-none"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            letterSpacing: "0.3em",
            color: "rgba(210, 190, 150, 0.45)",
            textShadow: "0 0 20px rgba(196,168,122,0.1)",
          }}
        >
          RISE
        </span>
      </motion.div>

      {/* Top-left brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
        className="fixed top-8 left-8 z-20"
      >
        <p className="text-[10px] tracking-[0.5em] uppercase text-[#a48b5c]/40 font-body">
          RISE
        </p>
      </motion.div>

      {/* Bottom center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20 text-center"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#a48b5c]/35 font-body mb-6">
          A private world of privileges
        </p>
        <div className="flex items-center gap-6">
          <button
            onClick={onEnter}
            className="px-8 py-3 text-[10px] tracking-[0.2em] uppercase text-[#f5efe4]/70 border border-[#a48b5c]/15 hover:border-[#a48b5c]/40 hover:text-[#f5efe4] transition-all duration-700 font-body"
          >
            Enter
          </button>
          <button
            onClick={onRequestMembership}
            className="px-8 py-3 text-[10px] tracking-[0.2em] uppercase text-[#a48b5c]/30 hover:text-[#a48b5c]/60 transition-all duration-700 font-body"
          >
            Request Membership
          </button>
        </div>
      </motion.div>

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(ellipse 65% 55% at 50% 46%, transparent 25%, rgba(10,9,8,0.7) 100%)",
        }}
      />
    </div>
  );
}
