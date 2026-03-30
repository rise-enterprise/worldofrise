import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export type AIState = "idle" | "listening" | "thinking" | "speaking";

interface AIAvatarProps {
  state: AIState;
  className?: string;
  size?: "sm" | "md" | "lg";
  audioLevel?: number;
  inputLevel?: number;
  onClick?: () => void;
  clickLabel?: string;
}

export default function AIAvatar({
  state,
  className,
  size = "lg",
  audioLevel = 0,
  inputLevel = 0,
  onClick,
  clickLabel,
}: AIAvatarProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });

  const sizeMap = { sm: 88, md: 120, lg: 200 };
  const px = sizeMap[size];
  const isActive = state !== "idle";
  const al = state === "speaking" ? audioLevel : 0;
  const il = state === "listening" ? inputLevel : 0;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove, isMobile]);

  // Canvas-based orb rendering for premium quality
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = px * dpr;
    canvas.width = w;
    canvas.height = w;
    canvas.style.width = `${px}px`;
    canvas.style.height = `${px}px`;

    let startTime = performance.now();

    const draw = (now: number) => {
      const t = (now - startTime) / 1000;
      ctx.clearRect(0, 0, w, w);

      const cx = w / 2;
      const cy = w / 2;
      const r = w * 0.42;

      // Breathing
      const breathe = 1 + Math.sin(t * 0.8) * 0.012;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(breathe, breathe);
      ctx.translate(-cx, -cy);

      // 1. Deep shadow underneath
      const shadowGrad = ctx.createRadialGradient(cx, cy + r * 0.6, 0, cx, cy + r * 0.6, r * 1.2);
      shadowGrad.addColorStop(0, "rgba(20, 16, 10, 0.25)");
      shadowGrad.addColorStop(1, "rgba(20, 16, 10, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, w, w);

      // 2. Main sphere body — dark glass
      const bodyGrad = ctx.createRadialGradient(
        cx - r * 0.2, cy - r * 0.25, r * 0.1,
        cx, cy, r
      );
      bodyGrad.addColorStop(0, "rgba(245, 238, 225, 0.12)");
      bodyGrad.addColorStop(0.3, "rgba(180, 160, 120, 0.08)");
      bodyGrad.addColorStop(0.6, "rgba(60, 50, 35, 0.65)");
      bodyGrad.addColorStop(0.85, "rgba(25, 20, 14, 0.9)");
      bodyGrad.addColorStop(1, "rgba(10, 8, 5, 0.95)");

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // 3. Internal luminance — state-driven color
      const hueShift = state === "listening" ? 0.6 : state === "thinking" ? 0.3 : 0;
      const lumR = state === "listening" ? 120 : state === "thinking" ? 100 : 200;
      const lumG = state === "listening" ? 180 : state === "thinking" ? 130 : 170;
      const lumB = state === "listening" ? 180 : state === "thinking" ? 200 : 120;
      const lumIntensity = isActive ? 0.12 + al * 0.15 + il * 0.1 : 0.06 + Math.sin(t * 0.5) * 0.02;

      const lumGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.7);
      lumGrad.addColorStop(0, `rgba(${lumR}, ${lumG}, ${lumB}, ${lumIntensity * 1.5})`);
      lumGrad.addColorStop(0.5, `rgba(${lumR}, ${lumG}, ${lumB}, ${lumIntensity * 0.5})`);
      lumGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = lumGrad;
      ctx.fill();

      // 4. Caustic light bands (speaking)
      if (state === "speaking" && al > 0.02) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        for (let i = 0; i < 4; i++) {
          const yOff = cy + (i - 1.5) * r * 0.18 + Math.sin(t * 2 + i) * r * 0.05;
          const bandGrad = ctx.createLinearGradient(cx - r, yOff, cx + r, yOff);
          bandGrad.addColorStop(0, "rgba(200, 180, 130, 0)");
          bandGrad.addColorStop(0.3, `rgba(220, 200, 150, ${al * 0.08})`);
          bandGrad.addColorStop(0.5, `rgba(240, 225, 180, ${al * 0.12})`);
          bandGrad.addColorStop(0.7, `rgba(220, 200, 150, ${al * 0.08})`);
          bandGrad.addColorStop(1, "rgba(200, 180, 130, 0)");
          ctx.fillStyle = bandGrad;
          ctx.fillRect(cx - r, yOff - r * 0.02, r * 2, r * 0.04 + al * r * 0.06);
        }
        ctx.restore();
      }

      // 5. Specular highlight — top-left crescent
      const specX = cx - r * 0.3;
      const specY = cy - r * 0.35;
      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, r * 0.55);
      specGrad.addColorStop(0, `rgba(255, 252, 245, ${isActive ? 0.35 + al * 0.1 : 0.25})`);
      specGrad.addColorStop(0.3, `rgba(240, 230, 210, ${isActive ? 0.12 : 0.08})`);
      specGrad.addColorStop(0.6, "rgba(200, 185, 155, 0.02)");
      specGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();

      // 6. Rim light — bottom edge
      const rimGrad = ctx.createRadialGradient(cx, cy + r * 0.1, r * 0.7, cx, cy, r);
      rimGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      rimGrad.addColorStop(0.85, "rgba(0, 0, 0, 0)");
      rimGrad.addColorStop(0.95, `rgba(${lumR}, ${lumG}, ${lumB}, ${isActive ? 0.08 + al * 0.06 : 0.04})`);
      rimGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // 7. Glass edge — crisp circle border
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 185, 155, ${isActive ? 0.08 + al * 0.04 : 0.05})`;
      ctx.lineWidth = dpr * 0.8;
      ctx.stroke();

      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [px, state, audioLevel, inputLevel, isActive, al, il]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center flex-col",
        onClick && "cursor-pointer group",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Atmospheric glow behind orb */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: px * 1.8,
          height: px * 1.8,
          background: state === "listening"
            ? `radial-gradient(circle, rgba(120,180,180,${isActive ? 0.06 + il * 0.08 : 0.03}) 0%, transparent 65%)`
            : state === "thinking"
              ? `radial-gradient(circle, rgba(100,130,200,${0.05}) 0%, transparent 65%)`
              : `radial-gradient(circle, rgba(200,170,120,${isActive ? 0.06 + al * 0.06 : 0.03}) 0%, transparent 65%)`,
          filter: `blur(${px * 0.2}px)`,
          transition: "background 800ms ease",
        }}
      />

      {/* Canvas orb */}
      <div className={cn(
        "relative",
        onClick && "group-hover:scale-[1.02] group-active:scale-[0.97] transition-transform duration-500"
      )}>
        <canvas ref={canvasRef} className="block" />

        {/* RISE monogram over canvas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-display font-light select-none"
            style={{
              fontSize: px * 0.14,
              letterSpacing: px * 0.025,
              color: `rgba(240, 232, 215, ${isActive ? 0.55 + al * 0.15 : 0.4})`,
              textShadow: `0 0 ${6 + al * 8}px rgba(200,175,120, ${isActive ? 0.2 : 0.1})`,
              transition: "color 400ms, text-shadow 200ms",
            }}
          >
            RISE
          </span>
        </div>
      </div>

      {/* Subtle outer ring — only one, very refined */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: px + 24,
          height: px + 24,
          border: `0.5px solid rgba(200, 185, 155, ${isActive ? 0.08 + al * 0.06 : 0.04})`,
          transition: "border-color 500ms",
        }}
      />

      {/* State label */}
      <div className={cn("flex flex-col items-center gap-1", size === "sm" ? "mt-2.5" : "mt-4")}>
        <span
          className="text-[9px] uppercase font-body transition-colors duration-700"
          style={{
            letterSpacing: "0.3em",
            color: isActive
              ? state === "listening" ? "rgba(140,195,195,0.6)"
                : state === "thinking" ? "rgba(140,155,210,0.6)"
                : "rgba(200,175,130,0.5)"
              : "rgba(160,150,130,0.25)",
          }}
        >
          {state === "idle" ? "RISE" : state === "listening" ? "LISTENING" : state === "thinking" ? "THINKING" : "SPEAKING"}
        </span>
        {clickLabel && state === "idle" && (
          <span
            className="text-[8px] uppercase font-body animate-fade-in"
            style={{
              letterSpacing: "0.2em",
              color: "rgba(180,160,120,0.2)",
              animationDelay: "2s",
              animationFillMode: "both",
            }}
          >
            {clickLabel}
          </span>
        )}
      </div>
    </div>
  );
}
