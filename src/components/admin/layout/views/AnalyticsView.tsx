import { useMemo } from "react";
import { BarChart3, TrendingUp, Users, PieChart } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RPieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";

const GOLD = "hsl(40 62% 56%)";
const TEAL = "hsl(195 62% 32%)";
const BURGUNDY = "hsl(350 55% 30%)";
const SAPPHIRE = "hsl(215 60% 35%)";
const SUCCESS = "hsl(152 45% 35%)";

export default function AnalyticsView() {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const m = metrics as any;

  const tierData = useMemo(() => {
    if (!m?.tierDistribution) return [];
    return Object.entries(m.tierDistribution).map(([name, value]) => ({
      name: name.replace("-", " ").replace(/^\w/, c => c.toUpperCase()),
      value: Number(value),
    }));
  }, [m]);

  const brandData = useMemo(() => {
    if (!m?.visitsByBrand) return [];
    return [
      { name: "NOIR", value: Number(m.visitsByBrand.noir ?? 0) },
      { name: "SASSO", value: Number(m.visitsByBrand.sasso ?? 0) },
    ];
  }, [m]);

  const regionData = useMemo(() => {
    if (!m?.visitsByCountry) return [];
    return [
      { name: "Qatar", value: Number(m.visitsByCountry.doha ?? 0) },
      { name: "Riyadh", value: Number(m.visitsByCountry.riyadh ?? 0) },
    ];
  }, [m]);

  // Simulated monthly trend (since we don't have time-series yet)
  const trendData = useMemo(() => {
    const total = Number(m?.totalMembers ?? 100);
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month, i) => ({
      month,
      members: Math.floor(total * (0.4 + (i / 11) * 0.6) + Math.random() * total * 0.05),
      visits: Math.floor((Number(m?.totalVisitsThisMonth ?? 50)) * (0.5 + Math.random() * 0.5)),
    }));
  }, [m]);

  const PIE_COLORS = [GOLD, TEAL, BURGUNDY, SAPPHIRE, SUCCESS];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg px-3 py-2 text-xs border border-border/50 bg-card shadow-lg">
        <p className="text-foreground font-medium mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-muted-foreground">
            {entry.name}: <span className="text-foreground font-medium">{entry.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Advanced data visualization and insights</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Member Growth Trend */}
        <div className="rounded-xl p-5 border border-border/40 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Member Growth</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="members" stroke={GOLD} fill="url(#goldGrad)" strokeWidth={2} name="Members" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Trends */}
        <div className="rounded-xl p-5 border border-border/40 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Monthly Visits</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visits" fill={TEAL} radius={[4, 4, 0, 0]} name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution Pie */}
        <div className="rounded-xl p-5 border border-border/40 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Tier Distribution</h3>
          </div>
          <div className="h-56 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={tierData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} dataKey="value">
                    {tierData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {tierData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-muted-foreground flex-1 capitalize">{entry.name}</span>
                  <span className="text-xs font-medium text-foreground">{entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand & Region Performance */}
        <div className="rounded-xl p-5 border border-border/40 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Brand & Region Performance</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">By Brand</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={brandData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={GOLD} radius={[0, 4, 4, 0]} name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">By Region</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={TEAL} radius={[0, 4, 4, 0]} name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
