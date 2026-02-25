import { useState, useCallback, lazy, Suspense } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import SystemStatusBar from "@/components/admin/vessel/SystemStatusBar";
import VesselCommandInterface from "@/components/admin/vessel/VesselCommandInterface";

const InterstellarScene = lazy(() => import("@/components/admin/vessel/InterstellarScene"));

export default function AdminPanel() {
  const { data: metrics } = useDashboardMetrics("all");
  const [isListening, setIsListening] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [isCrisis, setIsCrisis] = useState(false);

  const m = metrics ?? ({} as any);
  const totalMembers = m.totalMembers ?? 0;
  const activeMembers = m.activeMembers ?? 0;
  const visitsMonth = m.totalVisitsThisMonth ?? 0;
  const vipCount = m.vipGuestsCount ?? 0;
  const churnRisk = m.churnRiskCount ?? 0;
  const noir = m.visitsByBrand?.noir ?? 0;
  const sasso = m.visitsByBrand?.sasso ?? 0;
  const tierDist = m.tierDistribution ?? {};

  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  // Build 3D metric ring data
  const metricRings = [
    { label: "Members", value: totalMembers, max: totalMembers || 1, color: "#C8A24A" },
    { label: "Visits", value: visitsMonth, max: totalMembers || 1, color: "#4488ff" },
    { label: "VIP", value: vipCount, max: totalMembers || 1, color: "#C8A24A" },
    { label: "Retention", value: retentionRate, max: 100, color: "#22c55e" },
    { label: "Churn", value: churnRisk, max: totalMembers || 1, color: "#ef4444" },
    { label: "NOIR", value: noir, max: noir + sasso || 1, color: "#C8A24A" },
    { label: "SASSO", value: sasso, max: noir + sasso || 1, color: "#3b82f6" },
  ];

  const handleCrisis = useCallback((crisis: boolean) => {
    setIsCrisis(crisis);
    // Auto-clear crisis after 30s
    if (crisis) setTimeout(() => setIsCrisis(false), 30000);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#07080A] overflow-hidden relative flex flex-col">
      {/* 3D Background */}
      <Suspense fallback={
        <div className="absolute inset-0 bg-[#07080A]" />
      }>
        <InterstellarScene
          isListening={isListening}
          isCrisis={isCrisis}
          pulseIntensity={pulseIntensity}
          metrics={metricRings}
        />
      </Suspense>

      {/* System status bar */}
      <SystemStatusBar
        isCrisis={isCrisis}
        totalMembers={totalMembers}
        activeMembers={activeMembers}
        visitsMonth={visitsMonth}
        vipCount={vipCount}
        churnRisk={churnRisk}
      />

      {/* Command interface overlay */}
      <div className="flex-1 min-h-0 relative z-10">
        <VesselCommandInterface
          onListeningChange={setIsListening}
          onPulseIntensity={setPulseIntensity}
          onCrisisChange={handleCrisis}
        />
      </div>

      {/* Crisis mode vignette */}
      {isCrisis && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-1000"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(180,20,20,0.08) 100%)",
            boxShadow: "inset 0 0 120px rgba(200,30,30,0.06)",
          }}
        />
      )}
    </div>
  );
}
