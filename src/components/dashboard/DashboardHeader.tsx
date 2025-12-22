import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Guest, Brand } from '@/types/loyalty';
import { mockGuests } from '@/data/mockData';

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  onGuestAdded?: (guest: Partial<Guest>) => void;
  isMobile?: boolean;
  activeBrand?: Brand;
}

export function DashboardHeader({ onSearch, onGuestAdded, isMobile, activeBrand }: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [newGuestOpen, setNewGuestOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New VIP guest registered', time: '2 mins ago', read: false },
    { id: 2, message: 'Ahmed Al-Rashid reached Inner Circle', time: '1 hour ago', read: false },
    { id: 3, message: 'Upcoming event: Chef\'s Table Experience', time: '3 hours ago', read: false },
  ]);

  // New guest form state
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'qatar' as 'qatar' | 'riyadh',
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: isMobile ? 'short' : 'long',
    year: 'numeric',
    month: isMobile ? 'short' : 'long',
    day: 'numeric',
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = mockGuests.filter(guest => 
        guest.name.toLowerCase().includes(query.toLowerCase()) ||
        guest.email.toLowerCase().includes(query.toLowerCase()) ||
        (guest.phone && guest.phone.includes(query))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleNewGuest = () => {
    if (!newGuest.name.trim()) {
      toast.error('Please enter guest name');
      return;
    }
    if (!newGuest.email.trim() || !newGuest.email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    const guest: Partial<Guest> = {
      id: Date.now().toString(),
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone || undefined,
      country: newGuest.country,
      tier: 'initiation',
      totalVisits: 0,
      lifetimeVisits: 0,
      lastVisit: new Date(),
      joinedAt: new Date(),
      favoriteBrand: 'noir',
      visits: [],
      tags: ['New Member'],
    };

    if (onGuestAdded) {
      onGuestAdded(guest);
    }

    toast.success(`${newGuest.name} has been registered!`, {
      description: 'Welcome to RISE loyalty program',
    });
    
    setNewGuestOpen(false);
    setNewGuest({ name: '', email: '', phone: '', country: 'qatar' });
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30 ${isMobile ? 'py-4 px-4' : 'py-6 px-8'}`}>
      <div className="animate-fade-in min-w-0 flex-1">
        <h1 className={`font-display font-medium text-foreground ${isMobile ? 'text-lg' : 'text-2xl'}`}>
          Welcome back
        </h1>
        <p className={`text-muted-foreground mt-0.5 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>{currentDate}</p>
      </div>

      <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {/* Search Button */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={isMobile ? 'w-[calc(100vw-32px)]' : 'w-80'} align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Search Guests</h4>
              <Input 
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.map((guest) => (
                    <div 
                      key={guest.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                        toast.info(`Selected: ${guest.name}`);
                      }}
                    >
                      <p className="text-sm font-medium text-foreground">{guest.name}</p>
                      <p className="text-xs text-muted-foreground">{guest.email}</p>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No guests found
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Notifications Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className={isMobile ? 'w-[calc(100vw-32px)]' : 'w-80'} align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Notifications</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              </div>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg transition-colors cursor-pointer ${
                      notif.read ? 'bg-muted/30' : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => {
                      setNotifications(prev => 
                        prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                      );
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* New Guest Button */}
        <Dialog open={newGuestOpen} onOpenChange={setNewGuestOpen}>
          <Button 
            variant="luxury" 
            className={`gap-2 ${isMobile ? 'px-3' : ''}`}
            onClick={() => setNewGuestOpen(true)}
            size={isMobile ? 'sm' : 'default'}
          >
            <Plus className="h-4 w-4" />
            {!isMobile && <span>New Guest</span>}
          </Button>
          <DialogContent className={isMobile ? 'w-[calc(100vw-32px)] max-w-lg' : ''}>
            <DialogHeader>
              <DialogTitle className="font-display">Register New Guest</DialogTitle>
              <DialogDescription>
                Add a new member to the RISE loyalty program
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name"
                  placeholder="Enter full name"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email"
                  placeholder="Enter email address"
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input 
                  id="phone"
                  placeholder="Enter phone number"
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  value={newGuest.country} 
                  onValueChange={(value: 'qatar' | 'riyadh') => 
                    setNewGuest(prev => ({ ...prev, country: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qatar">🇶🇦 Qatar</SelectItem>
                    <SelectItem value="riyadh">🇸🇦 Saudi Arabia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={`flex gap-3 pt-2 ${isMobile ? 'flex-col' : ''}`}>
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
