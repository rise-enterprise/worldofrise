import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Eye } from "lucide-react";

interface AdminPlaceholderProps {
  sectionLabel: string;
  groupLabel: string;
  description: string;
}

export default function AdminPlaceholder({ sectionLabel, groupLabel, description }: AdminPlaceholderProps) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <p className="text-sm text-muted-foreground mb-2 tracking-wide uppercase">
        {groupLabel}
      </p>

      <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">
        {sectionLabel}
      </h1>

      <Badge variant="outline" className="border-primary/30 text-primary mb-8 text-xs tracking-widest uppercase">
        Coming Soon
      </Badge>

      {/* Main card */}
      <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-8 space-y-6 shadow-lg">
        <p className="text-muted-foreground leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" disabled className="gap-2 opacity-60">
            <Eye className="h-4 w-4" />
            Live Preview
          </Button>
          <Button variant="outline" size="sm" disabled className="gap-2 opacity-60">
            <History className="h-4 w-4" />
            Restore Previous Version
          </Button>
        </div>
      </div>

      {/* Feature hints */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Add / Edit / Delete", desc: "Full CRUD controls" },
          { title: "Drag & Drop", desc: "Reorder items visually" },
          { title: "Multi-language", desc: "Arabic & English editing" },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-border/40 bg-card/50 p-4 text-center">
            <p className="text-sm font-medium text-foreground">{f.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
