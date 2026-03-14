import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";

export default function AIChatView() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/30 shrink-0">
        <h1 className="text-lg font-semibold text-foreground">RISE AI Intelligence</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Query insights, analyze performance, generate reports</p>
      </div>
      <div className="flex-1 min-h-0">
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
