import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Crown, Save, Star } from "lucide-react";
import { toast } from "sonner";

interface Tier {
  id: string; name: string; color: string; minVisits: number; minPoints: number; multiplier: number; benefits: string[];
}

const MOCK_TIERS: Tier[] = [
  { id: "1", name: "Bronze", color: "#92400e", minVisits: 0, minPoints: 0, multiplier: 1, benefits: ["Welcome drink", "Birthday message"] },
  { id: "2", name: "Silver", color: "#94a3b8", minVisits: 10, minPoints: 500, multiplier: 1.25, benefits: ["Priority seating", "10% off select items", "Birthday dessert"] },
  { id: "3", name: "Gold", color: "#C8A24A", minVisits: 25, minPoints: 2000, multiplier: 1.5, benefits: ["Complimentary appetizer", "Priority reservations", "Exclusive tastings"] },
  { id: "4", name: "Platinum", color: "#8b5cf6", minVisits: 50, minPoints: 5000, multiplier: 2, benefits: ["Personal concierge", "Chef's table access", "Complimentary bottle", "Private events"] },
  { id: "5", name: "Black", color: "#e2e8f0", minVisits: 100, minPoints: 15000, multiplier: 3, benefits: ["All Platinum benefits", "Global VIP recognition", "Custom experiences", "Annual gala invitation"] },
];

export default function LoyaltyTiers() {
  const [tiers, setTiers] = useState(MOCK_TIERS);

  const updateTier = (id: string, field: keyof Tier, value: string | number) => {
    setTiers((t) => t.map((tier) => tier.id === id ? { ...tier, [field]: value } : tier));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Tiers System</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure tier hierarchy, thresholds, and benefits</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground" onClick={() => toast.success("Tier settings saved")}>
          <Save className="h-4 w-4" /> Save All
        </Button>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, idx) => (
          <Card key={tier.id} className="bg-card border-border/30 overflow-hidden">
            <div className="flex">
              {/* Color bar */}
              <div className="w-1.5 shrink-0" style={{ backgroundColor: tier.color }} />
              <CardContent className="p-5 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-5 w-5" style={{ color: tier.color }} />
                  <h3 className="text-lg font-serif font-bold">{tier.name}</h3>
                  <Badge variant="outline" className="ml-auto text-xs">{tier.multiplier}x Points</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min Visits</Label>
                    <Input type="number" value={tier.minVisits} onChange={(e) => updateTier(tier.id, "minVisits", +e.target.value)} className="bg-muted/30 border-border/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min Points</Label>
                    <Input type="number" value={tier.minPoints} onChange={(e) => updateTier(tier.id, "minPoints", +e.target.value)} className="bg-muted/30 border-border/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Multiplier</Label>
                    <Input type="number" step="0.25" value={tier.multiplier} onChange={(e) => updateTier(tier.id, "multiplier", +e.target.value)} className="bg-muted/30 border-border/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Color</Label>
                    <div className="flex gap-2">
                      <Input value={tier.color} onChange={(e) => updateTier(tier.id, "color", e.target.value)} className="bg-muted/30 border-border/40" />
                      <div className="w-10 h-10 rounded-md shrink-0 border border-border/30" style={{ backgroundColor: tier.color }} />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Benefits</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.benefits.map((b, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{b}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
