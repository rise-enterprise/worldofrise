import { useState, useCallback } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import SystemStatusBar from "@/components/admin/vessel/SystemStatusBar";
import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";
import { VesselThemeProvider } from "@/contexts/VesselThemeContext";
import { AIPersonalityProvider } from "@/contexts/AIPersonalityContext";

function AdminPanelInner() {
  const { data: metrics } = useDashboardMetrics("all");
  const [isListening, setIsListening] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const m = metrics ?? ({} as any);
  const totalMembers = m.totalMembers ?? 0;
  const activeMembers = m.activeMembers ?? 0;
  const visitsMonth = m.totalVisitsThisMonth ?? 0;
  const vipCount = m.vipGuestsCount ?? 0;
  const churnRisk = m.churnRiskCount ?? 0;

  const handleCrisis = useCallback((crisis: boolean) => {
    setIsCrisis(crisis);
    if (crisis) setTimeout(() => setIsCrisis(false), 30000);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col" style={{ backgroundColor: "#faf8f5" }}>
      {/* Subtle sand gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, #faf8f5 0%, #f3efe8 40%, #faf8f5 100%)",
        }}
      />

      {/* Soft warm glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(200,162,74,0.03) 0%, transparent 60%)",
        }}
      />

      <SystemStatusBar
        isCrisis={isCrisis}
        totalMembers={totalMembers}
        activeMembers={activeMembers}
        visitsMonth={visitsMonth}
        vipCount={vipCount}
        churnRisk={churnRisk}
      />

      <div className="flex-1 min-h-0 relative z-10">
        <VesselCommandInterface
          onListeningChange={setIsListening}
          onPulseIntensity={() => {}}
          onCrisisChange={handleCrisis}
          onAIMetrics={() => {}}
          onProcessingChange={setIsProcessing}
          onSpeakingChange={() => {}}
        />
      </div>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <VesselThemeProvider>
      <AIPersonalityProvider>
        <AdminPanelInner />
      </AIPersonalityProvider>
    </VesselThemeProvider>
  );
}
