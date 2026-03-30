import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

/**
 * RISE Identity Orb — a Siri-inspired living sphere
 * with muted gold / champagne light language.
 */
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
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });

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

  const sizeMap = { sm: 96, md: 128, lg: 220 };
  const px = sizeMap[size];
  const sizeClasses = { sm: "w-24 h-24", md: "w-32 h-32", lg: "w-[220px] h-[220px]" };
  const isActive = state !== "idle";
  const al = state === "speaking" ? audioLevel : 0;
  const il = state === "listening" ? inputLevel : 0;

  const glowX = isMobile ? 0 : (cursorPos.x - 0.5) * 20;
  const glowY = isMobile ? 0 : (cursorPos.y - 0.5) * 20;

  // Color scheme based on state
  const stateColor = state === "listening"
    ? "180 35% 55%"   // soft teal
    : state === "thinking"
      ? "220 30% 55%" // cool blue
      : "38 35% 55%"; // warm gold (idle & speaking)

  const stateColorAlt = state === "listening"
    ? "170 30% 45%"
    : state === "thinking"
      ? "240 25% 50%"
      : "30 25% 45%";

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
      {/* Deep ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-700"
        style={{
          width: px * 2.2,
          height: px * 2.2,
          background: `radial-gradient(circle at ${50 + glowX}% ${50 + glowY}%, hsl(${stateColor} / ${isActive ? 0.18 + al * 0.15 : 0.1}) 0%, hsl(${stateColorAlt} / ${isActive ? 0.08 : 0.04}) 40%, transparent 70%)`,
          filter: `blur(${isActive ? 40 + al * 20 : 30}px)`,
          transform: `translate(${glowX * 0.2}px, ${glowY * 0.2}px) scale(${isActive ? 1.05 + al * 0.15 : 1})`,
        }}
      />

      {/* Breathing rings */}
      {[0, 1, 2].map((i) => {
        const ringLevel = state === "listening" ? il : state === "speaking" ? al : 0;
        const ringStep = size === "lg" ? 30 : size === "md" ? 22 : 16;
        const baseSize = px + i * ringStep + 12;
        return (
          <div
            key={`ring-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: baseSize,
              height: baseSize,
              border: `${i === 0 ? 1.2 : 0.8}px solid hsl(${stateColor} / ${
                state === "thinking" ? 0.12 + i * 0.04 : isActive ? 0.06 + ringLevel * 0.25 : 0.05
              })`,
              boxShadow: ringLevel > 0.05
                ? `0 0 ${ringLevel * 14}px hsl(${stateColor} / ${ringLevel * 0.1})`
                : "none",
              animation: state === "thinking"
                ? `riseRingPulse ${2.2 + i * 0.3}s ease-out ${i * 0.25}s infinite`
                : state === "listening"
                  ? `riseRingBreath ${1.6 + i * 0.3}s ease-in-out ${i * 0.15}s infinite`
                  : `riseIdleBreath ${5 + i * 1.2}s ease-in-out ${i * 0.8}s infinite`,
              transition: "border-color 400ms, box-shadow 400ms",
            }}
          />
        );
      })}

      {/* Thinking: rotating arcs */}
      {state === "thinking" && [0, 1].map((i) => (
        <div
          key={`arc-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: px * 1.15,
            height: px * 1.15,
            border: "1.5px solid transparent",
            borderTopColor: `hsl(${stateColor} / 0.25)`,
            borderRightColor: i === 0 ? `hsl(${stateColorAlt} / 0.15)` : "transparent",
            animation: `riseScanRotate ${3.5 + i * 1.5}s linear infinite ${i === 1 ? "reverse" : ""}`,
          }}
        />
      ))}

      {/* The Orb */}
      <div className={cn(
        "relative rounded-full",
        sizeClasses[size],
        onClick && "group-hover:scale-[1.03] group-active:scale-[0.97] transition-transform duration-500"
      )}>
        {/* Core sphere — layered radial gradients */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at ${45 + glowX * 0.5}% ${40 + glowY * 0.5}%, 
                hsl(40 30% 85% / 0.9) 0%, 
                hsl(${stateColor} / 0.5) 30%, 
                hsl(${stateColorAlt} / 0.35) 55%, 
                hsl(30 15% 12% / 0.9) 85%
              )
            `,
            animation: "riseOrbBreathe 4.5s ease-in-out infinite",
          }}
        />

        {/* Specular highlight — top-left */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "8%",
            left: "15%",
            width: "45%",
            height: "35%",
            background: `radial-gradient(ellipse at 50% 50%, hsl(40 30% 95% / ${isActive ? 0.4 + al * 0.2 : 0.3}) 0%, transparent 70%)`,
            filter: "blur(6px)",
            transform: `translate(${glowX * 0.3}px, ${glowY * 0.3}px)`,
            transition: "transform 300ms ease-out",
          }}
        />

        {/* Inner luminance */}
        <div
          className="absolute inset-[15%] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, hsl(${stateColor} / ${isActive ? 0.15 + al * 0.2 : 0.08}) 0%, transparent 70%)`,
            filter: "blur(8px)",
            animation: "riseInnerGlow 3s ease-in-out infinite",
          }}
        />

        {/* Outer rim glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `
              inset 0 0 ${20 + al * 15}px hsl(${stateColor} / ${isActive ? 0.12 + al * 0.12 : 0.06}),
              0 0 ${isActive ? 25 + al * 25 : 15}px hsl(${stateColor} / ${isActive ? 0.15 + al * 0.15 : 0.08}),
              0 0 ${isActive ? 50 + al * 35 : 30}px hsl(${stateColorAlt} / ${isActive ? 0.06 + al * 0.08 : 0.03})
            `,
            transition: "box-shadow 150ms ease-out",
          }}
        />

        {/* RISE monogram — embedded in the orb */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-display font-light tracking-[0.25em] select-none"
            style={{
              fontSize: px * 0.16,
              color: `hsl(40 30% 92% / ${isActive ? 0.7 + al * 0.2 : 0.5})`,
              textShadow: `0 0 ${8 + al * 10}px hsl(${stateColor} / ${isActive ? 0.3 : 0.15})`,
              transition: "color 300ms, text-shadow 150ms",
            }}
          >
            RISE
          </span>
        </div>

        {/* Speaking: wave pulse bands */}
        {state === "speaking" && al > 0.02 && (
          <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
            {[0, 1, 2].map(i => (
              <div
                key={`wave-${i}`}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${42 + i * 8}%`,
                  height: `${2 + al * 6}%`,
                  background: `linear-gradient(90deg, transparent 5%, hsl(${stateColor} / ${(0.15 - i * 0.03) * al * 3}) 30%, hsl(40 30% 85% / ${(0.1 - i * 0.02) * al * 3}) 50%, hsl(${stateColor} / ${(0.15 - i * 0.03) * al * 3}) 70%, transparent 95%)`,
                  filter: `blur(${1 + i}px)`,
                  animation: `riseWaveDrift ${1.2 + i * 0.3}s ease-in-out infinite alternate`,
                  transition: "height 80ms ease-out",
                }}
              />
            ))}
          </div>
        )}

        {/* Listening: subtle ripple */}
        {state === "listening" && (
          <div
            className="absolute inset-[-4px] rounded-full pointer-events-none"
            style={{
              border: `1.5px solid hsl(${stateColor} / ${0.15 + il * 0.35})`,
              boxShadow: `0 0 ${12 + il * 20}px hsl(${stateColor} / ${0.08 + il * 0.12})`,
              animation: "riseListenPulse 1.4s ease-in-out infinite",
              transition: "border-color 120ms, box-shadow 120ms",
            }}
          />
        )}

        {/* Hover glow — desktop only */}
        {onClick && !isMobile && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600"
            style={{
              boxShadow: `0 0 40px hsl(38 35% 55% / 0.15), inset 0 0 20px hsl(38 35% 55% / 0.05)`,
            }}
          />
        )}
      </div>

      {/* State label */}
      <div className={cn("flex flex-col items-center gap-1.5", size === "md" ? "mt-4" : size === "sm" ? "mt-3" : "mt-5")}>
        <span
          className="text-[9px] uppercase tracking-[0.3em] font-body transition-colors duration-500"
          style={{
            color: isActive
              ? `hsl(${stateColor})`
              : "hsl(var(--muted-foreground) / 0.35)",
          }}
        >
          {state === "idle" ? "RISE" : state === "listening" ? "LISTENING" : state === "thinking" ? "THINKING" : "SPEAKING"}
        </span>
        {clickLabel && state === "idle" && (
          <span
            className="text-[8px] uppercase tracking-[0.2em] animate-fade-in font-body"
            style={{
              color: "hsl(38 35% 55% / 0.25)",
              animationDelay: "2s",
              animationFillMode: "both",
            }}
          >
            {clickLabel}
          </span>
        )}
      </div>

      <style>{`
        @keyframes riseOrbBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @keyframes riseInnerGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes riseRingPulse {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes riseRingBreath {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.08); opacity: 0.4; }
        }
        @keyframes riseIdleBreath {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.03); opacity: 0.1; }
        }
        @keyframes riseScanRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes riseListenPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.03); opacity: 0.6; }
        }
        @keyframes riseWaveDrift {
          0% { transform: translateX(-3%); }
          100% { transform: translateX(3%); }
        }
      `}</style>
    </div>
  );
}
