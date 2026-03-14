import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Users, TrendingUp, Crown, AlertTriangle, ArrowUpRight, Map, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  onNavigate: (view: string) => void;
}

export default function DashboardOverview({ onNavigate }: Props) {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const m = metrics as any;

  const statCards = [
    {
      label: "Total Members",
      value: (m.totalMembers ?? 0).toLocaleString(),
      icon: Users,
      change: "+12%",
      color: "hsl(var(--gold))",
    },
    {
      label: "Visits This Month",
      value: (m.totalVisitsThisMonth ?? 0).toLocaleString(),
      icon: TrendingUp,
      change: "+8%",
      color: "hsl(var(--success))",
    },
    {
      label: "VIP Members",
      value: (m.vipGuestsCount ?? 0).toLocaleString(),
      icon: Crown,
      change: "+5%",
      color: "hsl(var(--gold))",
    },
    {
      label: "Churn Risk",
      value: (m.churnRiskCount ?? 0).toLocaleString(),
      icon: AlertTriangle,
      change: "-3%",
      color: "hsl(var(--destructive))",
    },
  ];

  const tierDist = m.tierDistribution ?? {};
  const brandVisits = m.visitsByBrand ?? {};
  const countryVisits = m.visitsByCountry ?? {};

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">RISE Holding loyalty intelligence overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4 border border-border/40 transition-all duration-300 hover:border-primary/20 group"
            style={{
              background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${card.color}15` }}
              >
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: card.change.startsWith("+") ? "hsl(var(--success) / 0.1)" : "hsl(var(--destructive) / 0.1)",
                  color: card.change.startsWith("+") ? "hsl(var(--success))" : "hsl(var(--destructive))",
                }}
              >
                {card.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Grid: Tier Distribution + Brand Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tier Distribution */}
        <div
          className="rounded-xl p-5 border border-border/40"
          style={{ background: "hsl(var(--card))" }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Tier Distribution</h3>
          <div className="space-y-3">
            {Object.entries(tierDist).map(([tier, count]) => {
              const total = Object.values(tierDist).reduce((a: number, b: any) => a + Number(b), 0);
              const pct = total > 0 ? (Number(count) / total) * 100 : 0;
              return (
                <div key={tier}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground capitalize">{tier.replace("-", " ")}</span>
                    <span className="text-foreground font-medium">{Number(count).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold) / 0.6))",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Performance */}
        <div
          className="rounded-xl p-5 border border-border/40"
          style={{ background: "hsl(var(--card))" }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">NOIR Visits</div>
              <div className="text-xl font-bold text-foreground">{(brandVisits.noir ?? 0).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">SASSO Visits</div>
              <div className="text-xl font-bold text-foreground">{(brandVisits.sasso ?? 0).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Qatar</div>
              <div className="text-xl font-bold text-foreground">{(countryVisits.doha ?? 0).toLocaleString()}</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Riyadh</div>
              <div className="text-xl font-bold text-foreground">{(countryVisits.riyadh ?? 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Interactive Map", desc: "Explore location performance", icon: Map, view: "map" },
          { label: "AI Intelligence", desc: "Chat with RISE ONE", icon: Brain, view: "ai" },
          { label: "Member Directory", desc: "Browse loyalty members", icon: Users, view: "members" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.view)}
            className="rounded-xl p-4 border border-border/40 text-left transition-all duration-300 hover:border-primary/25 hover:shadow-lg group"
            style={{ background: "hsl(var(--card))" }}
          >
            <div className="flex items-center justify-between mb-2">
              <action.icon className="w-5 h-5 text-primary" />
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-sm font-medium text-foreground">{action.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
