import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AdminActivityLogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLACEHOLDER_LOGS = [
  { id: 1, user: "Sarah Al-Rashid", action: "Updated Venue Settings", time: "2 minutes ago", type: "update" },
  { id: 2, user: "Ahmed Khan", action: "Created new Shift: Friday Brunch", time: "15 minutes ago", type: "create" },
  { id: 3, user: "Maria Santos", action: "Modified Reservation Widget colors", time: "1 hour ago", type: "update" },
  { id: 4, user: "Sarah Al-Rashid", action: "Published all changes", time: "2 hours ago", type: "publish" },
  { id: 5, user: "Ahmed Khan", action: "Added Blackout Date: Feb 14", time: "3 hours ago", type: "create" },
  { id: 6, user: "Maria Santos", action: "Deleted unused Client Tag", time: "5 hours ago", type: "delete" },
  { id: 7, user: "Sarah Al-Rashid", action: "Updated Email Templates", time: "Yesterday", type: "update" },
  { id: 8, user: "Ahmed Khan", action: "Changed Access Rules for Dinner", time: "Yesterday", type: "update" },
];

const typeBadge: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  update: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  delete: "bg-red-500/10 text-red-500 border-red-500/20",
  publish: "bg-primary/10 text-primary border-primary/20",
};

export default function AdminActivityLog({ open, onOpenChange }: AdminActivityLogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border/60">
        <SheetHeader>
          <SheetTitle className="font-serif">Activity Log</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] mt-4 pr-2">
          <div className="space-y-3">
            {PLACEHOLDER_LOGS.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{log.user}</span>
                  <Badge variant="outline" className={`text-[10px] ${typeBadge[log.type] || ""}`}>
                    {log.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{log.action}</p>
                <p className="text-xs text-muted-foreground/60">{log.time}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
