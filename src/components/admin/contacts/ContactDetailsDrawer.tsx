import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CONTACT_COLUMNS } from "./contactColumns";
import { format } from "date-fns";

interface ContactDetailsDrawerProps {
  contact: Record<string, unknown> | null;
  open: boolean;
  onClose: () => void;
}

export default function ContactDetailsDrawer({ contact, open, onClose }: ContactDetailsDrawerProps) {
  if (!contact) return null;

  const formatValue = (dbField: string, type: string, val: unknown): string => {
    if (val === null || val === undefined || val === "") return "—";
    if (type === "boolean") return val ? "Yes" : "No";
    if (type === "date" && val) {
      try { return format(new Date(String(val)), "MMM d, yyyy"); } catch { return String(val); }
    }
    if (type === "datetime" && val) {
      try { return format(new Date(String(val)), "MMM d, yyyy h:mm a"); } catch { return String(val); }
    }
    if (type === "number") {
      const n = Number(val);
      if (!isNaN(n)) return n.toLocaleString();
    }
    return String(val);
  };

  const fullName = [contact.salutation, contact.first_name, contact.last_name].filter(Boolean).join(" ");

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {fullName || "Contact Details"}
            {contact.vip && <Badge variant="default" className="bg-amber-500 text-white">VIP</Badge>}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {CONTACT_COLUMNS.map((col) => {
            const val = contact[col.dbField];
            const display = formatValue(col.dbField, col.type, val);
            return (
              <div key={col.dbField} className="flex justify-between items-start gap-4 py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground font-medium shrink-0 capitalize">{col.header}</span>
                <span className="text-sm text-foreground text-right break-all">{display}</span>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
