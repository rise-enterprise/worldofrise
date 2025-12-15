import { useState } from 'react';
import { Brand, Guest } from '@/types/loyalty';
import { mockGuests, mockMetrics } from '@/data/mockData';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Overview } from '@/components/dashboard/Overview';
import { GuestsList } from '@/components/dashboard/GuestsList';
import { GuestProfile } from '@/components/dashboard/GuestProfile';
import { BulkInsightsView } from '@/components/insights/BulkInsightsView';
import { PrivilegesView } from '@/components/dashboard/PrivilegesView';
import { EventsView } from '@/components/dashboard/EventsView';
import { SettingsView } from '@/components/dashboard/SettingsView';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeBrand, setActiveBrand] = useState<Brand>('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setActiveView('profile');
  };

  const handleBackToGuests = () => {
    setSelectedGuest(null);
    setActiveView('guests');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
      />

      <main className="ml-64">
        <DashboardHeader />
        
        {activeView === 'dashboard' && (
          <Overview 
            metrics={mockMetrics} 
            guests={mockGuests}
            activeBrand={activeBrand}
          />
        )}

        {activeView === 'guests' && (
          <GuestsList 
            guests={mockGuests}
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
      </main>
    </div>
  );
}
