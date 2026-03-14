import { useState, lazy, Suspense } from "react";
import {
  LayoutDashboard,
  Map,
  Users,
  MessageSquare,
  BarChart3,
  Gift,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Brain,
  Settings,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAIPersonality } from "@/contexts/AIPersonalityContext";
import riseLogo from "@/assets/rise-holding-logo.png";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardOverview = lazy(() => import("./views/DashboardOverview"));
const MapView = lazy(() => import("./views/MapView"));
const AIChat = lazy(() => import("./views/AIChatView"));
const MembersView = lazy(() => import("./views/MembersView"));
const AnalyticsView = lazy(() => import("./views/AnalyticsView"));
const RewardsView = lazy(() => import("./views/RewardsView"));

type ViewId = "overview" | "map" | "ai" | "members" | "analytics" | "rewards";

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "map", label: "Locations", icon: Map },
  { id: "ai", label: "RISE AI", icon: Brain },
  { id: "members", label: "Members", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "rewards", label: "Rewards", icon: Gift },
];

function LoadingView() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function AdminDashboardLayout() {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-full flex flex-col shrink-0 transition-all duration-300 ease-out border-r border-border/30",
          collapsed ? "w-[60px]" : "w-56"
        )}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 h-14 shrink-0 border-b border-border/20",
          collapsed && "justify-center px-0"
        )}>
          <img src={riseLogo} alt="RISE" className="h-7 w-auto" />
          {!collapsed && (
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-foreground">
              RISE ONE
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-border/20 space-y-1">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
            {!collapsed && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Theme</span>}
            <ThemeToggle className="h-8 w-8" />
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto">
        <Suspense fallback={<LoadingView />}>
          {activeView === "overview" && <DashboardOverview onNavigate={(v) => setActiveView(v as ViewId)} />}
          {activeView === "map" && <MapView />}
          {activeView === "ai" && <AIChat />}
          {activeView === "members" && <MembersView />}
          {activeView === "analytics" && <AnalyticsView />}
          {activeView === "rewards" && <RewardsView />}
        </Suspense>
      </main>
    </div>
  );
}
