import { useState, useCallback, lazy, Suspense } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import SystemStatusBar from "@/components/admin/vessel/SystemStatusBar";
import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";
import { VesselThemeProvider } from "@/contexts/VesselThemeContext";
import { AIPersonalityProvider, useAIPersonality } from "@/contexts/AIPersonalityContext";

const InterstellarScene = lazy(() => import("@/components/admin/vessel/InterstellarScene"));

function AdminPanelInner() {
  const { data: metrics } = useDashboardMetrics("all");
  const { config: personality } = useAIPersonality();
  const [isListening, setIsListening] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [isCrisis, setIsCrisis] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<{ label: string; value: number }[]>([]);

  const m = metrics ?? ({} as any);
  const totalMembers = m.totalMembers ?? 0;
  const activeMembers = m.activeMembers ?? 0;
  const visitsMonth = m.totalVisitsThisMonth ?? 0;
  const vipCount = m.vipGuestsCount ?? 0;
  const churnRisk = m.churnRiskCount ?? 0;
  const noir = m.visitsByBrand?.noir ?? 0;
  const sasso = m.visitsByBrand?.sasso ?? 0;
  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const metricRings = [
    { label: "Members", value: totalMembers, max: totalMembers || 1, color: "#8a8a94" },
    { label: "Activity", value: visitsMonth, max: totalMembers || 1, color: "#6a7a8a" },
    { label: "VIP", value: vipCount, max: totalMembers || 1, color: "#C8A24A" },
    { label: "Retention", value: retentionRate, max: 100, color: "#5a8a6a" },
    { label: "Risk", value: churnRisk, max: totalMembers || 1, color: "#b84a4a" },
    { label: "NOIR", value: noir, max: noir + sasso || 1, color: "#8a8a94" },
    { label: "SASSO", value: sasso, max: noir + sasso || 1, color: "#6a7a8a" },
  ];

  const handleCrisis = useCallback((crisis: boolean) => {
    setIsCrisis(crisis);
    if (crisis) setTimeout(() => setIsCrisis(false), 30000);
  }, []);

  return (
    <div
      className="h-screen w-screen overflow-hidden relative flex flex-col pt-safe"
      style={{ backgroundColor: "#060608" }}
    >
      {/* 3D Industrial Headquarters Environment */}
      <Suspense fallback={<div className="absolute inset-0" style={{ backgroundColor: "#060608" }} />}>
        <InterstellarScene
          isListening={isListening}
          isCrisis={isCrisis}
          pulseIntensity={pulseIntensity}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          metrics={metricRings}
          aiMetrics={aiMetrics}
        />
      </Suspense>

      {/* Industrial depth overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(6,6,8,0.4) 70%, rgba(6,6,8,0.85) 100%)",
        }}
      />

      {/* Subtle steel scan line texture */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(138,138,148,0.004) 3px, rgba(138,138,148,0.004) 6px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Top titanium edge line */}
      <div
        className="fixed top-0 left-0 right-0 h-px pointer-events-none z-[3]"
        style={{
          background: "linear-gradient(90deg, transparent 15%, rgba(138,138,148,0.08), transparent 85%)",
        }}
      />

      {/* Strategic Header Strip */}
      <SystemStatusBar
        isCrisis={isCrisis}
        totalMembers={totalMembers}
        activeMembers={activeMembers}
        visitsMonth={visitsMonth}
        vipCount={vipCount}
        churnRisk={churnRisk}
      />

      {/* Central Intelligence & Command */}
      <div className="flex-1 min-h-0 relative z-10">
        <VesselCommandInterface
          onListeningChange={setIsListening}
          onPulseIntensity={setPulseIntensity}
          onCrisisChange={handleCrisis}
          onAIMetrics={setAiMetrics}
          onProcessingChange={setIsProcessing}
          onSpeakingChange={setIsSpeaking}
        />
      </div>

      {/* Crisis vignette */}
      {isCrisis && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-1000"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(160,30,30,0.06) 100%)",
            boxShadow: "inset 0 0 200px rgba(180,30,30,0.04)",
          }}
        />
      )}

      {/* Bottom titanium edge */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px pointer-events-none z-[3]"
        style={{
          background: "linear-gradient(90deg, transparent 20%, rgba(138,138,148,0.05), transparent 80%)",
        }}
      />
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
