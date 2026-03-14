import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";
import { Brain, Wifi } from "lucide-react";

export default function AIChatView() {
  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, hsl(var(--gold) / 0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 80% 100%, hsl(var(--gold) / 0.03) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 10% 60%, hsl(var(--sapphire) / 0.03) 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--gold) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--gold) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top status bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary/60" />
            <span className="text-xs font-medium tracking-widest uppercase text-foreground/80">
              RISE Intelligence
            </span>
          </div>
          <div className="w-px h-4 bg-border/30" />
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] tracking-wider uppercase text-muted-foreground/60">Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-primary/40" />
            <span className="text-[9px] tracking-wider uppercase text-muted-foreground/50">Stream Ready</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 min-h-0">
        <VesselCommandInterface
          onListeningChange={() => {}}
          onPulseIntensity={() => {}}
          onCrisisChange={() => {}}
          onAIMetrics={() => {}}
          onProcessingChange={() => {}}
          onSpeakingChange={() => {}}
        />
      </div>
    </div>
  );
}
