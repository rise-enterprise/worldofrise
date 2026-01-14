import { cn } from '@/lib/utils';
import { Brand } from '@/types/loyalty';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Gift,
  Settings,
  Crown,
  Coffee,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Bell,
  BarChart3,
  FileEdit,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeBrand: Brand;
  setActiveBrand: (brand: Brand) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const brandFilters: { id: Brand; labelKey: string; icon: React.ElementType }[] = [
  { id: 'all', labelKey: 'brands.allBrands', icon: Crown },
  { id: 'noir', labelKey: 'brands.noir', icon: Coffee },
  { id: 'sasso', labelKey: 'brands.sasso', icon: UtensilsCrossed },
];

// Demo admin for open-access mode
const demoAdmin = {
  name: 'Administrator',
  email: 'admin@rise.com',
  role: 'super_admin' as const,
};

function SidebarContent({ 
  activeView, 
  setActiveView, 
  activeBrand, 
  setActiveBrand,
  onNavClick 
}: SidebarProps & { onNavClick?: () => void }) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const isSuperAdmin = demoAdmin.role === 'super_admin';

  const navigation = [
    { id: 'dashboard', labelKey: 'nav.overview', icon: LayoutDashboard },
    { id: 'guests', labelKey: 'nav.guests', icon: Users },
    { id: 'insights', labelKey: 'nav.aiInsights', icon: Sparkles },
    { id: 'privileges', labelKey: 'nav.privileges', icon: Gift },
    { id: 'rewards', labelKey: 'nav.rewards', icon: Gift },
    { id: 'events', labelKey: 'nav.events', icon: Calendar },
    { id: 'analytics', labelKey: 'nav.analytics', icon: BarChart3 },
    { id: 'notifications', labelKey: 'nav.notifications', icon: Bell },
    { id: 'settings', labelKey: 'nav.settings', icon: Settings },
  ];

  const superAdminNavigation = [
    { id: 'admins', labelKey: 'nav.adminUsers', icon: ShieldCheck },
    { id: 'cms', labelKey: 'nav.cms', icon: FileEdit },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    onNavClick?.();
  };

  const handleBrandClick = (id: Brand) => {
    setActiveBrand(id);
    onNavClick?.();
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-card/98 via-card/95 to-card/90 backdrop-blur-2xl relative overflow-hidden">
      {/* Crystal glass inner glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
      
      {/* Crystal vertical accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
      
      {/* Subtle sparkle particles in background */}
      <div className="absolute top-20 left-8 w-1 h-1 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 left-16 w-0.5 h-0.5 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-60 left-4 w-0.5 h-0.5 bg-primary/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Logo */}
      <div className="flex h-24 items-center justify-center border-b border-primary/15 relative">
        {/* Diamond icon glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-transparent pointer-events-none" />
        <div className="text-center relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" style={{ animationDuration: '3s' }} />
            <h1 className="font-display text-3xl font-medium text-primary tracking-[0.2em] drop-shadow-[0_0_10px_rgba(200,162,74,0.3)]">RISE</h1>
            <Sparkles className="h-4 w-4 text-primary animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
          </div>
          <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <p className="text-[10px] tracking-[0.4em] text-muted-foreground/60 uppercase font-body mt-2">Administration</p>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="p-5 border-b border-primary/15 relative">
        {/* Crystal divider glow */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-4 px-2 font-body">
          {t('brands.brandView')}
        </p>
        <div className="space-y-1">
          {brandFilters.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleBrandClick(brand.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ease-out',
                isRTL && 'flex-row-reverse',
                activeBrand === brand.id
                  ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_30px_rgba(200,162,74,0.08)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card'
              )}
            >
              <brand.icon className={cn("h-4 w-4", activeBrand === brand.id && "text-primary")} />
              <span className="font-medium tracking-refined">{t(brand.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-4 px-2 font-body">
          {t('nav.navigation')}
        </p>
        <div className="space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ease-out',
                isRTL && 'flex-row-reverse',
                activeView === item.id
                  ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_30px_rgba(200,162,74,0.08)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card'
              )}
            >
              <item.icon className={cn("h-4 w-4", activeView === item.id && "text-primary")} />
              <span className="tracking-refined">{t(item.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Super Admin Navigation */}
        {isSuperAdmin && (
          <>
            {/* Crystal divider */}
            <div className="my-6 relative">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/20 rotate-45" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-4 px-2 font-body">
              {t('nav.administration')}
            </p>
            <div className="space-y-1">
              {superAdminNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ease-out',
                    isRTL && 'flex-row-reverse',
                    activeView === item.id
                      ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_30px_rgba(200,162,74,0.08)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card'
                  )}
                >
                  <item.icon className={cn("h-4 w-4", activeView === item.id && "text-primary")} />
                  <span className="tracking-refined">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="p-5 border-t border-primary/10 space-y-4">
        <div className="px-4 py-3 rounded-lg bg-background/50 border border-primary/10">
          <p className="text-sm font-medium text-foreground truncate tracking-refined">{demoAdmin.name}</p>
          <p className="text-xs text-muted-foreground/60 truncate">{demoAdmin.email}</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ activeView, setActiveView, activeBrand, setActiveBrand, mobileOpen, onMobileClose }: SidebarProps) {
  const isMobile = useIsMobile();
  const { isRTL } = useLanguage();

  // Mobile: Sheet drawer
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side={isRTL ? "right" : "left"} className="w-72 p-0 bg-card border-primary/10">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent 
            activeView={activeView}
            setActiveView={setActiveView}
            activeBrand={activeBrand}
            setActiveBrand={setActiveBrand}
            onNavClick={onMobileClose}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar with crystal styling
  return (
    <aside className={cn(
      "fixed top-0 z-40 h-screen w-64 bg-card/98 backdrop-blur-xl border-primary/10",
      isRTL ? "right-0 border-l" : "left-0 border-r"
    )}>
      <SidebarContent 
        activeView={activeView}
        setActiveView={setActiveView}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
      />
    </aside>
  );
}
