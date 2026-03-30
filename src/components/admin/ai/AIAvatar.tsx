import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const sizeMap = { sm: 80, md: 110, lg: 180 };
  const px = sizeMap[size];
  const al = state === "speaking" ? audioLevel : 0;
  const il = state === "listening" ? inputLevel : 0;
  const isActive = state !== "idle";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = px * dpr;
    canvas.width = w;
    canvas.height = w;
    canvas.style.width = `${px}px`;
    canvas.style.height = `${px}px`;

    const cx = w / 2;
    const cy = w / 2;
    const baseR = w * 0.32;

    const draw = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, w);

      // Number of waveform bars around the circle
      const bars = 48;
      const reactivity = isActive ? (al + il) : 0;
      const breathe = Math.sin(t * 1.2) * 0.5 + 0.5; // 0–1

      // Draw golden bars radiating outward
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;

        // Create organic movement per bar
        const wave1 = Math.sin(t * 2.5 + i * 0.4) * 0.5 + 0.5;
        const wave2 = Math.sin(t * 1.8 + i * 0.7) * 0.5 + 0.5;
        const wave3 = Math.sin(t * 3.2 + i * 0.25) * 0.5 + 0.5;

        // Height driven by audio + idle animation
        const idleHeight = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25) * baseR * 0.35;
        const activeHeight = reactivity * baseR * 0.6 * (wave1 * 0.5 + wave2 * 0.3 + 0.2);
        const barHeight = idleHeight + activeHeight + baseR * 0.06;

        const innerR = baseR;
        const outerR = baseR + barHeight;

        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;

        // Gold gradient per bar
        const alpha = 0.3 + wave1 * 0.4 + reactivity * 0.3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(196, 168, 122, ${Math.min(alpha, 0.9)})`;
        ctx.lineWidth = dpr * 2.2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Inner glow circle
      const glowR = baseR * 0.85;
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      const glowAlpha = 0.04 + breathe * 0.03 + reactivity * 0.06;
      glowGrad.addColorStop(0, `rgba(210, 185, 140, ${glowAlpha * 2})`);
      glowGrad.addColorStop(0.6, `rgba(180, 155, 110, ${glowAlpha})`);
      glowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [px, state, audioLevel, inputLevel, isActive, al, il]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center flex-col",
        onClick && "cursor-pointer group",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Canvas beats */}
      <div className={cn(
        "relative",
        onClick && "group-hover:scale-[1.03] group-active:scale-[0.97] transition-transform duration-500"
      )}>
        <canvas ref={canvasRef} className="block" />

        {/* RISE text in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-display font-light select-none"
            style={{
              fontSize: px * 0.13,
              letterSpacing: px * 0.02,
              color: "rgba(210, 190, 150, 0.6)",
            }}
          >
            RISE
          </span>
        </div>
      </div>

      {/* Label */}
      <div className={cn("flex flex-col items-center gap-1", size === "sm" ? "mt-2" : "mt-3")}>
        <span
          className="text-[9px] uppercase font-body"
          style={{
            letterSpacing: "0.3em",
            color: isActive ? "rgba(210,190,150,0.5)" : "rgba(160,150,130,0.25)",
            transition: "color 500ms",
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
