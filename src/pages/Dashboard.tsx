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
import { NotificationsView } from '@/components/dashboard/NotificationsView';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { AdminsView } from '@/components/dashboard/AdminsView';
import { AnalyticsView } from '@/components/dashboard/AnalyticsView';
import { RewardsManagement } from '@/components/dashboard/RewardsManagement';
import { CMSView } from '@/components/dashboard/CMSView';
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
    <div className="min-h-screen bg-background relative">
      {/* Enhanced ambient background effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 70%)',
            animationDuration: '8s',
          }}
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, hsl(var(--burgundy) / 0.02) 0%, transparent 70%)',
            animationDuration: '12s',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--sapphire) / 0.01) 0%, transparent 50%)',
          }}
        />
      </div>

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
        isMobile ? '' : (isRTL ? 'mr-64' : 'ml-64')
      )}>
        <DashboardHeader 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        {activeView === 'dashboard' && (
          isLoading ? (
            <div className="p-4 md:p-8 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 bg-[#0E1116]" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 bg-[#0E1116]" />
                ))}
              </div>
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

        {activeView === 'rewards' && <RewardsManagement />}

        {activeView === 'events' && <EventsView />}

        {activeView === 'analytics' && <AnalyticsView />}

        {activeView === 'notifications' && <NotificationsView />}

        {activeView === 'settings' && <SettingsView />}

        {activeView === 'admins' && <AdminsView />}

        {activeView === 'cms' && <CMSView />}
      </main>
    </div>
  );
}
