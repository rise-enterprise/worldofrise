import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import aiAvatarImg from "@/assets/ai-avatar.png";
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

interface Particle {
  id: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  hue: number;
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
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });
  const [blinkState, setBlinkState] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reduce particle count on mobile for performance
  const particleCount = isMobile ? 18 : 32;

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i / particleCount) * Math.PI * 2,
      radius: 0.55 + Math.random() * 0.35,
      speed: 0.3 + Math.random() * 0.6,
      size: 1.5 + Math.random() * 2.5,
      hue: i % 3 === 0 ? 270 : i % 3 === 1 ? 320 : 200,
    })),
    [particleCount]
  );

  // Cursor tracking — skip on mobile (no hover)
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

  // Natural blinking
  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const sizeMap = { sm: 128, md: 160, lg: 280 };
  const px = sizeMap[size];
  const sizeClasses = { sm: "w-32 h-32", md: "w-40 h-40", lg: "w-[280px] h-[280px]" };
  const isActive = state !== "idle";
  const al = state === "speaking" ? audioLevel : 0;
  const il = state === "listening" ? inputLevel : 0;

  const glowX = isMobile ? 0 : (cursorPos.x - 0.5) * 30;
  const glowY = isMobile ? 0 : (cursorPos.y - 0.5) * 30;

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center flex-col", onClick && "cursor-pointer group", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Deep ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-500"
        style={{
          width: px * 2,
          height: px * 2,
          background: `radial-gradient(circle at ${50 + glowX}% ${50 + glowY}%, hsl(var(--neon-purple) / ${isActive ? 0.3 + al * 0.25 : 0.15}) 0%, hsl(var(--neon-magenta) / ${isActive ? 0.15 + al * 0.15 : 0.06}) 35%, hsl(var(--neon-blue) / 0.04) 60%, transparent 80%)`,
          filter: `blur(${isActive ? 50 + al * 25 : 35}px)`,
          transform: `translate(${glowX * 0.3}px, ${glowY * 0.3}px) scale(${isActive ? 1.1 + al * 0.2 : 1})`,
        }}
      />

      {/* Orbital particle field */}
      <div className="absolute pointer-events-none" style={{ width: px * 1.8, height: px * 1.8 }}>
        {particles.map((p) => {
          const speed = p.speed * (isActive ? 1.5 + al * 2 : 1);
          const orbitRadius = p.radius * px * 0.9;
          return (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: "50%",
                top: "50%",
                backgroundColor: `hsl(${p.hue} 80% 70%)`,
                opacity: isActive ? 0.4 + al * 0.5 : 0.2,
                boxShadow: `0 0 ${4 + al * 8}px hsl(${p.hue} 80% 70% / ${0.4 + al * 0.3})`,
                animation: `orbitalParticle ${8 / speed}s linear infinite`,
                animationDelay: `${-p.angle * 1.5}s`,
                transformOrigin: `0 0`,
                ["--orbit-r" as any]: `${orbitRadius}px`,
              }}
            />
          );
        })}
      </div>

      {/* Scanning rings */}
      {[0, 1, 2, 3].map((i) => {
        const ringLevel = state === "listening" ? il : state === "speaking" ? al : 0;
        const ringStep = size === "lg" ? 36 : size === "md" ? 24 : 18;
        const baseSize = px + i * ringStep;
        const hue = state === "listening" ? "--neon-cyan" : state === "thinking" ? "--neon-blue" : "--neon-purple";
        return (
          <div
            key={`ring-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: baseSize,
              height: baseSize,
              border: `${i === 0 ? 1.5 : 1}px solid hsl(var(${hue}) / ${
                state === "thinking" ? 0.15 + i * 0.05 : isActive ? 0.08 + ringLevel * 0.35 : 0.06
              })`,
              boxShadow: ringLevel > 0.05
                ? `0 0 ${ringLevel * 18}px hsl(var(${hue}) / ${ringLevel * 0.15}), inset 0 0 ${ringLevel * 10}px hsl(var(${hue}) / ${ringLevel * 0.05})`
                : "none",
              animation: state === "thinking"
                ? `aiScanRing ${2.5 + i * 0.4}s ease-out ${i * 0.3}s infinite`
                : state === "listening"
                  ? `aiPulseRing ${1.8 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`
                  : `aiIdleRing ${5 + i * 1.5}s ease-in-out ${i * 1.2}s infinite`,
            }}
          />
        );
      })}

      {/* Thinking: rotating scan arcs */}
      {state === "thinking" && [0, 1].map((i) => (
        <div
          key={`arc-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: px * 1.25,
            height: px * 1.25,
            border: "2px solid transparent",
            borderTopColor: `hsl(var(--neon-purple) / 0.3)`,
            borderRightColor: i === 0 ? `hsl(var(--neon-blue) / 0.2)` : "transparent",
            animation: `aiRotateScan ${3 + i}s linear infinite ${i === 1 ? "reverse" : ""}`,
          }}
        />
      ))}

      {/* Avatar container */}
      <div className={cn("relative", sizeClasses[size], onClick && "group-hover:scale-[1.02] group-active:scale-[0.97] transition-transform duration-500")}>
        {/* Holographic glass overlay */}
        <div
          className="absolute inset-[-3px] rounded-full pointer-events-none z-20"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, hsl(var(--neon-purple) / 0.06) 15%, transparent 30%, hsl(var(--neon-blue) / 0.04) 50%, transparent 65%, hsl(var(--neon-magenta) / 0.05) 80%, transparent 100%)`,
            animation: "aiHolographicRotate 12s linear infinite",
          }}
        />

        {/* Premium border frame */}
        <div
          className="absolute inset-[-2px] rounded-full pointer-events-none z-10"
          style={{
            border: `1.5px solid hsl(var(--neon-purple) / ${isActive ? 0.2 + al * 0.2 : 0.12})`,
            boxShadow: `
              0 0 ${isActive ? 15 + al * 20 : 10}px hsl(var(--neon-purple) / ${isActive ? 0.1 + al * 0.1 : 0.06}),
              inset 0 0 ${isActive ? 10 + al * 10 : 6}px hsl(var(--neon-purple) / ${isActive ? 0.05 + al * 0.05 : 0.03})
            `,
            transition: "all 150ms ease-out",
          }}
        />

        {/* Main avatar image */}
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <img
            src={aiAvatarImg}
            alt="RISE AI"
            className="w-full h-full object-cover object-top transition-all duration-300"
            style={{
              filter: `brightness(${state === "speaking" ? 1.08 + al * 0.12 : state === "thinking" ? 0.92 : 1.02}) saturate(${isActive ? 1.15 + al * 0.25 : 1.05}) contrast(${isActive ? 1.02 : 1})`,
              animation: "aiBreathe 5s ease-in-out infinite",
            }}
          />

          {/* Blink overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none transition-opacity"
            style={{
              background: "linear-gradient(180deg, transparent 30%, hsl(var(--background) / 0.03) 45%, transparent 55%)",
              opacity: blinkState ? 0.6 : 0,
              transitionDuration: blinkState ? "60ms" : "200ms",
            }}
          />

          {/* Neon rim light */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: `
                inset 0 0 40px hsl(var(--neon-purple) / ${isActive ? 0.12 + al * 0.18 : 0.08}),
                inset 0 0 80px hsl(var(--neon-magenta) / ${isActive ? 0.06 + al * 0.1 : 0.03}),
                inset 0 -${px * 0.15}px ${px * 0.3}px hsl(var(--neon-purple) / ${isActive ? 0.08 + al * 0.08 : 0.04}),
                0 0 ${isActive ? 35 + al * 35 : 20}px hsl(var(--neon-purple) / ${isActive ? 0.18 + al * 0.18 : 0.12}),
                0 0 ${isActive ? 70 + al * 50 : 45}px hsl(var(--neon-magenta) / ${isActive ? 0.08 + al * 0.12 : 0.05})
              `,
              transition: "box-shadow 120ms ease-out",
            }}
          />

          {/* Cursor-reactive highlight spot — desktop only */}
          {!isMobile && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300"
              style={{
                background: `radial-gradient(circle at ${cursorPos.x * 100}% ${cursorPos.y * 100}%, hsl(var(--neon-purple) / 0.08) 0%, transparent 50%)`,
              }}
            />
          )}

          {/* Listening pulse overlay */}
          {state === "listening" && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `2px solid hsl(var(--neon-cyan) / ${0.25 + il * 0.5})`,
                boxShadow: `
                  0 0 ${18 + il * 30}px hsl(var(--neon-cyan) / ${0.12 + il * 0.18}),
                  inset 0 0 ${10 + il * 15}px hsl(var(--neon-cyan) / ${0.04 + il * 0.06})
                `,
                animation: "aiListenPulse 1.5s ease-in-out infinite",
                transition: "border-color 100ms, box-shadow 100ms",
              }}
            />
          )}

          {/* Speaking: mouth light band */}
          {state === "speaking" && (
            <>
              <div
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  bottom: `${20 - al * 2}%`,
                  width: `${28 + al * 16}%`,
                  height: `${3 + al * 10}%`,
                  borderRadius: "50%",
                  background: `radial-gradient(ellipse, hsl(var(--neon-magenta) / ${0.2 + al * 0.4}) 0%, hsl(var(--neon-purple) / ${0.1 + al * 0.15}) 60%, transparent 100%)`,
                  filter: `blur(${3 + al * 3}px)`,
                  transition: "all 60ms ease-out",
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                  height: "35%",
                  background: `linear-gradient(to top, hsl(var(--neon-magenta) / ${0.03 + al * 0.06}), transparent)`,
                  transition: "all 80ms ease-out",
                }}
              />
            </>
          )}

          {/* Thinking: scan line */}
          {state === "thinking" && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
              style={{
                background: "linear-gradient(180deg, transparent 0%, hsl(var(--neon-purple) / 0.06) 48%, hsl(var(--neon-blue) / 0.08) 50%, hsl(var(--neon-purple) / 0.06) 52%, transparent 100%)",
                backgroundSize: "100% 400%",
                animation: "aiScanLine 2s ease-in-out infinite",
              }}
            />
          )}
        </div>

        {/* Hover glow — desktop only */}
        {onClick && !isMobile && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: "0 0 50px hsl(var(--neon-purple) / 0.2), inset 0 0 25px hsl(var(--neon-purple) / 0.06)",
            }}
          />
        )}

        {/* Corner data brackets — scale with size */}
        {size !== "sm" && [
          { pos: "-top-2 -left-2", border: "border-t border-l", color: "border-neon-purple/30" },
          { pos: "-top-2 -right-2", border: "border-t border-r", color: "border-neon-purple/30" },
          { pos: "-bottom-2 -left-2", border: "border-b border-l", color: "border-neon-magenta/20" },
          { pos: "-bottom-2 -right-2", border: "border-b border-r", color: "border-neon-magenta/20" },
        ].map((c, i) => (
          <div key={i} className={cn("absolute pointer-events-none", c.pos, c.border, c.color, size === "md" ? "w-4 h-4" : "w-5 h-5")} />
        ))}
      </div>

      {/* Sound wave arcs */}
      {state === "speaking" && al > 0.05 && (
        <div className="absolute" style={{ bottom: size === "lg" ? -24 : size === "md" ? -16 : -12 }}>
          {[0, 1, 2].map((i) => {
            const scale = size === "md" ? 0.75 : size === "sm" ? 0.6 : 1;
            return (
              <div
                key={`wave-${i}`}
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none rounded-full"
                style={{
                  width: (44 + i * 28 + al * 24) * scale,
                  height: (18 + i * 10 + al * 10) * scale,
                  border: `1px solid hsl(var(--neon-purple) / ${(0.35 - i * 0.08) * al})`,
                  boxShadow: `0 0 ${al * 8}px hsl(var(--neon-purple) / ${al * 0.1})`,
                  bottom: -(i * 7 * scale),
                  transition: "all 80ms ease-out",
                }}
              />
            );
          })}
        </div>
      )}

      {/* State label */}
      <div className={cn("flex flex-col items-center gap-1.5", size === "md" ? "mt-4" : "mt-5")}>
        <span
          className="text-[9px] uppercase tracking-[0.3em] font-medium transition-colors duration-300"
          style={{
            color:
              state === "listening"
                ? "hsl(var(--neon-cyan))"
                : state === "thinking"
                  ? "hsl(var(--neon-purple-light))"
                  : state === "speaking"
                    ? "hsl(var(--neon-magenta-light))"
                    : "hsl(var(--muted-foreground) / 0.4)",
          }}
        >
          {state === "idle" ? "RISE ONE" : state === "listening" ? "LISTENING" : state === "thinking" ? "ANALYZING" : "SPEAKING"}
        </span>
        {clickLabel && state === "idle" && (
          <span
            className="text-[8px] uppercase tracking-[0.2em] animate-fade-in"
            style={{
              color: "hsl(var(--neon-purple) / 0.25)",
              animationDelay: "2s",
              animationFillMode: "both",
            }}
          >
            {clickLabel}
          </span>
        )}
      </div>

      <style>{`
        @keyframes aiBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.012); }
        }
        @keyframes aiScanRing {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes aiPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.12); opacity: 0.45; }
        }
        @keyframes aiIdleRing {
          0%, 100% { transform: scale(1); opacity: 0.06; }
          50% { transform: scale(1.04); opacity: 0.12; }
        }
        @keyframes aiHolographicRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes aiRotateScan {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes aiListenPulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.04); opacity: 0.65; }
        }
        @keyframes aiScanLine {
          0% { background-position: 0 0%; }
          50% { background-position: 0 100%; }
          100% { background-position: 0 0%; }
        }
        @keyframes orbitalParticle {
          from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
          to { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
