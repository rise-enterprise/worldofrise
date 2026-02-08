import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coins, Zap, Clock, ShieldAlert, Save } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyPointsEngine() {
  const [pointsPerVisit, setPointsPerVisit] = useState("10");
  const [pointsPerCurrency, setPointsPerCurrency] = useState("1");
  const [doublePointsDays, setDoublePointsDays] = useState(true);
  const [happyHourMultiplier, setHappyHourMultiplier] = useState("2");
  const [expirationEnabled, setExpirationEnabled] = useState(true);
  const [expirationDays, setExpirationDays] = useState("365");

  const mockAdjustments = [
    { id: "1", member: "Khalid Al-Rashid", delta: "+500", reason: "Manual bonus", admin: "Admin", date: "2026-02-05" },
    { id: "2", member: "Sara Al-Thani", delta: "-200", reason: "Correction", admin: "Admin", date: "2026-02-04" },
    { id: "3", member: "Fatima Al-Sayed", delta: "+1000", reason: "VIP bonus", admin: "Super Admin", date: "2026-02-03" },
  ];

  const fraudAlerts = [
    { id: "1", type: "Rapid Redemption", member: "Unknown #4421", detail: "5 redemptions in 10 minutes", severity: "high" },
    { id: "2", type: "Unusual Points Spike", member: "Omar Hassan", detail: "+5000 points in single day", severity: "medium" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">Points Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure earning rules, bonuses, and expiration policies</p>
      </div>

      {/* Earning Rules */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" /> Earning Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Points per Visit</Label>
              <Input type="number" value={pointsPerVisit} onChange={(e) => setPointsPerVisit(e.target.value)} className="bg-muted/30 border-border/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Points per $1 Spent</Label>
              <Input type="number" value={pointsPerCurrency} onChange={(e) => setPointsPerCurrency(e.target.value)} className="bg-muted/30 border-border/40" />
            </div>
            <Button onClick={() => toast.success("Earning rules saved")} className="w-full gap-2 bg-primary text-primary-foreground">
              <Save className="h-4 w-4" /> Save Rules
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Bonus Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Double Points Days</p>
                <p className="text-xs text-muted-foreground">Every Tuesday & Thursday</p>
              </div>
              <Switch checked={doublePointsDays} onCheckedChange={setDoublePointsDays} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Happy Hour Multiplier</Label>
              <Input type="number" value={happyHourMultiplier} onChange={(e) => setHappyHourMultiplier(e.target.value)} className="bg-muted/30 border-border/40" />
              <p className="text-xs text-muted-foreground">Applied 4:00 PM – 7:00 PM daily</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiration */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Points Expiration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <Switch checked={expirationEnabled} onCheckedChange={setExpirationEnabled} />
              <Label>Enable Expiration</Label>
            </div>
            {expirationEnabled && (
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Expire after</Label>
                <Input type="number" value={expirationDays} onChange={(e) => setExpirationDays(e.target.value)} className="w-24 bg-muted/30 border-border/40" />
                <Label className="text-sm text-muted-foreground">days</Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Adjustments Log */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest">Manual Adjustments Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Member</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Delta</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Reason</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Admin</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdjustments.map((a) => (
                <TableRow key={a.id} className="border-border/20">
                  <TableCell className="font-medium">{a.member}</TableCell>
                  <TableCell className={a.delta.startsWith("+") ? "text-green-400 font-mono" : "text-red-400 font-mono"}>{a.delta}</TableCell>
                  <TableCell className="text-muted-foreground">{a.reason}</TableCell>
                  <TableCell className="text-muted-foreground">{a.admin}</TableCell>
                  <TableCell className="text-muted-foreground">{a.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fraud Detection */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" /> Fraud Detection Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fraudAlerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border border-border/20">
              <Badge variant={a.severity === "high" ? "destructive" : "outline"} className="text-xs mt-0.5">{a.severity}</Badge>
              <div>
                <p className="text-sm font-medium">{a.type}</p>
                <p className="text-xs text-muted-foreground">{a.member} — {a.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
