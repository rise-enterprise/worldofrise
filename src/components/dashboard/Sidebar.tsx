import { cn } from "@/lib/utils";
import { Brand } from "@/types/loyalty";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  LayoutDashboard, Users, Calendar, Gift, Settings, Crown,
  BrainCircuit, Coffee, UtensilsCrossed, Sparkles, ShieldCheck,
  Bell, BarChart3, FileEdit, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeBrand: Brand;
  setActiveBrand: (brand: Brand) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const brandFilters: { id: Brand; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Brands", icon: Crown },
  { id: "noir", label: "NOIR", icon: Coffee },
  { id: "sasso", label: "SASSO", icon: UtensilsCrossed },
];

const navigation = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "guests", label: "Members", icon: Users },
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "privileges", label: "Privileges", icon: Gift },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "events", label: "Events", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const adminNavigation = [
  { id: "admins", label: "Admin Users", icon: ShieldCheck },
  { id: "cms", label: "Content", icon: FileEdit },
];

function SidebarContent({
  activeView, setActiveView, activeBrand, setActiveBrand, onNavClick, collapsed,
}: SidebarProps & { onNavClick?: () => void; collapsed?: boolean }) {
  const navigate = useNavigate();

  const handleNav = (id: string) => { setActiveView(id); onNavClick?.(); };
  const handleBrand = (id: Brand) => { setActiveBrand(id); onNavClick?.(); };

  const NavButton = ({ id, label, icon: Icon, isActive }: { id: string; label: string; icon: React.ElementType; isActive: boolean }) => (
    <button
      onClick={() => handleNav(id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
        collapsed && "justify-center px-0",
        isActive
          ? "text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
      )}
      style={isActive ? { background: 'hsl(var(--primary) / 0.08)' } : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div className="flex h-full flex-col" style={{ background: "hsl(var(--sidebar-background, var(--card)))" }}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 h-14 shrink-0 border-b border-border/10",
        collapsed ? "justify-center px-0" : "px-5"
      )}>
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-foreground/80">
            RISE Command
          </span>
        )}
      </div>

      {/* Brand Filter */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-border/10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 px-2">Brand</p>
          <div className="flex gap-1">
            {brandFilters.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBrand(b.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] transition-all duration-200",
                  activeBrand === b.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                )}
              >
                <b.icon className="w-3 h-3" />
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavButton key={item.id} {...item} isActive={activeView === item.id} />
        ))}

        {/* Admin Section */}
        <div className="my-3 mx-2 h-px bg-border/10" />
        <p className={cn("text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-2", collapsed ? "text-center" : "px-3")}>Admin</p>
        {adminNavigation.map((item) => (
          <NavButton key={item.id} {...item} isActive={activeView === item.id} />
        ))}

        {/* AI Panel Link */}
        <button
          onClick={() => navigate("/admin")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mt-2",
            collapsed && "justify-center px-0",
            "text-neon-purple/70 hover:text-neon-purple hover:bg-neon-purple/5 border border-neon-purple/10 hover:border-neon-purple/20"
          )}
          title={collapsed ? "RISE AI" : undefined}
        >
          <BrainCircuit className="w-4 h-4 shrink-0" />
          {!collapsed && <span>RISE AI</span>}
          {!collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />}
        </button>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border/10 space-y-1">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
          {!collapsed && <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">Theme</span>}
          <ThemeToggle className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { isRTL } = useLanguage();
  const useDrawer = isMobile || isTablet;
  const [collapsed, setCollapsed] = useState(false);

  if (useDrawer) {
    return (
      <Sheet open={props.mobileOpen} onOpenChange={(open) => !open && props.onMobileClose?.()}>
        <SheetContent
          side={isRTL ? "right" : "left"}
          className={cn(isTablet ? "w-72" : "w-64", "p-0 bg-card border-border/10")}
        >
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <SidebarContent {...props} onNavClick={props.onMobileClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "fixed top-0 z-40 h-screen shrink-0 transition-all duration-300 ease-out border-border/15",
        collapsed ? "w-[64px]" : "w-64",
        isRTL ? "right-0 border-l" : "left-0 border-r"
      )}
    >
      <SidebarContent {...props} collapsed={collapsed} />
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-14 -right-3 z-50 w-6 h-6 rounded-full bg-card border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
