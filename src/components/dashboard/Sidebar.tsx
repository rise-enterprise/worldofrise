import { cn } from '@/lib/utils';
import { Brand } from '@/types/loyalty';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
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
  LogOut,
  Bell,
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

function SidebarContent({ 
  activeView, 
  setActiveView, 
  activeBrand, 
  setActiveBrand,
  onNavClick 
}: SidebarProps & { onNavClick?: () => void }) {
  const { admin, signOut } = useAdminAuthContext();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const isSuperAdmin = admin?.role === 'super_admin';

  const navigation = [
    { id: 'dashboard', labelKey: 'nav.overview', icon: LayoutDashboard },
    { id: 'guests', labelKey: 'nav.guests', icon: Users },
    { id: 'insights', labelKey: 'nav.aiInsights', icon: Sparkles },
    { id: 'privileges', labelKey: 'nav.privileges', icon: Gift },
    { id: 'events', labelKey: 'nav.events', icon: Calendar },
    { id: 'notifications', labelKey: 'nav.notifications', icon: Bell },
    { id: 'settings', labelKey: 'nav.settings', icon: Settings },
  ];

  const superAdminNavigation = [
    { id: 'admins', labelKey: 'nav.adminUsers', icon: ShieldCheck },
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
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-24 items-center justify-center border-b border-sidebar-border">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium text-foreground tracking-wide">RISE</h1>
          <p className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase font-body mt-1">Admin</p>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="p-5 border-b border-sidebar-border">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 px-2 font-body">
          {t('brands.brandView')}
        </p>
        <div className="space-y-1">
          {brandFilters.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleBrandClick(brand.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-500 ease-crystal',
                isRTL && 'flex-row-reverse',
                activeBrand === brand.id
                  ? 'glass-panel border-primary/30 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <brand.icon className="h-4 w-4" />
              <span className="font-medium tracking-refined">{t(brand.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 px-2 font-body">
          {t('nav.navigation')}
        </p>
        <div className="space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-500 ease-crystal',
                isRTL && 'flex-row-reverse',
                activeView === item.id
                  ? 'glass-panel text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="tracking-refined">{t(item.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Super Admin Navigation */}
        {isSuperAdmin && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 px-2 mt-8 font-body">
              {t('nav.administration')}
            </p>
            <div className="space-y-1">
              {superAdminNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-500 ease-crystal',
                    isRTL && 'flex-row-reverse',
                    activeView === item.id
                      ? 'glass-panel text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="tracking-refined">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="p-5 border-t border-sidebar-border space-y-4">
        {admin && (
          <div className="px-2">
            <p className="text-sm font-medium text-foreground truncate tracking-refined">{admin.name}</p>
            <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-500',
            isRTL && 'flex-row-reverse'
          )}
        >
          <LogOut className="h-4 w-4" />
          <span className="tracking-refined">{t('common.signOut')}</span>
        </button>
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
        <SheetContent side={isRTL ? "right" : "left"} className="w-72 p-0 bg-sidebar border-sidebar-border">
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

  // Desktop: Fixed sidebar with glass effect
  return (
    <aside className={cn(
      "fixed top-0 z-40 h-screen w-64 bg-sidebar/95 backdrop-blur-xl border-sidebar-border",
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
