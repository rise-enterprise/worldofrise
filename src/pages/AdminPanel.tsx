import { useState, useCallback, lazy, Suspense } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import SystemStatusBar from "@/components/admin/vessel/SystemStatusBar";
import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";
import { VesselThemeProvider, useVesselTheme } from "@/contexts/VesselThemeContext";
import { AIPersonalityProvider, useAIPersonality } from "@/contexts/AIPersonalityContext";

const InterstellarScene = lazy(() => import("@/components/admin/vessel/InterstellarScene"));

function AdminPanelInner() {
  const { data: metrics } = useDashboardMetrics("all");
  const { colors } = useVesselTheme();
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
    { label: "Members", value: totalMembers, max: totalMembers || 1, color: "#C8A24A" },
    { label: "Activity", value: visitsMonth, max: totalMembers || 1, color: "#6b93b8" },
    { label: "VIP", value: vipCount, max: totalMembers || 1, color: "#C8A24A" },
    { label: "Retention", value: retentionRate, max: 100, color: "#5a8a6a" },
    { label: "Risk", value: churnRisk, max: totalMembers || 1, color: "#b84a4a" },
    { label: "NOIR", value: noir, max: noir + sasso || 1, color: "#C8A24A" },
    { label: "SASSO", value: sasso, max: noir + sasso || 1, color: "#6b7db8" },
  ];

  const handleCrisis = useCallback((crisis: boolean) => {
    setIsCrisis(crisis);
    if (crisis) setTimeout(() => setIsCrisis(false), 30000);
  }, []);

  return (
    <div
      className="h-screen w-screen overflow-hidden relative flex flex-col pt-safe"
      style={{ backgroundColor: "#0a0a0c" }}
    >
      {/* 3D Tactical Environment */}
      <Suspense fallback={<div className="absolute inset-0" style={{ backgroundColor: "#0a0a0c" }} />}>
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

      {/* Matte graphite depth overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(10,10,12,0.4) 70%, rgba(10,10,12,0.8) 100%)",
        }}
      />

      {/* Subtle horizontal scan line */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(200,162,74,0.008) 2px, rgba(200,162,74,0.008) 4px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Mode accent vignette — subtle color shift */}
      <div
        className="fixed inset-0 pointer-events-none z-[2] transition-all duration-1000"
        style={{
          boxShadow: `inset 0 0 200px -60px ${personality.accentHex}05`,
        }}
      />

      {/* Top gold edge line */}
      <div
        className="fixed top-0 left-0 right-0 h-px pointer-events-none z-[3]"
        style={{
          background: `linear-gradient(90deg, transparent 15%, ${personality.accentHex}20, transparent 85%)`,
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

      {/* Central Intelligence + Command */}
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
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(160,30,30,0.08) 100%)",
            boxShadow: "inset 0 0 200px rgba(180,30,30,0.06)",
          }}
        />
      )}

      {/* Bottom edge accent */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px pointer-events-none z-[3]"
        style={{
          background: `linear-gradient(90deg, transparent 20%, ${personality.accentHex}10, transparent 80%)`,
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
