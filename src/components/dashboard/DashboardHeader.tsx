import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Search, Plus, Upload, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
      "flex items-center justify-between py-4 md:py-6 px-4 md:px-8 border-b border-primary/10 bg-gradient-to-r from-[#07080A]/95 via-[#0E1116]/90 to-[#07080A]/95 backdrop-blur-2xl sticky top-0 z-30 gap-4 relative overflow-hidden",
      isRTL && "flex-row-reverse"
    )}>
      {/* Crystal gradient border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
      <div className={cn("flex items-center gap-3 animate-fade-in min-w-0", isRTL && "flex-row-reverse")}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="shrink-0 text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className={cn("min-w-0", isRTL && "text-right")}>
          <h1 className="font-display text-lg md:text-2xl font-medium text-foreground truncate tracking-wide">
            {t('common.welcome')}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground/60 mt-0.5 md:mt-1 truncate tracking-refined">{currentDate}</p>
        </div>
      </div>

      <div className={cn("flex items-center gap-2 md:gap-3 animate-fade-in shrink-0", isRTL && "flex-row-reverse")} style={{ animationDelay: '100ms' }}>
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Search Button */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10 text-muted-foreground hover:text-foreground hover:bg-[#151921]">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] md:w-80 bg-[#0E1116] border-[rgba(217,222,231,0.12)]" align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">{t('header.searchGuests')}</h4>
              <Input 
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
                dir={isRTL ? 'rtl' : 'ltr'}
                className="bg-[#0B0D11] border-[rgba(217,222,231,0.12)] focus:border-primary/50 focus:ring-primary/20"
              />
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.map((guest) => (
                    <div 
                      key={guest.id}
                      className="p-3 rounded-lg bg-[#0B0D11] border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                        toast.info(`Selected: ${guest.name}`);
                      }}
                    >
                      <p className="text-sm font-medium text-foreground">{guest.name}</p>
                      <p className="text-xs text-muted-foreground/60">{guest.email}</p>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground/60 text-center py-4">
                  {t('header.noGuestsFound')}
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Notifications Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10 text-muted-foreground hover:text-foreground hover:bg-[#151921]">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] md:w-80 bg-[#0E1116] border-[rgba(217,222,231,0.12)]" align="end">
            <div className="space-y-3">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <h4 className="font-medium text-sm text-foreground">{t('header.notifications')}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary hover:text-primary/80"
                  onClick={markAllRead}
                >
                  {t('header.markAllRead')}
                </Button>
              </div>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "p-3 rounded-lg transition-all duration-200 cursor-pointer border",
                      notif.read 
                        ? 'bg-[#0B0D11]/50 border-transparent' 
                        : 'bg-[#0B0D11] border-primary/10 hover:border-primary/20'
                    )}
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
                        <p className="text-xs text-muted-foreground/60 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Import CSV Button */}
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 h-9 md:h-10 px-3 md:px-4 bg-transparent border-[rgba(217,222,231,0.12)] text-muted-foreground hover:text-foreground hover:bg-[#151921] hover:border-primary/30",
            isRTL && "flex-row-reverse"
          )}
          onClick={() => setImportOpen(true)}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden md:inline">{t('header.importCsv')}</span>
        </Button>

        {/* New Guest Button */}
        <Dialog open={newGuestOpen} onOpenChange={setNewGuestOpen}>
          <Button 
            className={cn(
              "gap-2 h-9 md:h-10 px-3 md:px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_0_20px_rgba(200,162,74,0.15)]",
              isRTL && "flex-row-reverse"
            )}
            onClick={() => setNewGuestOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">{t('header.newGuest')}</span>
          </Button>
          <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-lg bg-[#0E1116] border-[rgba(217,222,231,0.12)]">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">{t('header.registerNewGuest')}</DialogTitle>
              <DialogDescription className="text-muted-foreground/60">
                {t('header.addMemberDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground/60">{t('header.fullName')} *</Label>
                <Input 
                  id="name"
                  placeholder={t('header.fullName')}
                  value={newGuest.name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#0B0D11] border-[rgba(217,222,231,0.12)] focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground/60">{t('header.email')} *</Label>
                <Input 
                  id="email"
                  placeholder={t('header.email')}
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#0B0D11] border-[rgba(217,222,231,0.12)] focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground/60">{t('header.phoneOptional')}</Label>
                <Input 
                  id="phone"
                  placeholder={t('header.phone')}
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-[#0B0D11] border-[rgba(217,222,231,0.12)] focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground/60">{t('header.country')}</Label>
                <Select 
                  value={newGuest.country} 
                  onValueChange={(value: Country) => 
                    setNewGuest(prev => ({ ...prev, country: value }))
                  }
                >
                  <SelectTrigger className="bg-[#0B0D11] border-[rgba(217,222,231,0.12)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0E1116] border-[rgba(217,222,231,0.12)]">
                    <SelectItem value="doha">{t('header.qatar')}</SelectItem>
                    <SelectItem value="riyadh">{t('header.saudiArabia')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={cn("flex gap-3 pt-2", isRTL && "flex-row-reverse")}>
                <Button 
                  variant="outline" 
                  className="flex-1 bg-transparent border-[rgba(217,222,231,0.12)] hover:bg-[#151921]" 
                  onClick={() => setNewGuestOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground" 
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
