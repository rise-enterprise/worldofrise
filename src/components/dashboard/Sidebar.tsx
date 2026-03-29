import { cn } from "@/lib/utils";
import { Brand } from "@/types/loyalty";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  LayoutDashboard, Users, Calendar, Gift, Settings,
  BrainCircuit, Coffee, UtensilsCrossed, Sparkles, ShieldCheck,
  Bell, BarChart3, FileEdit, ChevronLeft, ChevronRight, Crown,
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

const brandFilters: { id: Brand; label: string }[] = [
  { id: "all", label: "All" },
  { id: "noir", label: "NOIR" },
  { id: "sasso", label: "SASSO" },
];

const navigation = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "guests", label: "Members", icon: Users },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "privileges", label: "Privileges", icon: Gift },
  { id: "rewards", label: "Benefits", icon: Gift },
  { id: "events", label: "Experiences", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const adminNavigation = [
  { id: "admins", label: "Team", icon: ShieldCheck },
  { id: "cms", label: "Content", icon: FileEdit },
];

function SidebarContent({
  activeView, setActiveView, activeBrand, setActiveBrand, onNavClick, collapsed,
}: SidebarProps & { onNavClick?: () => void; collapsed?: boolean }) {
  const navigate = useNavigate();

  const handleNav = (id: string) => { setActiveView(id); onNavClick?.(); };

  const NavButton = ({ id, label, icon: Icon, isActive }: { id: string; label: string; icon: React.ElementType; isActive: boolean }) => (
    <button
      onClick={() => handleNav(id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
        collapsed && "justify-center px-0",
        isActive
          ? "text-foreground font-medium bg-secondary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-foreground")} />
      {!collapsed && <span className="font-body">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-background border-r border-border">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 h-14 shrink-0 border-b border-border",
        collapsed ? "justify-center px-0" : "px-5"
      )}>
        {!collapsed && (
          <span className="text-xs font-display tracking-[0.25em] uppercase text-foreground">
            RISE
          </span>
        )}
        {collapsed && <span className="text-xs font-display tracking-[0.2em] text-foreground">R</span>}
      </div>

      {/* Brand Filter */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-border">
          <div className="flex gap-1">
            {brandFilters.map((b) => (
              <button
                key={b.id}
                onClick={() => { setActiveBrand(b.id); onNavClick?.(); }}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-[11px] font-body transition-all duration-200",
                  activeBrand === b.id
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {b.label}
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

        <div className="my-3 mx-2 h-px bg-border" />
        <p className={cn("text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2", collapsed ? "text-center" : "px-3")}>Admin</p>
        {adminNavigation.map((item) => (
          <NavButton key={item.id} {...item} isActive={activeView === item.id} />
        ))}

        <button
          onClick={() => navigate("/admin")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 mt-2",
            collapsed && "justify-center px-0",
            "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
          title={collapsed ? "RISE AI" : undefined}
        >
          <BrainCircuit className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="font-body">RISE AI</span>}
        </button>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
          {!collapsed && <span className="text-[10px] text-muted-foreground">Theme</span>}
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
        <SheetContent side={isRTL ? "right" : "left"} className={cn(isTablet ? "w-72" : "w-64", "p-0 bg-background border-border")}>
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <SidebarContent {...props} onNavClick={props.onMobileClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={cn(
      "fixed top-0 z-40 h-screen shrink-0 transition-all duration-300",
      collapsed ? "w-[60px]" : "w-56",
      isRTL ? "right-0" : "left-0"
    )}>
      <SidebarContent {...props} collapsed={collapsed} />
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-14 -right-3 z-50 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}