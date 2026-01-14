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
    <div className="flex h-full flex-col bg-[#0E1116]">
      {/* Logo */}
      <div className="flex h-24 items-center justify-center border-b border-[rgba(217,222,231,0.08)]">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium text-primary tracking-[0.2em]">RISE</h1>
          <div className="h-px w-12 mx-auto mt-2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <p className="text-[10px] tracking-[0.4em] text-muted-foreground/60 uppercase font-body mt-2">Administration</p>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="p-5 border-b border-[rgba(217,222,231,0.08)]">
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
                  ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_20px_rgba(200,162,74,0.05)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[#151921]'
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
                  ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_20px_rgba(200,162,74,0.05)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[#151921]'
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-4 px-2 mt-8 font-body">
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
                      ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_0_0_20px_rgba(200,162,74,0.05)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#151921]'
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

      {/* User Info & Logout */}
      <div className="p-5 border-t border-[rgba(217,222,231,0.08)] space-y-4">
        {admin && (
          <div className="px-2 py-3 rounded-lg bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
            <p className="text-sm font-medium text-foreground truncate tracking-refined">{admin.name}</p>
            <p className="text-xs text-muted-foreground/60 truncate">{admin.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300',
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
        <SheetContent side={isRTL ? "right" : "left"} className="w-72 p-0 bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
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

  // Desktop: Fixed sidebar with obsidian styling
  return (
    <aside className={cn(
      "fixed top-0 z-40 h-screen w-64 bg-[#0E1116]/98 backdrop-blur-xl border-[rgba(217,222,231,0.08)]",
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
