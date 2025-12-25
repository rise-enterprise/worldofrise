import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Search, Plus, Upload, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
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
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  onGuestAdded?: (guest: Partial<Guest>) => void;
  onMenuClick?: () => void;
}

export function DashboardHeader({ onSearch, onGuestAdded, onMenuClick }: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [newGuestOpen, setNewGuestOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: t('notifications.newVipGuest'), time: '2 mins ago', read: false },
    { id: 2, message: `Ahmed Al-Rashid ${t('notifications.tierReached')} Inner Circle`, time: '1 hour ago', read: false },
    { id: 3, message: `${t('notifications.upcomingEvent')}: Chef's Table Experience`, time: '3 hours ago', read: false },
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

  const currentDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
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
      toast.error(t('notifications.pleaseEnterName'));
      return;
    }
    if (!newGuest.email.trim() || !newGuest.email.includes('@')) {
      toast.error(t('notifications.pleaseEnterEmail'));
      return;
    }

    try {
      await createMember.mutateAsync({
        full_name: newGuest.name,
        email: newGuest.email,
        phone: newGuest.phone || '',
        city: newGuest.country,
      });

      toast.success(`${newGuest.name} ${t('notifications.guestRegistered')}`, {
        description: t('notifications.welcomeToRise'),
      });
      
      setNewGuestOpen(false);
      setNewGuest({ name: '', email: '', phone: '', country: 'doha' });
    } catch (error) {
      toast.error(t('notifications.registrationFailed'));
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(t('notifications.allMarkedRead'));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={cn(
      "flex items-center justify-between py-4 md:py-6 px-4 md:px-8 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30 gap-4",
      isRTL && "flex-row-reverse"
    )}>
      <div className={cn("flex items-center gap-3 animate-fade-in min-w-0", isRTL && "flex-row-reverse")}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className={cn("min-w-0", isRTL && "text-right")}>
          <h1 className="font-display text-lg md:text-2xl font-medium text-foreground truncate">
            {t('common.welcome')}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 truncate">{currentDate}</p>
        </div>
      </div>

      <div className={cn("flex items-center gap-2 md:gap-3 animate-fade-in shrink-0", isRTL && "flex-row-reverse")} style={{ animationDelay: '100ms' }}>
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Search Button */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] md:w-80" align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t('header.searchGuests')}</h4>
              <Input 
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
                dir={isRTL ? 'rtl' : 'ltr'}
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
                  {t('header.noGuestsFound')}
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
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <h4 className="font-medium text-sm">{t('header.notifications')}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                  onClick={markAllRead}
                >
                  {t('header.markAllRead')}
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
                    <div className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                      )}
                      <div className={isRTL ? "text-right" : ""}>
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
          className={cn("gap-2 h-9 md:h-10 px-3 md:px-4", isRTL && "flex-row-reverse")}
          onClick={() => setImportOpen(true)}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden md:inline">{t('header.importCsv')}</span>
        </Button>

        {/* New Guest Button - Icon only on mobile */}
        <Dialog open={newGuestOpen} onOpenChange={setNewGuestOpen}>
          <Button 
            variant="qatar" 
            className={cn("gap-2 h-9 md:h-10 px-3 md:px-4", isRTL && "flex-row-reverse")}
            onClick={() => setNewGuestOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">{t('header.newGuest')}</span>
          </Button>
          <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{t('header.registerNewGuest')}</DialogTitle>
              <DialogDescription>
                {t('header.addMemberDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="space-y-2">
                <Label htmlFor="name">{t('header.fullName')} *</Label>
                <Input 
                  id="name"
                  placeholder={t('header.fullName')}
                  value={newGuest.name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('header.email')} *</Label>
                <Input 
                  id="email"
                  placeholder={t('header.email')}
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('header.phoneOptional')}</Label>
                <Input 
                  id="phone"
                  placeholder={t('header.phone')}
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('header.country')}</Label>
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
                    <SelectItem value="doha">🇶🇦 {t('header.qatar')}</SelectItem>
                    <SelectItem value="riyadh">🇸🇦 {t('header.saudiArabia')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={cn("flex gap-3 pt-2", isRTL && "flex-row-reverse")}>
                <Button variant="outline" className="flex-1" onClick={() => setNewGuestOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  variant="qatar" 
                  className="flex-1" 
                  onClick={handleNewGuest}
                  disabled={createMember.isPending}
                >
                  {createMember.isPending ? t('header.registering') : t('header.registerGuest')}
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
