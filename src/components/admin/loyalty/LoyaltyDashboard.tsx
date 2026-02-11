import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TierDistribution } from '@/components/dashboard/TierDistribution';
import { BrandMetrics } from '@/components/dashboard/BrandMetrics';
import { CountryMetrics } from '@/components/dashboard/CountryMetrics';
import { Users, TrendingUp, AlertTriangle, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoyaltyDashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">Loyalty Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of the loyalty program performance
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Total Members"
          value={metrics.totalMembers.toLocaleString()}
          subtitle="Across all regions"
          icon={Users}
          trend={{ value: 12, label: 'this month' }}
          delay={0}
        />
        <MetricCard
          title="Visits This Month"
          value={metrics.totalVisitsThisMonth.toLocaleString()}
          subtitle="Combined brands"
          icon={TrendingUp}
          trend={{ value: 8, label: 'vs last month' }}
          delay={100}
        />
        <MetricCard
          title="VIP Members"
          value={metrics.vipGuestsCount}
          subtitle="Inner Circle & RISE Black"
          icon={Crown}
          delay={200}
        />
        <MetricCard
          title="Re-engagement Needed"
          value={metrics.churnRiskCount}
          subtitle="Haven't visited in 30+ days"
          icon={AlertTriangle}
          delay={300}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        <TierDistribution distribution={metrics.tierDistribution} />
        <BrandMetrics visitsByBrand={metrics.visitsByBrand} />
        <CountryMetrics visitsByCountry={metrics.visitsByCountry} />
      </div>
    </div>
  );
}
