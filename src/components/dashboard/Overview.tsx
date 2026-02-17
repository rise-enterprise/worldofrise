import { useState, useCallback } from 'react';
import type { Layout, Layouts } from 'react-grid-layout';
import { DashboardMetrics, Guest, Brand } from '@/types/loyalty';
import { MetricCard } from './MetricCard';
import { TierDistribution } from './TierDistribution';
import { VIPGuestCard } from './VIPGuestCard';
import { BrandMetrics } from './BrandMetrics';
import { CountryMetrics } from './CountryMetrics';
import { EditableGridLayout } from './EditableGridLayout';
import {
  WIDGET_IDS,
  defaultLayouts,
  loadSavedLayouts,
  saveLayouts,
  clearSavedLayouts,
} from './dashboardLayoutConfig';
import { Users, TrendingUp, AlertTriangle, Crown, GripVertical, Lock, Unlock, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

function WidgetWrapper({ isEditing, children, className }: { isEditing: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('h-full relative group', className)}>
      {isEditing && (
        <div className="widget-drag-handle absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-primary/10 hover:bg-primary/20 rounded p-1">
          <GripVertical className="h-4 w-4 text-primary" />
        </div>
      )}
      {children}
    </div>
  );
}

export function Overview({ metrics, guests, activeBrand }: OverviewProps) {
  const labels = brandLabels[activeBrand] || brandLabels.all;
  const vipGuests = guests.slice(0, 4);

  const [isEditing, setIsEditing] = useState(false);
  const [layouts, setLayouts] = useState<Record<string, Layout[]>>(
    () => loadSavedLayouts() || defaultLayouts
  );

  const handleLayoutChange = useCallback((_layout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts as Record<string, Layout[]>);
    saveLayouts(allLayouts as Record<string, Layout[]>);
  }, []);

  const handleReset = useCallback(() => {
    clearSavedLayouts();
    setLayouts(defaultLayouts);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Edit controls */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 text-xs',
            isEditing && 'border-primary/50 text-primary'
          )}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {isEditing ? 'Lock Layout' : 'Edit Layout'}
        </Button>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs text-muted-foreground"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      <EditableGridLayout
        layouts={layouts}
        isEditing={isEditing}
        onLayoutChange={handleLayoutChange}
      >
        {/* Metric Cards */}
        <div key={WIDGET_IDS.METRIC_MEMBERS}>
          <WidgetWrapper isEditing={isEditing}>
            <MetricCard
              title="Total Members"
              value={metrics.totalMembers.toLocaleString()}
              subtitle={labels.members}
              icon={Users}
              trend={{ value: 12, label: 'this month' }}
              delay={0}
            />
          </WidgetWrapper>
        </div>
        <div key={WIDGET_IDS.METRIC_VISITS}>
          <WidgetWrapper isEditing={isEditing}>
            <MetricCard
              title="Visits This Month"
              value={metrics.totalVisitsThisMonth.toLocaleString()}
              subtitle={labels.visits}
              icon={TrendingUp}
              trend={{ value: 8, label: 'vs last month' }}
              delay={100}
            />
          </WidgetWrapper>
        </div>
        <div key={WIDGET_IDS.METRIC_VIP}>
          <WidgetWrapper isEditing={isEditing}>
            <MetricCard
              title="VIP Members"
              value={metrics.vipGuestsCount}
              subtitle="Inner Circle & RISE Black"
              icon={Crown}
              delay={200}
            />
          </WidgetWrapper>
        </div>
        <div key={WIDGET_IDS.METRIC_CHURN}>
          <WidgetWrapper isEditing={isEditing}>
            <MetricCard
              title="Re-engagement Needed"
              value={metrics.churnRiskCount}
              subtitle="Haven't visited in 30+ days"
              icon={AlertTriangle}
              delay={300}
            />
          </WidgetWrapper>
        </div>

        {/* Tier Distribution */}
        <div key={WIDGET_IDS.TIER_DISTRIBUTION}>
          <WidgetWrapper isEditing={isEditing}>
            <TierDistribution distribution={metrics.tierDistribution} />
          </WidgetWrapper>
        </div>

        {/* Brand Metrics */}
        <div key={WIDGET_IDS.BRAND_METRICS}>
          <WidgetWrapper isEditing={isEditing}>
            <BrandMetrics visitsByBrand={metrics.visitsByBrand} />
          </WidgetWrapper>
        </div>

        {/* Country Metrics */}
        <div key={WIDGET_IDS.COUNTRY_METRICS}>
          <WidgetWrapper isEditing={isEditing}>
            <CountryMetrics visitsByCountry={metrics.visitsByCountry} />
          </WidgetWrapper>
        </div>

        {/* VIP Guests */}
        <div key={WIDGET_IDS.VIP_GUESTS}>
          <WidgetWrapper isEditing={isEditing}>
            <Card variant="obsidian" className="h-full animate-slide-up relative overflow-hidden" style={{ animationDelay: '500ms' }}>
              <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
              <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
              <div className="absolute top-0 right-0 w-8 h-px bg-gradient-to-l from-primary/50 to-transparent" />
              <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
              
              <CardHeader className="pb-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
                    <div>
                      <CardTitle className="text-base md:text-lg tracking-wide font-display">Distinguished Guests</CardTitle>
                      <p className="text-xs text-muted-foreground/60 mt-1 tracking-refined">Your most valued members</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-medium cursor-pointer hover:text-primary/70 transition-colors duration-300 tracking-refined">
                    Explore Further
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 overflow-auto" style={{ maxHeight: 'calc(100% - 80px)' }}>
                <div className="space-y-4">
                  {vipGuests.map((guest, index) => (
                    <VIPGuestCard 
                      key={guest.id} 
                      guest={guest} 
                      delay={600 + index * 150}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </WidgetWrapper>
        </div>
      </EditableGridLayout>
    </div>
  );
}
