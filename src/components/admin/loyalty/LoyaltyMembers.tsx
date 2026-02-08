import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Crown, Shield, Ban, Star, ChevronRight, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

const MOCK_MEMBERS = [
  { id: "1", name: "Khalid Al-Rashid", phone: "+974 5512 3456", email: "khalid@email.com", tier: "Platinum", points: 12400, visits: 87, status: "active", spend: 34200, redemptions: 12, isVip: true },
  { id: "2", name: "Sara Al-Thani", phone: "+974 5598 7654", email: "sara@email.com", tier: "Gold", points: 5600, visits: 42, status: "active", spend: 18900, redemptions: 5, isVip: false },
  { id: "3", name: "Omar Hassan", phone: "+966 5501 2345", email: "omar@email.com", tier: "Silver", points: 2100, visits: 15, status: "active", spend: 7800, redemptions: 2, isVip: false },
  { id: "4", name: "Fatima Al-Sayed", phone: "+974 5534 5678", email: "fatima@email.com", tier: "Black", points: 28900, visits: 156, status: "active", spend: 89400, redemptions: 34, isVip: true },
  { id: "5", name: "Youssef Nader", phone: "+966 5567 8901", email: "youssef@email.com", tier: "Bronze", points: 450, visits: 4, status: "blocked", spend: 1200, redemptions: 0, isVip: false },
  { id: "6", name: "Layla Mansour", phone: "+974 5578 1234", email: "layla@email.com", tier: "Gold", points: 7200, visits: 51, status: "active", spend: 22100, redemptions: 8, isVip: false },
];

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-amber-900/20 text-amber-400 border-amber-700/30",
  Silver: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Gold: "bg-primary/20 text-primary border-primary/30",
  Platinum: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Black: "bg-foreground/10 text-foreground border-foreground/20",
};

export default function LoyaltyMembers() {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<typeof MOCK_MEMBERS[0] | null>(null);
  const [pointsDialog, setPointsDialog] = useState(false);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsAction, setPointsAction] = useState<"add" | "remove">("add");

  const filtered = MOCK_MEMBERS.filter((m) =>
    [m.name, m.phone, m.email].some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePointsSubmit = () => {
    if (!selectedMember || !pointsAmount) return;
    toast.success(`${pointsAction === "add" ? "Added" : "Removed"} ${pointsAmount} points for ${selectedMember.name}`);
    setPointsDialog(false);
    setPointsAmount("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Members Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Search, view, and manage loyalty program members</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <UserPlus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border/50"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: "2,847" },
          { label: "Active", value: "2,431" },
          { label: "VIP Members", value: "124" },
          { label: "Blocked", value: "18" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border/30">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Phone</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Tier</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground text-right">Points</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground text-right">Visits</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow
                  key={m.id}
                  className="border-border/20 cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedMember(m)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {m.name}
                      {m.isVip && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={TIER_COLORS[m.tier] || ""}>{m.tier}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{m.points.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{m.visits}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "active" ? "default" : "destructive"} className="text-xs">
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Member Profile Dialog */}
      <Dialog open={!!selectedMember && !pointsDialog} onOpenChange={(o) => !o && setSelectedMember(null)}>
        <DialogContent className="max-w-lg bg-card border-border/40">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl flex items-center gap-2">
                  {selectedMember.name}
                  {selectedMember.isVip && <Star className="h-4 w-4 text-primary fill-primary" />}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { label: "Total Spend", value: `$${selectedMember.spend.toLocaleString()}` },
                  { label: "Total Visits", value: selectedMember.visits },
                  { label: "Points Balance", value: selectedMember.points.toLocaleString() },
                  { label: "Tier", value: selectedMember.tier },
                  { label: "Redemptions", value: selectedMember.redemptions },
                  { label: "Status", value: selectedMember.status },
                ].map((f) => (
                  <div key={f.label} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</p>
                    <p className="text-lg font-semibold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setPointsAction("add"); setPointsDialog(true); }}>
                  <ArrowUpDown className="h-3.5 w-3.5" /> Adjust Points
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Crown className="h-3.5 w-3.5" /> Change Tier
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Star className="h-3.5 w-3.5" /> Toggle VIP
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/30">
                  <Ban className="h-3.5 w-3.5" /> Block
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Points Adjustment Dialog */}
      <Dialog open={pointsDialog} onOpenChange={setPointsDialog}>
        <DialogContent className="max-w-sm bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-serif">Adjust Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Select value={pointsAction} onValueChange={(v) => setPointsAction(v as "add" | "remove")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Points</SelectItem>
                <SelectItem value="remove">Remove Points</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Amount" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handlePointsSubmit} className="bg-primary text-primary-foreground">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
