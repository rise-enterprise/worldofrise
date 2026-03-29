import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Search, Plus, Upload, Menu, X } from 'lucide-react';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Country } from '@/types/loyalty';
import { useCreateMember } from '@/hooks/useMembers';
import { DataImport } from './DataImport';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const showMenuButton = isMobile || isTablet;
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [newGuestOpen, setNewGuestOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const createMember = useCreateMember();

  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', country: 'doha' as Country });

  const currentDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: isMobile ? 'short' : 'long',
    year: 'numeric',
    month: isMobile ? 'short' : 'long',
    day: 'numeric',
  });

  const handleNewGuest = async () => {
    if (!newGuest.name.trim()) { toast.error(t('notifications.pleaseEnterName')); return; }
    if (!newGuest.email.trim() || !newGuest.email.includes('@')) { toast.error(t('notifications.pleaseEnterEmail')); return; }
    try {
      await createMember.mutateAsync({
        full_name: newGuest.name, email: newGuest.email, phone: newGuest.phone || '', city: newGuest.country,
      });
      toast.success(`${newGuest.name} registered successfully`);
      setNewGuestOpen(false);
      setNewGuest({ name: '', email: '', phone: '', country: 'doha' });
    } catch {
      toast.error('Registration failed');
    }
  };

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border/10 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h2 className="text-sm font-medium text-foreground tracking-wide">{t('common.welcome')}</h2>
          <p className="text-[10px] text-muted-foreground/50">{currentDate}</p>
        </div>
      </div>

      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
        <LanguageSwitcher />

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
        >
          {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>

        <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setImportOpen(true)}
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Import</span>
        </Button>

        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs bg-primary/90 hover:bg-primary text-primary-foreground"
          onClick={() => setNewGuestOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Add Member</span>
        </Button>
      </div>

      {/* New Guest Dialog */}
      <Dialog open={newGuestOpen} onOpenChange={setNewGuestOpen}>
        <DialogContent className="max-w-md border-border/20 bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t('header.registerNewGuest')}</DialogTitle>
            <DialogDescription className="text-muted-foreground/60">{t('header.addMemberDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/60">Full Name *</Label>
              <Input placeholder="Full name" value={newGuest.name} onChange={(e) => setNewGuest(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/60">Email *</Label>
              <Input placeholder="Email" type="email" value={newGuest.email} onChange={(e) => setNewGuest(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/60">Phone</Label>
              <Input placeholder="Phone" type="tel" value={newGuest.phone} onChange={(e) => setNewGuest(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground/60">Region</Label>
              <Select value={newGuest.country} onValueChange={(v: Country) => setNewGuest(p => ({ ...p, country: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="doha">Qatar</SelectItem>
                  <SelectItem value="riyadh">Saudi Arabia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setNewGuestOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleNewGuest} disabled={createMember.isPending}>
                {createMember.isPending ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DataImport open={importOpen} onOpenChange={setImportOpen} />
    </header>
  );
}
