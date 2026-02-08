import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Plus, Pencil, Coins } from "lucide-react";
import { toast } from "sonner";

interface Reward {
  id: string; title: string; pointsCost: number; brand: string; validFrom: string; validTo: string; limit: number; active: boolean; type: string;
}

const MOCK_REWARDS: Reward[] = [
  { id: "1", title: "Complimentary Dessert", pointsCost: 500, brand: "both", validFrom: "2026-01-01", validTo: "2026-12-31", limit: 1, active: true, type: "free_item" },
  { id: "2", title: "20% Off Next Visit", pointsCost: 800, brand: "noir", validFrom: "2026-01-01", validTo: "2026-06-30", limit: 2, active: true, type: "discount" },
  { id: "3", title: "Private Chef's Table", pointsCost: 5000, brand: "sasso", validFrom: "2026-02-01", validTo: "2026-03-31", limit: 1, active: false, type: "exclusive" },
  { id: "4", title: "Signature Cocktail", pointsCost: 300, brand: "noir", validFrom: "2026-01-01", validTo: "2026-12-31", limit: 3, active: true, type: "free_item" },
  { id: "5", title: "VIP Lounge Access", pointsCost: 2000, brand: "both", validFrom: "2026-01-01", validTo: "2026-12-31", limit: 1, active: true, type: "exclusive" },
  { id: "6", title: "Birthday Special Menu", pointsCost: 1500, brand: "sasso", validFrom: "2026-01-01", validTo: "2026-12-31", limit: 1, active: true, type: "free_item" },
];

const TYPE_LABELS: Record<string, string> = { free_item: "Free Item", discount: "Discount", exclusive: "Exclusive Access" };
const BRAND_LABELS: Record<string, string> = { noir: "NOIR", sasso: "SASSO", both: "All Brands" };

export default function LoyaltyRewards() {
  const [rewards, setRewards] = useState(MOCK_REWARDS);
  const [createOpen, setCreateOpen] = useState(false);

  const toggleActive = (id: string) => {
    setRewards((r) => r.map((rw) => rw.id === id ? { ...rw, active: !rw.active } : rw));
    toast.success("Reward status updated");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Rewards Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage loyalty rewards</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Reward
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((r) => (
          <Card key={r.id} className={`bg-card border-border/30 transition-opacity ${!r.active ? "opacity-50" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-serif">{r.title}</CardTitle>
                <Switch checked={r.active} onCheckedChange={() => toggleActive(r.id)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-primary">{r.pointsCost.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">points</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">{TYPE_LABELS[r.type]}</Badge>
                <Badge variant="outline" className="text-xs">{BRAND_LABELS[r.brand]}</Badge>
                <Badge variant="outline" className="text-xs">Limit: {r.limit}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {r.validFrom} → {r.validTo}
              </p>
              <Button size="sm" variant="outline" className="w-full gap-1.5 mt-1">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-serif">Create Reward</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input placeholder="e.g. Free Appetizer" className="bg-muted/30 border-border/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Points Cost</Label>
                <Input type="number" placeholder="500" className="bg-muted/30 border-border/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Limit per Member</Label>
                <Input type="number" placeholder="1" className="bg-muted/30 border-border/40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                <Select defaultValue="free_item">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_item">Free Item</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="exclusive">Exclusive Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Brand Scope</Label>
                <Select defaultValue="both">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">All Brands</SelectItem>
                    <SelectItem value="noir">NOIR</SelectItem>
                    <SelectItem value="sasso">SASSO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea placeholder="Reward details..." className="bg-muted/30 border-border/40" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => { toast.success("Reward created"); setCreateOpen(false); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
