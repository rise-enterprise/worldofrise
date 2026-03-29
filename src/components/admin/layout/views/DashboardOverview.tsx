import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Users, TrendingUp, Crown, AlertTriangle, ArrowUpRight, Map, Brain, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
    { label: "Total Members", value: (m.totalMembers ?? 0).toLocaleString(), icon: Users, change: "+12%", positive: true },
    { label: "Visits This Month", value: (m.totalVisitsThisMonth ?? 0).toLocaleString(), icon: TrendingUp, change: "+8%", positive: true },
    { label: "VIP Members", value: (m.vipGuestsCount ?? 0).toLocaleString(), icon: Crown, change: "+5%", positive: true },
    { label: "Churn Risk", value: (m.churnRiskCount ?? 0).toLocaleString(), icon: AlertTriangle, change: "-3%", positive: false },
  ];

  const tierDist = m.tierDistribution ?? {};
  const brandVisits = m.visitsByBrand ?? {};
  const countryVisits = m.visitsByCountry ?? {};

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-medium text-foreground tracking-crystal">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">RISE loyalty intelligence overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl p-5 border border-border/15 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/15 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: card.positive ? 'hsl(var(--gold) / 0.08)' : 'hsl(var(--destructive) / 0.08)' }}>
                <card.icon className="w-4 h-4" style={{ color: card.positive ? 'hsl(var(--gold))' : 'hsl(var(--destructive))' }} />
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: card.positive ? 'hsl(var(--success) / 0.08)' : 'hsl(var(--destructive) / 0.08)',
                  color: card.positive ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                }}>
                {card.change}
              </span>
            </div>
            <div className="text-2xl font-display font-medium text-foreground tracking-tight">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tier Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl p-5 border border-border/15 bg-card/50 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-foreground mb-5">Tier Distribution</h3>
          <div className="space-y-3">
            {Object.entries(tierDist).map(([tier, count]) => {
              const total = Object.values(tierDist).reduce((a: number, b) => a + Number(b), 0) as number;
              const pct = total > 0 ? (Number(count) / total) * 100 : 0;
              return (
                <div key={tier}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground capitalize">{tier.replace("-", " ")}</span>
                    <span className="text-foreground font-medium">{Number(count).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-muted/30">
                    <motion.div className="h-full rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      style={{ background: 'linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold) / 0.5))' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl p-5 border border-border/15 bg-card/50 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-foreground mb-5">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'NOIR Visits', value: brandVisits.noir ?? 0 },
              { label: 'SASSO Visits', value: brandVisits.sasso ?? 0 },
              { label: 'Qatar', value: countryVisits.doha ?? 0 },
              { label: 'Riyadh', value: countryVisits.riyadh ?? 0 },
            ].map(item => (
              <div key={item.label} className="rounded-lg p-3 bg-background/40 border border-border/10">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{item.label}</div>
                <div className="text-xl font-display font-medium text-foreground">{item.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Location Map", desc: "Explore venues", icon: Map, view: "map" },
          { label: "RISE AI", desc: "Intelligence chat", icon: Brain, view: "ai" },
          { label: "Members", desc: "Member directory", icon: Users, view: "members" },
          { label: "Analytics", desc: "Data insights", icon: BarChart3, view: "analytics" },
        ].map((action, i) => (
          <motion.button key={action.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
            onClick={() => onNavigate(action.view)}
            className="rounded-xl p-4 border border-border/15 bg-card/30 text-left transition-all duration-200 hover:border-primary/15 hover:bg-card/50 group">
            <div className="flex items-center justify-between mb-2">
              <action.icon className="w-4 h-4 text-primary/70" />
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-sm font-medium text-foreground">{action.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
