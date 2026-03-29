import { DashboardMetrics, Guest, Brand } from '@/types/loyalty';
import { MetricCard } from './MetricCard';
import { TierDistribution } from './TierDistribution';
import { VIPGuestCard } from './VIPGuestCard';
import { BrandMetrics } from './BrandMetrics';
import { CountryMetrics } from './CountryMetrics';
import { BranchPreferences } from './BranchPreferences';
import { Users, TrendingUp, AlertTriangle, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewProps {
  metrics: DashboardMetrics;
  guests: Guest[];
  activeBrand: Brand;
}

const brandLabels: Record<string, { members: string; visits: string }> = {
  all: { members: 'Across all regions', visits: 'Combined brands' },
  noir: { members: 'NOIR Cafe only', visits: 'NOIR locations' },
  sasso: { members: 'SASSO only', visits: 'SASSO locations' },
};

export function Overview({ metrics, guests, activeBrand }: OverviewProps) {
  const labels = brandLabels[activeBrand] || brandLabels.all;
  const vipGuests = guests.slice(0, 4);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Members" value={metrics.totalMembers.toLocaleString()} subtitle={labels.members} icon={Users} trend={{ value: 12, label: 'this month' }} delay={0} />
        <MetricCard title="Visits This Month" value={metrics.totalVisitsThisMonth.toLocaleString()} subtitle={labels.visits} icon={TrendingUp} trend={{ value: 8, label: 'vs last month' }} delay={100} />
        <MetricCard title="VIP Members" value={metrics.vipGuestsCount} subtitle="Inner Circle & RISE Black" icon={Crown} delay={200} />
        <MetricCard title="Re-engagement" value={metrics.churnRiskCount} subtitle="30+ days inactive" icon={AlertTriangle} delay={300} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TierDistribution distribution={metrics.tierDistribution} />
        {activeBrand === 'all' ? (
          <BrandMetrics visitsByBrand={metrics.visitsByBrand} />
        ) : (
          <BranchPreferences
            activeBrand={activeBrand}
            allowedBranches={activeBrand === 'noir'
              ? ['NOIR Café - Riyadh', 'NOIR Café - West Walk', 'NOIR Café - Al Hazm', 'NOIR Café - Old Doha Port']
              : ['SASSO - West Walk', 'SASSO - Al Hazm']}
          />
        )}
        <CountryMetrics visitsByCountry={metrics.visitsByCountry} />
      </div>

      {/* VIP Guests */}
      {vipGuests.length > 0 && (
        <Card className="border-border/15 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-primary/30" />
              <CardTitle className="text-base tracking-wide">Distinguished Members</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vipGuests.map((guest, i) => (
                <VIPGuestCard key={guest.id} guest={guest} delay={500 + i * 100} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
