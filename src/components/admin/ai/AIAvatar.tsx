import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import aiAvatarImg from "@/assets/ai-avatar.png";

export type AIState = "idle" | "listening" | "thinking" | "speaking";

interface AIAvatarProps {
  state: AIState;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Animated holographic AI avatar with state-driven effects.
 * Uses a generated cybernetic portrait with CSS-driven animations
 * for breathing, blinking, glow states, and ambient particles.
 */
export default function AIAvatar({ state, className, size = "lg" }: AIAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; dur: number }[]>([]);

  useEffect(() => {
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 4,
    }));
    setParticles(p);
  }, []);

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64 md:w-72 md:h-72",
  };

  const isActive = state !== "idle";

  return (
    <div className={cn("relative flex items-center justify-center", className)} ref={containerRef}>
      {/* Ambient glow behind avatar */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-1000",
          sizeClasses[size],
        )}
        style={{
          background: `radial-gradient(circle, hsl(var(--neon-purple) / ${isActive ? 0.25 : 0.12}) 0%, hsl(var(--neon-magenta) / ${isActive ? 0.15 : 0.06}) 40%, transparent 70%)`,
          filter: `blur(${isActive ? 40 : 25}px)`,
          transform: `scale(${isActive ? 1.5 : 1.3})`,
        }}
      />

      {/* Scanning rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={`ring-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size === "lg" ? 320 + i * 40 : size === "md" ? 240 + i * 30 : 160 + i * 20,
            height: size === "lg" ? 320 + i * 40 : size === "md" ? 240 + i * 30 : 160 + i * 20,
            border: `1px solid hsl(var(--neon-purple) / ${state === "thinking" ? 0.3 : 0.08})`,
            animation: state === "thinking"
              ? `aiScanRing ${3 + i * 0.5}s ease-out ${i * 0.4}s infinite`
              : state === "listening"
                ? `aiPulseRing ${2 + i * 0.3}s ease-in-out ${i * 0.3}s infinite`
                : `aiIdleRing ${6 + i}s ease-in-out ${i * 2}s infinite`,
          }}
        />
      ))}

      {/* Orbiting circuit particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.id % 3 === 0
              ? "hsl(var(--neon-purple-light))"
              : p.id % 3 === 1
                ? "hsl(var(--neon-magenta-light))"
                : "hsl(var(--neon-blue-light))",
            opacity: isActive ? 0.7 : 0.3,
            boxShadow: `0 0 ${isActive ? 8 : 4}px currentColor`,
            animation: `aiFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
            transition: "opacity 0.5s",
          }}
        />
      ))}

      {/* Avatar container */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Holographic overlay */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10"
          style={{
            background: `linear-gradient(135deg, hsl(var(--neon-purple) / 0.05) 0%, transparent 40%, hsl(var(--neon-blue) / 0.05) 60%, transparent 100%)`,
            animation: "aiHolographicShift 4s ease-in-out infinite",
          }}
        />

        {/* Main avatar image */}
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <img
            src={aiAvatarImg}
            alt="RISE AI"
            className={cn(
              "w-full h-full object-cover object-top transition-all duration-700",
              state === "speaking" && "brightness-110",
            )}
            style={{
              filter: `brightness(${state === "speaking" ? 1.1 : state === "thinking" ? 0.95 : 1}) saturate(${isActive ? 1.2 : 1})`,
              animation: "aiBreathe 4s ease-in-out infinite",
            }}
          />

          {/* Neon rim light */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: `
                inset 0 0 30px hsl(var(--neon-purple) / ${isActive ? 0.2 : 0.1}),
                inset 0 0 60px hsl(var(--neon-magenta) / ${isActive ? 0.1 : 0.05}),
                0 0 ${isActive ? 40 : 20}px hsl(var(--neon-purple) / ${isActive ? 0.3 : 0.15}),
                0 0 ${isActive ? 80 : 40}px hsl(var(--neon-magenta) / ${isActive ? 0.15 : 0.08})
              `,
              transition: "box-shadow 0.5s",
            }}
          />

          {/* Listening pulse overlay */}
          {state === "listening" && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: "2px solid hsl(var(--neon-cyan) / 0.4)",
                animation: "aiListenPulse 1.5s ease-in-out infinite",
              }}
            />
          )}

          {/* Speaking mouth glow */}
          {state === "speaking" && (
            <div
              className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[30%] h-[8%] rounded-full pointer-events-none"
              style={{
                background: "hsl(var(--neon-magenta) / 0.25)",
                filter: "blur(6px)",
                animation: "aiMouthMove 0.3s ease-in-out infinite alternate",
              }}
            />
          )}

          {/* Scan line effect for thinking */}
          {state === "thinking" && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
              style={{
                background: "linear-gradient(180deg, transparent 0%, hsl(var(--neon-purple) / 0.08) 50%, transparent 100%)",
                backgroundSize: "100% 30px",
                animation: "aiScanLine 1.5s linear infinite",
              }}
            />
          )}
        </div>

        {/* Corner data frames */}
        <div className="absolute -top-2 -left-2 w-6 h-6 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-neon-purple/40" />
          <div className="absolute top-0 left-0 w-px h-full bg-neon-purple/40" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-px bg-neon-purple/40" />
          <div className="absolute top-0 right-0 w-px h-full bg-neon-purple/40" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-full h-px bg-neon-magenta/30" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-neon-magenta/30" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-px bg-neon-magenta/30" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-neon-magenta/30" />
        </div>
      </div>

      {/* State label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
        <span
          className="text-[9px] uppercase tracking-[0.25em] font-medium transition-colors duration-500"
          style={{
            color: state === "listening"
              ? "hsl(var(--neon-cyan))"
              : state === "thinking"
                ? "hsl(var(--neon-purple-light))"
                : state === "speaking"
                  ? "hsl(var(--neon-magenta-light))"
                  : "hsl(var(--muted-foreground) / 0.5)",
          }}
        >
          {state === "idle" ? "RISE ONE" : state === "listening" ? "LISTENING" : state === "thinking" ? "ANALYZING" : "SPEAKING"}
        </span>
      </div>

      <style>{`
        @keyframes aiBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @keyframes aiScanRing {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes aiPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
        @keyframes aiIdleRing {
          0%, 100% { transform: scale(1); opacity: 0.08; }
          50% { transform: scale(1.05); opacity: 0.15; }
        }
        @keyframes aiFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-8px) translateX(4px); opacity: 0.7; }
          50% { transform: translateY(-4px) translateX(-6px); opacity: 0.5; }
          75% { transform: translateY(-10px) translateX(2px); opacity: 0.6; }
        }
        @keyframes aiHolographicShift {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes aiListenPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; box-shadow: 0 0 15px hsl(var(--neon-cyan) / 0.2); }
          50% { transform: scale(1.05); opacity: 0.7; box-shadow: 0 0 30px hsl(var(--neon-cyan) / 0.3); }
        }
        @keyframes aiMouthMove {
          0% { height: 4%; opacity: 0.2; }
          100% { height: 10%; opacity: 0.35; }
        }
        @keyframes aiScanLine {
          0% { background-position: 0 -100%; }
          100% { background-position: 0 200%; }
        }
      `}</style>
    </div>
  );
}
