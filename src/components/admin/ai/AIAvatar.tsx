import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import aiAvatarImg from "@/assets/ai-avatar.png";

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
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; dur: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        dur: 2 + Math.random() * 4,
      }))
    );
  }, []);

  const sizeClasses = { sm: "w-32 h-32", md: "w-48 h-48", lg: "w-64 h-64 md:w-72 md:h-72" };
  const isActive = state !== "idle";
  const al = state === "speaking" ? audioLevel : 0;
  const il = state === "listening" ? inputLevel : 0;

  return (
    <div
      className={cn("relative flex items-center justify-center flex-col", onClick && "cursor-pointer group", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Ambient glow */}
      <div
        className={cn("absolute rounded-full transition-all duration-300", sizeClasses[size])}
        style={{
          background: `radial-gradient(circle, hsl(var(--neon-purple) / ${isActive ? 0.25 + al * 0.2 : 0.12}) 0%, hsl(var(--neon-magenta) / ${isActive ? 0.15 + al * 0.15 : 0.06}) 40%, transparent 70%)`,
          filter: `blur(${isActive ? 40 + al * 20 : 25}px)`,
          transform: `scale(${isActive ? 1.5 + al * 0.3 : 1.3})`,
        }}
      />

      {/* Scanning rings */}
      {[0, 1, 2].map((i) => {
        const ringLevel = state === "listening" ? il : state === "speaking" ? al : 0;
        return (
          <div
            key={`ring-${i}`}
            className="absolute rounded-full pointer-events-none transition-all duration-100"
            style={{
              width: size === "lg" ? 320 + i * 40 : size === "md" ? 240 + i * 30 : 160 + i * 20,
              height: size === "lg" ? 320 + i * 40 : size === "md" ? 240 + i * 30 : 160 + i * 20,
              border: `1px solid hsl(var(${state === "listening" ? "--neon-cyan" : "--neon-purple"}) / ${
                state === "thinking" ? 0.3 : isActive ? 0.1 + ringLevel * 0.4 : 0.08
              })`,
              boxShadow: ringLevel > 0.1 ? `0 0 ${ringLevel * 15}px hsl(var(${state === "listening" ? "--neon-cyan" : "--neon-purple"}) / ${ringLevel * 0.2})` : "none",
              animation: state === "thinking"
                ? `aiScanRing ${3 + i * 0.5}s ease-out ${i * 0.4}s infinite`
                : state === "listening"
                  ? `aiPulseRing ${2 + i * 0.3}s ease-in-out ${i * 0.3}s infinite`
                  : `aiIdleRing ${6 + i}s ease-in-out ${i * 2}s infinite`,
            }}
          />
        );
      })}

      {/* Particles */}
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
            backgroundColor:
              p.id % 3 === 0 ? "hsl(var(--neon-purple-light))" : p.id % 3 === 1 ? "hsl(var(--neon-magenta-light))" : "hsl(var(--neon-blue-light))",
            opacity: isActive ? 0.4 + al * 0.5 : 0.3,
            boxShadow: `0 0 ${isActive ? 4 + al * 8 : 4}px currentColor`,
            animation: `aiFloat ${p.dur / (1 + al * 0.5)}s ease-in-out ${p.delay}s infinite`,
            transition: "opacity 100ms, box-shadow 100ms",
          }}
        />
      ))}

      {/* Avatar container */}
      <div className={cn("relative", sizeClasses[size], onClick && "group-hover:scale-[1.03] transition-transform duration-300")}>
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
            className="w-full h-full object-cover object-top transition-all duration-300"
            style={{
              filter: `brightness(${state === "speaking" ? 1.05 + al * 0.15 : state === "thinking" ? 0.95 : 1}) saturate(${isActive ? 1.1 + al * 0.3 : 1})`,
              animation: "aiBreathe 4s ease-in-out infinite",
            }}
          />

          {/* Neon rim light */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: `
                inset 0 0 30px hsl(var(--neon-purple) / ${isActive ? 0.15 + al * 0.2 : 0.1}),
                inset 0 0 60px hsl(var(--neon-magenta) / ${isActive ? 0.08 + al * 0.1 : 0.05}),
                0 0 ${isActive ? 30 + al * 30 : 20}px hsl(var(--neon-purple) / ${isActive ? 0.2 + al * 0.2 : 0.15}),
                0 0 ${isActive ? 60 + al * 40 : 40}px hsl(var(--neon-magenta) / ${isActive ? 0.1 + al * 0.15 : 0.08})
              `,
              transition: "box-shadow 100ms",
            }}
          />

          {/* Listening pulse overlay */}
          {state === "listening" && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `2px solid hsl(var(--neon-cyan) / ${0.3 + il * 0.5})`,
                boxShadow: `0 0 ${15 + il * 25}px hsl(var(--neon-cyan) / ${0.15 + il * 0.2})`,
                animation: "aiListenPulse 1.5s ease-in-out infinite",
                transition: "border-color 100ms, box-shadow 100ms",
              }}
            />
          )}

          {/* Speaking mouth glow */}
          {state === "speaking" && (
            <div
              className="absolute bottom-[22%] left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: "30%",
                height: `${4 + al * 12}%`,
                borderRadius: "50%",
                background: `hsl(var(--neon-magenta) / ${0.15 + al * 0.35})`,
                filter: `blur(${4 + al * 4}px)`,
                transition: "all 80ms ease-out",
              }}
            />
          )}

          {/* Scan line for thinking */}
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

        {/* Hover glow for clickable */}
        {onClick && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: "0 0 40px hsl(var(--neon-purple) / 0.25), inset 0 0 20px hsl(var(--neon-purple) / 0.08)",
            }}
          />
        )}

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

      {/* Sound wave arcs when speaking */}
      {state === "speaking" && al > 0.05 && (
        <div className="absolute" style={{ bottom: size === "lg" ? -20 : size === "md" ? -16 : -12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`arc-${i}`}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none rounded-full"
              style={{
                width: 40 + i * 24 + al * 20,
                height: 16 + i * 8 + al * 8,
                border: `1px solid hsl(var(--neon-purple) / ${(0.4 - i * 0.1) * al})`,
                bottom: -(i * 6),
                transition: "all 100ms ease-out",
              }}
            />
          ))}
        </div>
      )}

      {/* State label + click label */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <span
          className="text-[9px] uppercase tracking-[0.25em] font-medium transition-colors duration-300"
          style={{
            color:
              state === "listening"
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
        {clickLabel && state === "idle" && (
          <span className="text-[8px] uppercase tracking-[0.2em] text-neon-purple/30 animate-fade-in" style={{ animationDelay: "2s", animationFillMode: "both" }}>
            {clickLabel}
          </span>
        )}
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
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.05); opacity: 0.7; }
        }
        @keyframes aiScanLine {
          0% { background-position: 0 -100%; }
          100% { background-position: 0 200%; }
        }
      `}</style>
    </div>
  );
}
