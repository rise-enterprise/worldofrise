import { useState, useMemo, useCallback } from "react";
import { Search, Download, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CONTACT_COLUMNS } from "./contactColumns";
import { exportToCSV } from "./contactUtils";
import { useContacts, useContactsCount } from "@/hooks/useContacts";
import ContactDetailsDrawer from "./ContactDetailsDrawer";
import { format } from "date-fns";

export default function ContactsView() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedContact, setSelectedContact] = useState<Record<string, unknown> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: contacts = [], isLoading } = useContacts(search, filters);
  const { data: totalCount = 0 } = useContactsCount();

  const sorted = useMemo(() => {
    if (!sortField) return contacts;
    return [...contacts].sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [contacts, sortField, sortDir]);

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }, [sortField]);

  const handleExport = useCallback(() => {
    const csv = exportToCSV(sorted, CONTACT_COLUMNS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const formatCell = (col: (typeof CONTACT_COLUMNS)[0], val: unknown) => {
    if (val === null || val === undefined || val === "") return "—";
    if (col.type === "boolean") return val ? <Badge variant="default" className="bg-emerald-600 text-xs">Yes</Badge> : <span className="text-muted-foreground text-xs">No</span>;
    if (col.type === "date") {
      try { return format(new Date(String(val)), "MMM d, yyyy"); } catch { return String(val); }
    }
    if (col.type === "datetime") {
      try { return format(new Date(String(val)), "MMM d, yyyy"); } catch { return String(val); }
    }
    if (col.type === "number") {
      const n = Number(val);
      if (!isNaN(n)) return n.toLocaleString();
    }
    const s = String(val);
    return s.length > 30 ? s.slice(0, 30) + "…" : s;
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== "").length;

  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Contacts Database</h2>
          <p className="text-sm text-muted-foreground">{totalCount.toLocaleString()} total contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilterCount}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Filters</h4>
                <div>
                  <label className="text-xs text-muted-foreground">VIP</label>
                  <Select value={String(filters.vip ?? "")} onValueChange={(v) => setFilters((p) => ({ ...p, vip: v || undefined }))}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_values">All</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {["loyalty_tier", "loyalty_rank", "city", "country", "last_location"].map((field) => (
                  <div key={field}>
                    <label className="text-xs text-muted-foreground capitalize">{field.replace(/_/g, " ")}</label>
                    <Input
                      className="h-8"
                      placeholder={`Filter ${field.replace(/_/g, " ")}...`}
                      value={String(filters[field] ?? "")}
                      onChange={(e) => setFilters((p) => ({ ...p, [field]: e.target.value || undefined }))}
                    />
                  </div>
                ))}
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setFilters({})}>
                    <X className="h-3 w-3 mr-1" /> Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={sorted.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, email, loyalty ID, company..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Active filters pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(filters).map(([k, v]) =>
            v !== undefined && v !== "" ? (
              <Badge key={k} variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => clearFilter(k)}>
                {k.replace(/_/g, " ")}: {String(v)}
                <X className="h-3 w-3" />
              </Badge>
            ) : null
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-border/40 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                {CONTACT_COLUMNS.map((col) => (
                  <TableHead
                    key={col.dbField}
                    style={{ minWidth: col.width, whiteSpace: "nowrap" }}
                    className="cursor-pointer hover:text-foreground select-none text-xs"
                    onClick={() => handleSort(col.dbField)}
                  >
                    {col.header}
                    {sortField === col.dbField && (sortDir === "asc" ? " ↑" : " ↓")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={CONTACT_COLUMNS.length} className="text-center py-12 text-muted-foreground">
                    Loading contacts...
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={CONTACT_COLUMNS.length} className="text-center py-12 text-muted-foreground">
                    No contacts found. Import a database to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((contact) => (
                  <TableRow
                    key={contact.id as string}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedContact(contact)}
                  >
                    {CONTACT_COLUMNS.map((col) => (
                      <TableCell key={col.dbField} className="text-xs whitespace-nowrap" style={{ minWidth: col.width }}>
                        {formatCell(col, contact[col.dbField])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Showing {sorted.length} of {totalCount.toLocaleString()} contacts</p>

      <ContactDetailsDrawer
        contact={selectedContact}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </div>
  );
}
