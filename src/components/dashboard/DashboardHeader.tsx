import { Button } from '@/components/ui/button';
import { Bell, Search, Plus } from 'lucide-react';

export function DashboardHeader() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-medium text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
      </div>

      <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Button variant="ghost" size="icon" className="relative">
          <Search className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <Button variant="luxury" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Guest</span>
        </Button>
      </div>
    </header>
  );
}
