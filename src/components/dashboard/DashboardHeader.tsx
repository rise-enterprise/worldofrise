import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Search, Plus, Upload, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { Guest, Country } from '@/types/loyalty';
import { useMembers, useCreateMember } from '@/hooks/useMembers';
import { DataImport } from './DataImport';

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  onGuestAdded?: (guest: Partial<Guest>) => void;
  onMenuClick?: () => void;
}

export function DashboardHeader({ onSearch, onGuestAdded, onMenuClick }: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [newGuestOpen, setNewGuestOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New VIP guest registered', time: '2 mins ago', read: false },
    { id: 2, message: 'Ahmed Al-Rashid reached Inner Circle', time: '1 hour ago', read: false },
    { id: 3, message: 'Upcoming event: Chef\'s Table Experience', time: '3 hours ago', read: false },
  ]);

  const { data: guests = [] } = useMembers();
  const createMember = useCreateMember();

  // New guest form state
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'doha' as Country,
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
      const results = guests.filter(guest => 
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

  const handleNewGuest = async () => {
    if (!newGuest.name.trim()) {
      toast.error('Please enter guest name');
      return;
    }
    if (!newGuest.email.trim() || !newGuest.email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      await createMember.mutateAsync({
        full_name: newGuest.name,
        email: newGuest.email,
        phone: newGuest.phone || '',
        city: newGuest.country,
      });

      toast.success(`${newGuest.name} has been registered!`, {
        description: 'Welcome to RISE loyalty program',
      });
      
      setNewGuestOpen(false);
      setNewGuest({ name: '', email: '', phone: '', country: 'doha' });
    } catch (error) {
      toast.error('Failed to register guest');
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex items-center justify-between py-4 md:py-6 px-4 md:px-8 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30 gap-4">
      <div className="flex items-center gap-3 animate-fade-in min-w-0">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="min-w-0">
          <h1 className="font-display text-lg md:text-2xl font-medium text-foreground truncate">
            Welcome back
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 truncate">{currentDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 animate-fade-in shrink-0" style={{ animationDelay: '100ms' }}>
        {/* Search Button */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] md:w-80" align="end">
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
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] md:w-80" align="end">
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

        {/* Import CSV Button - Icon only on mobile */}
        <Button 
          variant="outline" 
          className="gap-2 h-9 md:h-10 px-3 md:px-4" 
          onClick={() => setImportOpen(true)}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden md:inline">Import CSV</span>
        </Button>

        {/* New Guest Button - Icon only on mobile */}
        <Dialog open={newGuestOpen} onOpenChange={setNewGuestOpen}>
          <Button 
            variant="luxury" 
            className="gap-2 h-9 md:h-10 px-3 md:px-4" 
            onClick={() => setNewGuestOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New Guest</span>
          </Button>
          <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-lg">
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
                  onValueChange={(value: Country) => 
                    setNewGuest(prev => ({ ...prev, country: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doha">🇶🇦 Qatar (Doha)</SelectItem>
                    <SelectItem value="riyadh">🇸🇦 Saudi Arabia (Riyadh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setNewGuestOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="luxury" 
                  className="flex-1" 
                  onClick={handleNewGuest}
                  disabled={createMember.isPending}
                >
                  {createMember.isPending ? 'Registering...' : 'Register Guest'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* CSV Import Dialog */}
        <DataImport open={importOpen} onOpenChange={setImportOpen} />
      </div>
    </header>
  );
}
