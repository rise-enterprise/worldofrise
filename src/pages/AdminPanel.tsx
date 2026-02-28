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
    { label: "Nodes", value: totalMembers, max: totalMembers || 1, color: "#C8A24A" },
    { label: "Activity", value: visitsMonth, max: totalMembers || 1, color: "#00d4ff" },
    { label: "VIP", value: vipCount, max: totalMembers || 1, color: "#C8A24A" },
    { label: "Retention", value: retentionRate, max: 100, color: "#10b981" },
    { label: "Risk", value: churnRisk, max: totalMembers || 1, color: "#ef4444" },
    { label: "NOIR", value: noir, max: noir + sasso || 1, color: "#C8A24A" },
    { label: "SASSO", value: sasso, max: noir + sasso || 1, color: "#3b82f6" },
  ];

  const handleCrisis = useCallback((crisis: boolean) => {
    setIsCrisis(crisis);
    if (crisis) setTimeout(() => setIsCrisis(false), 30000);
  }, []);

  return (
    <div
      className="h-screen w-screen overflow-hidden relative flex flex-col pt-safe transition-colors duration-1000"
      style={{ backgroundColor: colors.bg }}
    >
      {/* 3D Neural Intelligence Environment */}
      <Suspense fallback={<div className="absolute inset-0" style={{ backgroundColor: colors.bg }} />}>
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

      {/* Subtle stone texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(200,162,74,0.004) 3px, rgba(200,162,74,0.004) 6px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Personality accent vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[2] transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, ${personality.accentHex}08 100%)`,
          boxShadow: `inset 0 0 300px -80px ${personality.accentHex}06`,
        }}
      />

      {/* Top edge accent — gold executive line */}
      <div
        className="fixed top-0 left-0 right-0 h-px pointer-events-none z-[3]"
        style={{
          background: `linear-gradient(90deg, transparent, ${personality.accentHex}30, transparent)`,
        }}
      />

      {/* System status bar */}
      <SystemStatusBar
        isCrisis={isCrisis}
        totalMembers={totalMembers}
        activeMembers={activeMembers}
        visitsMonth={visitsMonth}
        vipCount={vipCount}
        churnRisk={churnRisk}
      />

      {/* Command interface */}
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
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(180,20,20,0.1) 100%)",
            boxShadow: "inset 0 0 200px rgba(200,30,30,0.08)",
          }}
        />
      )}

      {/* Bottom edge accent */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px pointer-events-none z-[3]"
        style={{
          background: `linear-gradient(90deg, transparent 10%, ${personality.accentHex}18, transparent 90%)`,
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
