import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";
import { Brain, Wifi, Zap } from "lucide-react";
import { useState } from "react";
import type { AIState } from "@/components/admin/ai/AIAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function AIChatView() {
  const [aiState, setAIState] = useState<AIState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const isMobile = useIsMobile();

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-background">
      {/* Cinematic ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 100%, hsl(var(--neon-magenta) / 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 10% 50%, hsl(var(--neon-blue) / 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 30% 20% at 50% 50%, hsl(var(--gold) / 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle HUD grid — hide on mobile */}
      {!isMobile && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-purple) / 0.4) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--neon-purple) / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      )}

      {/* Top status bar — condensed on mobile */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-between border-b border-neon-purple/10",
          isMobile ? "px-4 py-2" : "px-6 py-3"
        )}
        style={isMobile ? {
          background: "hsl(var(--background) / 0.72)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        } : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className={cn("text-neon-purple/70", isMobile ? "w-3.5 h-3.5" : "w-4 h-4")} />
            <span className={cn(
              "font-medium tracking-widest uppercase text-foreground/80",
              isMobile ? "text-[10px]" : "text-xs"
            )}>
              RISE Intelligence
            </span>
          </div>
          <div className="w-px h-4 bg-neon-purple/15" />
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
            </span>
            <span className="text-[10px] tracking-wider uppercase text-muted-foreground/60">
              {aiState === "idle" ? "Online" : aiState === "listening" ? "Listening" : aiState === "thinking" ? "Processing" : "Responding"}
            </span>
          </div>
        </div>

        {/* Desktop-only secondary indicators */}
        {!isMobile && (
          <div className="flex items-center gap-4">
            {aiState === "speaking" && audioLevel > 0.05 && (
              <div className="flex items-center gap-[2px] h-4">
                {[0.3, 0.6, 1, 0.7, 0.4].map((base, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-full bg-neon-magenta/60 origin-bottom transition-all duration-75"
                    style={{ height: `${4 + base * audioLevel * 12}px` }}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-neon-magenta/40" />
              <span className="text-[9px] tracking-wider uppercase text-muted-foreground/40">Neural Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-neon-blue/40" />
              <span className="text-[9px] tracking-wider uppercase text-muted-foreground/40">Stream</span>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 min-h-0">
        <VesselCommandInterface
          onListeningChange={(listening) => setAIState(listening ? "listening" : "idle")}
          onPulseIntensity={() => {}}
          onCrisisChange={() => {}}
          onAIMetrics={() => {}}
          onProcessingChange={(processing) => {
            if (processing) setAIState("thinking");
          }}
          onSpeakingChange={(speaking) => {
            if (speaking) setAIState("speaking");
            else setAIState("idle");
          }}
          aiState={aiState}
          onAIStateChange={setAIState}
          onAudioLevel={setAudioLevel}
        />
      </div>
    </div>
  );
}
