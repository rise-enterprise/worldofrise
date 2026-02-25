import { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";
import HUDPanel from "./HUDPanel";

// Generate demo data for live-feel charts
function generateTimeSeries(points: number, base: number, variance: number) {
  return Array.from({ length: points }, (_, i) => ({
    t: i,
    v: Math.max(0, base + (Math.random() - 0.5) * variance + Math.sin(i / 3) * variance * 0.3),
  }));
}

export function VisitsWaveform() {
  const data = useMemo(() => generateTimeSeries(24, 120, 60), []);
  return (
    <HUDPanel label="Visits / 24h" className="h-full">
      <div className="pt-7 pb-2 px-2 h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="hudGoldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(42, 50%, 54%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(42, 50%, 54%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ background: "hsl(220, 12%, 7%)", border: "1px solid hsl(220, 15%, 20%)", borderRadius: 8, fontSize: 11 }}
              labelStyle={{ display: "none" }}
            />
            <Area type="monotone" dataKey="v" stroke="hsl(42, 50%, 54%)" fill="url(#hudGoldGrad)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </HUDPanel>
  );
}

export function TierDistributionBars({ distribution }: { distribution: Record<string, number> }) {
  const data = useMemo(() => {
    const tiers = ["initiation", "connoisseur", "elite", "inner-circle", "black"];
    return tiers.map(t => ({
      name: t.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()),
      value: distribution[t] ?? 0,
    }));
  }, [distribution]);

  return (
    <HUDPanel label="Tier Distribution" className="h-full">
      <div className="pt-7 pb-2 px-2 h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="hudBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(42, 50%, 54%)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(42, 50%, 54%)" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ background: "hsl(220, 12%, 7%)", border: "1px solid hsl(220, 15%, 20%)", borderRadius: 8, fontSize: 11 }}
            />
            <Bar dataKey="value" fill="url(#hudBarGrad)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </HUDPanel>
  );
}

export function BrandHeatmap({ noir, sasso }: { noir: number; sasso: number }) {
  const total = noir + sasso || 1;
  const noirPct = (noir / total) * 100;
  const sassoPct = (sasso / total) * 100;

  return (
    <HUDPanel label="Brand Heatmap" className="h-full">
      <div className="pt-7 pb-3 px-3 space-y-3">
        <BrandBar label="NOIR" value={noir} pct={noirPct} color="hsl(42, 50%, 54%)" />
        <BrandBar label="SASSO" value={sasso} pct={sassoPct} color="hsl(195, 62%, 32%)" />
      </div>
    </HUDPanel>
  );
}

function BrandBar({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="uppercase tracking-widest text-muted-foreground/70">{label}</span>
        <span className="text-foreground/80 tabular-nums">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}
