import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "./adminNavConfig";

interface AdminSidebarProps {
  activeView: string;
  onNavigate: (id: string) => void;
  searchQuery: string;
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
}

export default function AdminSidebar({
  activeView,
  onNavigate,
  searchQuery,
  openSections,
  onToggleSection,
}: AdminSidebarProps) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return NAV_SECTIONS;
    const q = searchQuery.toLowerCase();
    return NAV_SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter(
        (i) => i.label.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
      ),
    })).filter((s) => s.items.length > 0);
  }, [searchQuery]);

  return (
    <ScrollArea className="h-full">
      <div className="py-4 px-3 space-y-1">
        {/* Logo / Brand */}
        <div className="px-3 pb-4 mb-2 border-b border-border/30">
          <span className="text-lg font-serif font-bold tracking-widest text-primary">RISE</span>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">AI Panel</p>
        </div>

        {filtered.map((section) => {
          const Icon = section.icon;
          const isOpen = openSections[section.id] ?? false;
          const hasActive = section.items.some((i) => i.id === activeView);

          return (
            <Collapsible
              key={section.id}
              open={isOpen || (searchQuery.length > 0)}
              onOpenChange={() => onToggleSection(section.id)}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                    (isOpen || searchQuery.length > 0) && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-1 data-[state=open]:slide-down-1 duration-200">
                <div className="ml-4 border-l border-border/30 pl-3 py-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = item.id === activeView;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "block w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[13px] pl-[23px]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </ScrollArea>
  );
}
