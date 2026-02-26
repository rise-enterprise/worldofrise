import { useState } from "react";
import { Menu, Search, Rocket, ScrollText, X, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import AdminActivityLog from "./AdminActivityLog";
import { toast } from "@/hooks/use-toast";

interface AdminHeaderProps {
  onMenuToggle: () => void;
  showMenu: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function AdminHeader({ onMenuToggle, showMenu, searchQuery, onSearchChange }: AdminHeaderProps) {
  const [activityOpen, setActivityOpen] = useState(false);

  const handlePublish = () => {
    toast({ title: "Published", description: "All changes have been published successfully." });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-card/90 backdrop-blur-md px-4 h-14">
        {showMenu && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <h1 className="text-base font-serif font-semibold text-foreground whitespace-nowrap hidden sm:block flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          RISE AI Panel
        </h1>

        {/* Search */}
        <div className="relative flex-1 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search settings…"
            className="pl-9 pr-8 h-9 bg-muted/40 border-border/40 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setActivityOpen(true)}>
            <ScrollText className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <LanguageSwitcher />
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 hidden sm:flex"
            onClick={handlePublish}
          >
            <Rocket className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </header>

      <AdminActivityLog open={activityOpen} onOpenChange={setActivityOpen} />
    </>
  );
}
