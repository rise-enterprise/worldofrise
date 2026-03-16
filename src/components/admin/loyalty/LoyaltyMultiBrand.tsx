import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Building2, Link2, Unlink, Save } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyMultiBrand() {
  const [sharedPoints, setSharedPoints] = useState(true);
  const [noirPointsPerVisit, setNoirPointsPerVisit] = useState("10");
  const [sassoPointsPerVisit, setSassoPointsPerVisit] = useState("15");

  const TIER_MAPPING = [
    { global: "Bronze", noir: "Noir Society", sasso: "Sasso Tavola" },
    { global: "Silver", noir: "Noir Reserve", sasso: "Sasso Maestro" },
    { global: "Gold", noir: "Noir Obsidian", sasso: "Sasso Imperium" },
    { global: "Platinum", noir: "Noir Elite", sasso: "Sasso Reale" },
    { global: "Black", noir: "RISE Elite", sasso: "RISE Elite" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Multi-Brand Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage loyalty logic across NOIR and SASSO brands</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground" onClick={() => toast.success("Brand settings saved")}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </div>

      {/* Points System Toggle */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sharedPoints ? <Link2 className="h-5 w-5 text-primary" /> : <Unlink className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="font-medium">Points System</p>
                <p className="text-sm text-muted-foreground">
                  {sharedPoints ? "Shared across all brands — members earn and spend freely" : "Independent per brand — separate balances"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Independent</Label>
              <Switch checked={sharedPoints} onCheckedChange={setSharedPoints} />
              <Label className="text-sm">Shared</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* NOIR */}
        <Card className="bg-card border-border/30 overflow-hidden">
          <div className="flex">
            <div className="w-1.5 bg-foreground/20 shrink-0" />
            <div className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-serif">NOIR</span>
                  <Badge variant="outline" className="text-xs ml-auto">Café & Lounge</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Points per Visit Override</Label>
                  <Input type="number" value={noirPointsPerVisit} onChange={(e) => setNoirPointsPerVisit(e.target.value)} className="bg-muted/30 border-border/40" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2.5 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Active Members</p>
                    <p className="font-bold mt-0.5">1,642</p>
                  </div>
                  <div className="p-2.5 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Visits</p>
                    <p className="font-bold mt-0.5">12,847</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* SASSO */}
        <Card className="bg-card border-border/30 overflow-hidden">
          <div className="flex">
            <div className="w-1.5 shrink-0" style={{ backgroundColor: "#D4A843" }} />
            <div className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-serif">SASSO</span>
                  <Badge variant="outline" className="text-xs ml-auto">Italian Fine Dining</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Points per Visit Override</Label>
                  <Input type="number" value={sassoPointsPerVisit} onChange={(e) => setSassoPointsPerVisit(e.target.value)} className="bg-muted/30 border-border/40" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2.5 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Active Members</p>
                    <p className="font-bold mt-0.5">789</p>
                  </div>
                  <div className="p-2.5 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Visits</p>
                    <p className="font-bold mt-0.5">5,923</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>

      {/* Tier Mapping */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest">Tier Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3 px-3">
            <span>Global Tier</span><span>NOIR Circle</span><span>SASSO Circle</span>
          </div>
          <div className="space-y-2">
            {TIER_MAPPING.map((t) => (
              <div key={t.global} className="grid grid-cols-3 gap-2 p-3 bg-muted/20 rounded-lg border border-border/20">
                <span className="font-medium text-sm">{t.global}</span>
                <span className="text-sm text-muted-foreground">{t.noir}</span>
                <span className="text-sm text-muted-foreground">{t.sasso}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
