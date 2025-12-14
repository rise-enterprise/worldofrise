import { useState } from 'react';
import { Brand, Guest } from '@/types/loyalty';
import { mockGuests, mockMetrics } from '@/data/mockData';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Overview } from '@/components/dashboard/Overview';
import { GuestsList } from '@/components/dashboard/GuestsList';
import { GuestProfile } from '@/components/dashboard/GuestProfile';

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

        {activeView === 'privileges' && (
          <div className="p-8">
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Privileges & Rewards</h2>
            <p className="text-muted-foreground">Privilege management coming soon...</p>
          </div>
        )}

        {activeView === 'events' && (
          <div className="p-8">
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Events & Experiences</h2>
            <p className="text-muted-foreground">Event management coming soon...</p>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="p-8">
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Settings</h2>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}
