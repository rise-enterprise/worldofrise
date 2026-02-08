import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Globe, Coins, Clock, Layers } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyGlobalSettings() {
  const [pointsPerCurrency, setPointsPerCurrency] = useState("1");
  const [currencyPerPoint, setCurrencyPerPoint] = useState("0.10");
  const [expirationDays, setExpirationDays] = useState("365");
  const [expirationEnabled, setExpirationEnabled] = useState(true);
  const [timezone, setTimezone] = useState("asia_doha");
  const [currency, setCurrency] = useState("qar");
  const [defaultLanguage, setDefaultLanguage] = useState("ar");

  const handleSave = () => {
    toast.success("Global settings saved successfully");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Global Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">System-wide loyalty program configuration</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Points Conversion */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" /> Points Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Points earned per $1 spent</Label>
              <Input type="number" value={pointsPerCurrency} onChange={(e) => setPointsPerCurrency(e.target.value)} className="bg-muted/30 border-border/40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Currency value per point ($)</Label>
              <Input type="number" step="0.01" value={currencyPerPoint} onChange={(e) => setCurrencyPerPoint(e.target.value)} className="bg-muted/30 border-border/40" />
            </div>
            <div className="p-3 bg-muted/20 rounded-lg border border-border/20">
              <p className="text-xs text-muted-foreground">Example: 1000 points = ${(1000 * parseFloat(currencyPerPoint || "0")).toFixed(2)} value</p>
            </div>
          </CardContent>
        </Card>

        {/* Expiration Policy */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Expiration Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Points Expiration</Label>
              <Switch checked={expirationEnabled} onCheckedChange={setExpirationEnabled} />
            </div>
            {expirationEnabled && (
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Days until expiry</Label>
                <Input type="number" value={expirationDays} onChange={(e) => setExpirationDays(e.target.value)} className="bg-muted/30 border-border/40" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Default Tier Thresholds */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Default Tier Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { tier: "Silver", visits: "10", points: "500" },
              { tier: "Gold", visits: "25", points: "2000" },
              { tier: "Platinum", visits: "50", points: "5000" },
              { tier: "Black", visits: "100", points: "15000" },
            ].map((t) => (
              <div key={t.tier} className="flex items-center gap-3">
                <span className="text-sm font-medium w-20">{t.tier}</span>
                <div className="flex-1">
                  <Input defaultValue={t.visits} className="bg-muted/30 border-border/40 text-sm" />
                </div>
                <span className="text-xs text-muted-foreground">visits</span>
                <div className="flex-1">
                  <Input defaultValue={t.points} className="bg-muted/30 border-border/40 text-sm" />
                </div>
                <span className="text-xs text-muted-foreground">pts</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Regional Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia_doha">Asia/Doha (GMT+3)</SelectItem>
                  <SelectItem value="asia_riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                  <SelectItem value="asia_dubai">Asia/Dubai (GMT+4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="qar">QAR (Qatari Riyal)</SelectItem>
                  <SelectItem value="sar">SAR (Saudi Riyal)</SelectItem>
                  <SelectItem value="usd">USD (US Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Default Language</Label>
              <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
