import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CrystalPageWrapper } from "@/components/effects/CrystalPageWrapper";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { toast } from "sonner";

import { NAV_SECTIONS } from "@/components/admin/adminNavConfig";

// Loyalty components
const LoyaltyMembers = lazy(() => import("@/components/admin/loyalty/LoyaltyMembers"));
const LoyaltyPointsEngine = lazy(() => import("@/components/admin/loyalty/LoyaltyPointsEngine"));
const LoyaltyRewards = lazy(() => import("@/components/admin/loyalty/LoyaltyRewards"));
const LoyaltyTiers = lazy(() => import("@/components/admin/loyalty/LoyaltyTiers"));
const LoyaltyCampaigns = lazy(() => import("@/components/admin/loyalty/LoyaltyCampaigns"));
const LoyaltySegmentation = lazy(() => import("@/components/admin/loyalty/LoyaltySegmentation"));
const LoyaltyAnalytics = lazy(() => import("@/components/admin/loyalty/LoyaltyAnalytics"));
const LoyaltyDigitalCard = lazy(() => import("@/components/admin/loyalty/LoyaltyDigitalCard"));
const LoyaltyMultiBrand = lazy(() => import("@/components/admin/loyalty/LoyaltyMultiBrand"));
const LoyaltyGlobalSettings = lazy(() => import("@/components/admin/loyalty/LoyaltyGlobalSettings"));
const AdminUsers = lazy(() => import("@/components/dashboard/AdminsView").then(m => ({ default: m.AdminsView })));
const InvitationRequestsView = lazy(() => import("@/components/admin/invitations").then(m => ({ default: m.InvitationRequestsView })));

// CRM components
const ContactsView = lazy(() => import("@/components/admin/contacts/ContactsView"));
const ContactsImportView = lazy(() => import("@/components/admin/contacts/ContactsImportView"));

const ALL_VIEWS: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  "loyalty-members": LoyaltyMembers,
  "loyalty-points": LoyaltyPointsEngine,
  "loyalty-rewards": LoyaltyRewards,
  "loyalty-tiers": LoyaltyTiers,
  "loyalty-campaigns": LoyaltyCampaigns,
  "loyalty-segmentation": LoyaltySegmentation,
  "loyalty-analytics": LoyaltyAnalytics,
  "loyalty-digital-card": LoyaltyDigitalCard,
  "loyalty-multi-brand": LoyaltyMultiBrand,
  "loyalty-settings": LoyaltyGlobalSettings,
  "admin-users": AdminUsers as any,
  "admin-invitations": InvitationRequestsView,
  "crm-contacts": ContactsView,
  "crm-import": ContactsImportView,
};

export default function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { isRTL } = useLanguage();
  const useDrawer = isMobile || isTablet;

  const [activeView, setActiveView] = useState("loyalty-members");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ loyalty: true, administration: true });

  // Handle URL params from email action links
  useEffect(() => {
    const tab = searchParams.get("tab");
    const action = searchParams.get("action");
    const name = searchParams.get("name");

    if (tab === "invitations") {
      setActiveView("admin-invitations");
      setOpenSections(prev => ({ ...prev, administration: true }));

      if (action && name) {
        if (action === "confirmed") {
          toast.success(`${name} has been approved and added as a member`);
        } else if (action === "rejected") {
          toast.success(`${name}'s request has been rejected`);
        }
        // Clear the URL params after showing the toast
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams]);

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleNavigate = useCallback((id: string) => {
    setActiveView(id);
    if (useDrawer) setDrawerOpen(false);

    // Auto-expand parent section
    const parent = NAV_SECTIONS.find((s) => s.items.some((i) => i.id === id));
    if (parent) {
      setOpenSections((prev) => ({ ...prev, [parent.id]: true }));
    }
  }, [useDrawer]);

  const sidebarContent = (
    <AdminSidebar
      activeView={activeView}
      onNavigate={handleNavigate}
      searchQuery={searchQuery}
      openSections={openSections}
      onToggleSection={toggleSection}
    />
  );

  return (
    <CrystalPageWrapper variant="ambient" showSparkles={false} className="min-h-screen">
      <div className={`flex min-h-screen ${isRTL ? "flex-row-reverse" : ""}`}>
        {/* Desktop sidebar */}
        {!useDrawer && (
          <aside className="w-72 shrink-0 border-r border-border/40 bg-card/70 backdrop-blur-sm">
            <div className="sticky top-0 h-screen">{sidebarContent}</div>
          </aside>
        )}

        {/* Mobile / Tablet drawer */}
        {useDrawer && (
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent
              side={isRTL ? "right" : "left"}
              className="w-72 p-0 bg-card/95 backdrop-blur-md border-border/40"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            onMenuToggle={() => setDrawerOpen((p) => !p)}
            showMenu={useDrawer}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="flex-1 overflow-y-auto">
            {ALL_VIEWS[activeView] ? (
              <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>}>
                {(() => { const C = ALL_VIEWS[activeView]; return <C />; })()}
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Select a section from the sidebar
              </div>
            )}
          </main>
        </div>
      </div>
    </CrystalPageWrapper>
  );
}
