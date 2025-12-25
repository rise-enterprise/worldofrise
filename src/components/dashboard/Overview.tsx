import { DashboardMetrics, Guest, Brand } from '@/types/loyalty';
import { MetricCard } from './MetricCard';
import { TierDistribution } from './TierDistribution';
import { VIPGuestCard } from './VIPGuestCard';
import { BrandMetrics } from './BrandMetrics';
import { CountryMetrics } from './CountryMetrics';
import { Users, TrendingUp, AlertTriangle, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface OverviewProps {
  metrics: DashboardMetrics;
  guests: Guest[];
  activeBrand: Brand;
}

export function Overview({ metrics, guests, activeBrand }: OverviewProps) {
  // Filter VIP guests (top tiers)
  const vipGuests = guests.filter(g => 
    g.tier === 'black' || g.tier === 'inner-circle' || g.tier === 'elite'
  ).slice(0, 4);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Tier Distribution */}
        <div className="lg:col-span-1">
          <TierDistribution distribution={metrics.tierDistribution} />
        </div>

        {/* Middle Column - Brand & Country */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <BrandMetrics visitsByBrand={metrics.visitsByBrand} />
          <CountryMetrics visitsByCountry={metrics.visitsByCountry} />
        </div>

        {/* Right Column - VIP Guests */}
        <div className="lg:col-span-1">
          <Card variant="luxury" className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <CardHeader className="pb-3 md:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base md:text-lg">Distinguished Guests</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Your most valued members</p>
                </div>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
                  View all
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Mobile: Horizontal scroll */}
              <div className="block md:hidden">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-3 pb-2">
                    {vipGuests.map((guest, index) => (
                      <div key={guest.id} className="w-[200px] shrink-0">
                        <VIPGuestCard 
                          guest={guest} 
                          delay={600 + index * 100}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
              {/* Desktop: Vertical list */}
              <div className="hidden md:block space-y-3">
                {vipGuests.map((guest, index) => (
                  <VIPGuestCard 
                    key={guest.id} 
                    guest={guest} 
                    delay={600 + index * 100}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
