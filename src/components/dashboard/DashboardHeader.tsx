import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

export function DashboardHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newGuestOpen, setNewGuestOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const notifications = [
    { id: 1, message: 'New VIP guest registered', time: '2 mins ago' },
    { id: 2, message: 'Ahmed Al-Rashid reached Inner Circle', time: '1 hour ago' },
    { id: 3, message: 'Upcoming event: Chef\'s Table Experience', time: '3 hours ago' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}"...`);
      // Search functionality would connect to real data
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleNewGuest = () => {
    toast.success('New guest registration coming soon');
    setNewGuestOpen(false);
  };

  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-medium text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
      </div>

      <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {/* Search Button */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Search Guests</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Notifications Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Notifications</h4>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  Mark all read
                </Button>
              </div>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <p className="text-sm text-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* New Guest Button */}
        <Dialog open={newGuestOpen} onOpenChange={setNewGuestOpen}>
          <Button variant="luxury" className="gap-2" onClick={() => setNewGuestOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>New Guest</span>
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Register New Guest</DialogTitle>
              <DialogDescription>
                Add a new member to the RISE loyalty program
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Phone" type="tel" />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setNewGuestOpen(false)}>
                  Cancel
                </Button>
                <Button variant="luxury" className="flex-1" onClick={handleNewGuest}>
                  Register Guest
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
