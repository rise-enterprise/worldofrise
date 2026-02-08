import { useState, useCallback, useMemo } from "react";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CrystalPageWrapper } from "@/components/effects/CrystalPageWrapper";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminPlaceholder from "@/components/admin/AdminPlaceholder";
import { NAV_SECTIONS } from "@/components/admin/adminNavConfig";

export default function AdminPanel() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { isRTL } = useLanguage();
  const useDrawer = isMobile || isTablet;

  const [activeView, setActiveView] = useState("floorplan-layouts");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ floorplan: true });

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

  // Resolve active item info
  const activeInfo = useMemo(() => {
    for (const section of NAV_SECTIONS) {
      const item = section.items.find((i) => i.id === activeView);
      if (item) return { item, section };
    }
    return null;
  }, [activeView]);

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
            {activeInfo ? (
              <AdminPlaceholder
                sectionLabel={activeInfo.item.label}
                groupLabel={activeInfo.section.label}
                description={activeInfo.item.description}
              />
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
