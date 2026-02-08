import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Megaphone, Plus, Users, Zap, Mail, MessageSquare, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string; name: string; status: "draft" | "active" | "completed" | "paused"; channel: string; reach: number; startDate: string; endDate: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "1", name: "Ramadan Special", status: "active", channel: "SMS + Email", reach: 1240, startDate: "2026-03-01", endDate: "2026-03-30" },
  { id: "2", name: "Summer Double Points", status: "draft", channel: "WhatsApp", reach: 0, startDate: "2026-06-01", endDate: "2026-08-31" },
  { id: "3", name: "New Year Welcome", status: "completed", channel: "Email", reach: 890, startDate: "2025-12-20", endDate: "2026-01-15" },
  { id: "4", name: "VIP Reactivation", status: "active", channel: "SMS", reach: 156, startDate: "2026-01-15", endDate: "2026-04-15" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-primary/20 text-primary border-primary/30",
  paused: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const AUTO_TRIGGERS = [
  { id: "welcome", label: "Welcome Bonus", desc: "Send 100 bonus points on first visit", enabled: true },
  { id: "birthday", label: "Birthday Rewards", desc: "Automatic birthday reward 3 days before", enabled: true },
  { id: "tier-upgrade", label: "Tier Upgrade", desc: "Congratulate on tier advancement", enabled: true },
  { id: "reactivation", label: "Inactive Reactivation", desc: "Re-engage after 30 days of inactivity", enabled: false },
];

export default function LoyaltyCampaigns() {
  const [triggers, setTriggers] = useState(AUTO_TRIGGERS);
  const [createOpen, setCreateOpen] = useState(false);

  const toggleTrigger = (id: string) => {
    setTriggers((t) => t.map((tr) => tr.id === id ? { ...tr, enabled: !tr.enabled } : tr));
    toast.success("Automation updated");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Campaigns & Automations</h1>
          <p className="text-sm text-muted-foreground mt-1">Create campaigns and configure auto-trigger rules</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Campaign Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_CAMPAIGNS.map((c) => (
          <Card key={c.id} className="bg-card border-border/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif font-semibold text-base">{c.name}</h3>
                <Badge variant="outline" className={`text-xs ${STATUS_COLORS[c.status]}`}>{c.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Channel</p>
                  <p className="font-medium mt-0.5">{c.channel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Reach</p>
                  <p className="font-medium mt-0.5">{c.reach.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Period</p>
                  <p className="font-medium mt-0.5 text-xs">{c.startDate} → {c.endDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auto-Triggers */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Auto-Trigger Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {triggers.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/20">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <Switch checked={t.enabled} onCheckedChange={() => toggleTrigger(t.id)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Channel Templates */}
      <Card className="bg-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-widest">Channel Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Smartphone, label: "SMS", count: 4 },
              { icon: MessageSquare, label: "WhatsApp", count: 3 },
              { icon: Mail, label: "Email", count: 6 },
            ].map((ch) => (
              <div key={ch.label} className="p-4 bg-muted/20 rounded-lg border border-border/20 text-center">
                <ch.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{ch.label}</p>
                <p className="text-xs text-muted-foreground">{ch.count} templates</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-card border-border/40">
          <DialogHeader><DialogTitle className="font-serif">New Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Campaign Name</Label>
              <Input placeholder="e.g. Summer Promo" className="bg-muted/30 border-border/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Channel</Label>
                <Select defaultValue="sms">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message</Label>
              <Textarea placeholder="Campaign message..." className="bg-muted/30 border-border/40" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => { toast.success("Campaign created"); setCreateOpen(false); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
