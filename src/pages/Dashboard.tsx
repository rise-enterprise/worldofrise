import { useState } from 'react';
import { Brand, Guest, DashboardMetrics } from '@/types/loyalty';
import { useMembers } from '@/hooks/useMembers';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Overview } from '@/components/dashboard/Overview';
import { GuestsList } from '@/components/dashboard/GuestsList';
import { GuestProfile } from '@/components/dashboard/GuestProfile';
import { BulkInsightsView } from '@/components/insights/BulkInsightsView';
import { PrivilegesView } from '@/components/dashboard/PrivilegesView';
import { EventsView } from '@/components/dashboard/EventsView';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { AdminsView } from '@/components/dashboard/AdminsView';
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
  const { isRTL } = useLanguage();
  const { data: guests = [], isLoading: guestsLoading } = useMembers();
  const { data: metrics = emptyMetrics, isLoading: metricsLoading } = useDashboardMetrics();

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setActiveView('profile');
  };

  const handleBackToGuests = () => {
    setSelectedGuest(null);
    setActiveView('guests');
  };

  const isLoading = guestsLoading || metricsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className={cn(
        isMobile ? '' : (isRTL ? 'mr-64' : 'ml-64')
      )}>
        <DashboardHeader 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        {activeView === 'dashboard' && (
          isLoading ? (
            <div className="p-4 md:p-8 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <Overview 
              metrics={metrics} 
              guests={guests}
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

        {activeView === 'events' && <EventsView />}

        {activeView === 'settings' && <SettingsView />}

        {activeView === 'admins' && <AdminsView />}
      </main>
    </div>
  );
}
