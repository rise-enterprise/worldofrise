import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";
import { Brain, Wifi, Zap } from "lucide-react";
import { useState } from "react";
import type { AIState } from "@/components/admin/ai/AIAvatar";

export default function AIChatView() {
  const [aiState, setAIState] = useState<AIState>("idle");

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

      {/* Subtle HUD grid */}
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

      {/* Top status bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-neon-purple/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-neon-purple/70" />
            <span className="text-xs font-medium tracking-widest uppercase text-foreground/80">
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-neon-magenta/40" />
            <span className="text-[9px] tracking-wider uppercase text-muted-foreground/40">Neural Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-neon-blue/40" />
            <span className="text-[9px] tracking-wider uppercase text-muted-foreground/40">Stream</span>
          </div>
        </div>
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
        />
      </div>
    </div>
  );
}
