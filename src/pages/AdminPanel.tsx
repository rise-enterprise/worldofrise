import { Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import HUDStatusBar from "@/components/admin/hud/HUDStatusBar";
import HUDPanel from "@/components/admin/hud/HUDPanel";
import HUDMetricGauge from "@/components/admin/hud/HUDMetricGauge";
import LiveCounter from "@/components/admin/hud/LiveCounter";
import AnomalyFeed from "@/components/admin/hud/AnomalyFeed";
import AICommandCenter from "@/components/admin/hud/AICommandCenter";
import { VisitsWaveform, TierDistributionBars, BrandHeatmap } from "@/components/admin/hud/HUDCharts";

export default function AdminPanel() {
  const isMobile = useIsMobile();
  const { data: metrics } = useDashboardMetrics("all");

  const m = metrics ?? {} as any;
  const totalMembers = m.totalMembers ?? 0;
  const activeMembers = m.activeMembers ?? 0;
  const visitsMonth = m.totalVisitsThisMonth ?? 0;
  const vipCount = m.vipGuestsCount ?? 0;
  const churnRisk = m.churnRiskCount ?? 0;
  const noir = m.visitsByBrand?.noir ?? 0;
  const sasso = m.visitsByBrand?.sasso ?? 0;
  const tierDist = m.tierDistribution ?? {};

  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const churnPct = totalMembers > 0 ? Math.round((churnRisk / totalMembers) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, transparent 40%, hsl(var(--background)) 100%)"
      }} />

      <div className="relative z-10 flex flex-col h-screen">
        <HUDStatusBar />

        <div className={`flex-1 overflow-y-auto p-3 ${isMobile ? "space-y-3" : "grid grid-cols-12 gap-3"} min-h-0`}>
          
          {/* ═══ LEFT COLUMN: Metrics HUD ═══ */}
          <div className={isMobile ? "" : "col-span-4 flex flex-col gap-3"}>
            
            {/* Live Counters */}
            <HUDPanel className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <LiveCounter value={totalMembers} label="Total Members" trend={2.4} />
                <LiveCounter value={visitsMonth} label="Visits / Month" trend={-1.2} />
                <LiveCounter value={vipCount} label="VIP Guests" prefix="★" />
                <LiveCounter value={churnRisk} label="Churn Risk" trend={churnPct > 30 ? churnPct : undefined} />
              </div>
            </HUDPanel>

            {/* Gauges */}
            <HUDPanel className="p-4">
              <div className="flex items-center justify-around flex-wrap gap-3">
                <HUDMetricGauge value={retentionRate} max={100} label="Retention" unit="%" color="gold" />
                <HUDMetricGauge value={churnPct} max={100} label="Churn Rate" unit="%" color="burgundy" />
                <HUDMetricGauge value={vipCount} max={totalMembers || 1} label="VIP Ratio" color="teal" size="sm" />
              </div>
            </HUDPanel>

            {/* Charts */}
            <VisitsWaveform />
            <TierDistributionBars distribution={tierDist} />
            <BrandHeatmap noir={noir} sasso={sasso} />
          </div>

          {/* ═══ CENTER-RIGHT: AI Command Center ═══ */}
          <div className={isMobile ? "" : "col-span-5 flex flex-col min-h-0"}>
            <AICommandCenter />
          </div>

          {/* ═══ FAR RIGHT: Anomalies + Regional ═══ */}
          <div className={isMobile ? "" : "col-span-3 flex flex-col gap-3"}>
            <AnomalyFeed />

            {/* Regional metrics */}
            <HUDPanel label="Regional Presence" className="p-4 pt-7">
              <div className="space-y-3">
                <RegionRow label="Doha" value={m.visitsByCountry?.doha ?? 0} total={totalMembers} />
                <RegionRow label="Riyadh" value={m.visitsByCountry?.riyadh ?? 0} total={totalMembers} />
              </div>
            </HUDPanel>

            {/* Points gauge */}
            <HUDPanel className="p-4">
              <div className="flex items-center justify-around">
                <HUDMetricGauge value={noir} max={noir + sasso || 1} label="NOIR Share" color="gold" size="sm" />
                <HUDMetricGauge value={sasso} max={noir + sasso || 1} label="SASSO Share" color="sapphire" size="sm" />
              </div>
            </HUDPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegionRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="uppercase tracking-widest text-muted-foreground/60">{label}</span>
        <span className="text-foreground/70 tabular-nums">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary/60 transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, boxShadow: "0 0 6px hsl(42, 50%, 54%, 0.3)" }}
        />
      </div>
    </div>
  );
}
