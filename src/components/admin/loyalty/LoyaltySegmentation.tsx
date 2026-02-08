import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, Save, Users, Target, X } from "lucide-react";
import { toast } from "sonner";

interface FilterChip {
  id: string; field: string; value: string;
}

interface Segment {
  id: string; name: string; filters: FilterChip[]; count: number;
}

const SAVED_SEGMENTS: Segment[] = [
  { id: "1", name: "High-Value VIPs", filters: [{ id: "1", field: "Tier", value: "Platinum+" }, { id: "2", field: "Visits", value: ">50" }], count: 124 },
  { id: "2", name: "Inactive 30 Days", filters: [{ id: "3", field: "Last Visit", value: ">30 days" }], count: 342 },
  { id: "3", name: "Doha Gold Members", filters: [{ id: "4", field: "City", value: "Doha" }, { id: "5", field: "Tier", value: "Gold" }], count: 89 },
];

export default function LoyaltySegmentation() {
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [filterField, setFilterField] = useState("tier");
  const [filterValue, setFilterValue] = useState("");
  const [segmentName, setSegmentName] = useState("");
  const [previewCount] = useState(0);

  const addFilter = () => {
    if (!filterValue) return;
    setFilters((f) => [...f, { id: Date.now().toString(), field: filterField, value: filterValue }]);
    setFilterValue("");
  };

  const removeFilter = (id: string) => {
    setFilters((f) => f.filter((c) => c.id !== id));
  };

  const saveSegment = () => {
    if (!segmentName) { toast.error("Enter a segment name"); return; }
    toast.success(`Segment "${segmentName}" saved`);
    setSegmentName("");
    setFilters([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">Customer Segmentation</h1>
        <p className="text-sm text-muted-foreground mt-1">Build targeted segments for campaigns and analytics</p>
      </div>

      {/* Segment Builder */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" /> Segment Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tier">Tier</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="last_visit">Last Visit</SelectItem>
                <SelectItem value="visit_count">Visit Count</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Value (e.g. Gold, >30 days, >50)"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="flex-1 min-w-[200px] bg-muted/30 border-border/40"
            />
            <Button variant="outline" onClick={addFilter}>Add Filter</Button>
          </div>

          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <Badge key={f.id} variant="outline" className="gap-1.5 py-1 px-2.5">
                  <span className="text-primary font-medium">{f.field}:</span> {f.value}
                  <button onClick={() => removeFilter(f.id)}><X className="h-3 w-3 text-muted-foreground hover:text-foreground" /></button>
                </Badge>
              ))}
            </div>
          )}

          {/* Preview + Save */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/20">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Matching members:</span>
              <span className="font-bold text-primary">{filters.length > 0 ? "~247" : "0"}</span>
            </div>
            <div className="flex-1" />
            <Input
              placeholder="Segment name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              className="w-48 bg-muted/30 border-border/40"
            />
            <Button className="gap-2 bg-primary text-primary-foreground" onClick={saveSegment}>
              <Save className="h-4 w-4" /> Save Segment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Segments */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest">Saved Segments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SAVED_SEGMENTS.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/20">
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {s.filters.map((f) => (
                    <Badge key={f.id} variant="outline" className="text-xs">
                      {f.field}: {f.value}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-xs text-muted-foreground">members</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Target
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
