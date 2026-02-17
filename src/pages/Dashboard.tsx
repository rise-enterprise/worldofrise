import { useState } from 'react';
import { Brand, Guest, DashboardMetrics } from '@/types/loyalty';
import { useVIPGuests } from '@/hooks/useMembers';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Overview } from '@/components/dashboard/Overview';
import { GuestsList } from '@/components/dashboard/GuestsList';
import { GuestProfile } from '@/components/dashboard/GuestProfile';
import { BulkInsightsView } from '@/components/insights/BulkInsightsView';
import { PrivilegesView } from '@/components/dashboard/PrivilegesView';
import { EventsView } from '@/components/dashboard/EventsView';
import { NotificationsView } from '@/components/dashboard/NotificationsView';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { AdminsView } from '@/components/dashboard/AdminsView';
import { AnalyticsView } from '@/components/dashboard/AnalyticsView';
import { RewardsManagement } from '@/components/dashboard/RewardsManagement';
import { CMSView } from '@/components/dashboard/CMSView';
import { BranchPreferences } from '@/components/dashboard/BranchPreferences';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const emptyMetrics: DashboardMetrics = {
  totalMembers: 0,
  activeMembers: 0,
  totalVisitsThisMonth: 0,
  visitsByBrand: { noir: 0, sasso: 0 },
  visitsByCountry: { doha: 0, riyadh: 0 },
  tierDistribution: {},
  churnRiskCount: 0,
  vipGuestsCount: 0,
};

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeBrand, setActiveBrand] = useState<Brand>('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { isRTL } = useLanguage();
  const useDrawer = isMobile || isTablet;
  const brandForQuery = activeBrand === 'all' ? 'both' : activeBrand;
  const { data: vipGuests = [], isLoading: vipLoading } = useVIPGuests(brandForQuery as any);
  const { data: metrics = emptyMetrics, isLoading: metricsLoading } = useDashboardMetrics(activeBrand);

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setActiveView('profile');
  };

  const handleBackToGuests = () => {
    setSelectedGuest(null);
    setActiveView('guests');
  };

  const isLoading = vipLoading || metricsLoading;

  return (
    <CrystalPageWrapper variant="ambient" sparkleCount={20} showSparkles={true}>
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className={cn(
        'relative z-10',
        !useDrawer && (isRTL ? 'mr-64' : 'ml-64')
      )}>
        <DashboardHeader 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {activeView === 'dashboard' && (
              isLoading ? (
                <div className="p-4 md:p-8 space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-32 bg-card" />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64 bg-card" />
                    ))}
                  </div>
                </div>
              ) : (
              <Overview 
                  metrics={metrics} 
                  guests={vipGuests}
                  activeBrand={activeBrand}
                />
              )
            )}

            {activeView === 'guests' && (
              <GuestsList 
                activeBrand={activeBrand}
                onSelectGuest={handleSelectGuest}
              />
            )}

            {activeView === 'profile' && selectedGuest && (
              <GuestProfile 
                guest={selectedGuest}
                onBack={handleBackToGuests}
              />
            )}

            {activeView === 'insights' && (
              <BulkInsightsView onSelectGuest={handleSelectGuest} />
            )}

            {activeView === 'privileges' && <PrivilegesView />}

            {activeView === 'rewards' && <RewardsManagement />}

            {activeView === 'events' && <EventsView />}

            {activeView === 'analytics' && <AnalyticsView />}

            {activeView === 'notifications' && <NotificationsView />}

            {activeView === 'settings' && <SettingsView />}

            {activeView === 'admins' && <AdminsView />}

            {activeView === 'cms' && <CMSView />}
          </div>

          {/* Branch Preferences sidebar widget */}
          <div className="w-full lg:w-80 shrink-0 p-4 md:p-6 lg:pt-8">
            <div className="lg:sticky lg:top-4">
              <BranchPreferences activeBrand={activeBrand} />
            </div>
          </div>
        </div>
      </main>
    </CrystalPageWrapper>
  );
}
