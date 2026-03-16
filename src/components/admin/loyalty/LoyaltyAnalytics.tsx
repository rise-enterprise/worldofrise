import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Gift, Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GROWTH_DATA = [
  { month: "Sep", members: 1820 }, { month: "Oct", members: 2010 }, { month: "Nov", members: 2180 },
  { month: "Dec", members: 2340 }, { month: "Jan", members: 2580 }, { month: "Feb", members: 2847 },
];

const TOP_SPENDERS = [
  { name: "Fatima A.", spend: 89400 }, { name: "Khalid R.", spend: 34200 },
  { name: "Layla M.", spend: 22100 }, { name: "Sara T.", spend: 18900 },
  { name: "Noor K.", spend: 15600 },
];

const REWARD_ROI = [
  { name: "Dessert", roi: 340 }, { name: "Cocktail", roi: 280 },
  { name: "Discount", roi: 190 }, { name: "VIP Access", roi: 420 },
  { name: "Chef Table", roi: 580 },
];

const TIER_DIST = [
  { name: "Bronze", value: 1200, color: "#92400e" },
  { name: "Silver", value: 800, color: "#94a3b8" },
  { name: "Gold", value: 480, color: "#D4A843" },
  { name: "Platinum", value: 243, color: "#8b5cf6" },
  { name: "Black", value: 124, color: "#e2e8f0" },
];

const KPIS = [
  { label: "Total Members", value: "2,847", change: "+10.3%", up: true, icon: Users },
  { label: "Active Rate", value: "85.4%", change: "+2.1%", up: true, icon: TrendingUp },
  { label: "Redemption Rate", value: "34.2%", change: "-1.8%", up: false, icon: Gift },
  { label: "Points Issued", value: "1.2M", change: "+15.6%", up: true, icon: Coins },
];

export default function LoyaltyAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">Loyalty Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics, growth trends, and ROI analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => (
          <Card key={k.label} className="bg-card border-border/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <k.icon className="h-4 w-4 text-primary" />
                <Badge variant="outline" className={`text-xs gap-1 ${k.up ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-widest">Member Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={GROWTH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 60%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(220 10% 60%)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 12% 7%)", border: "1px solid hsl(220 10% 20%)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="members" stroke="hsl(40 62% 56%)" strokeWidth={2} dot={{ fill: "hsl(40 62% 56%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-widest">Top Spenders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOP_SPENDERS} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
                  <XAxis type="number" tick={{ fill: "hsl(220 10% 60%)", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(220 10% 60%)", fontSize: 12 }} width={70} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 12% 7%)", border: "1px solid hsl(220 10% 20%)", borderRadius: 8 }} />
                  <Bar dataKey="spend" fill="hsl(42 50% 54%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-widest">ROI per Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REWARD_ROI}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 60%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(220 10% 60%)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 12% 7%)", border: "1px solid hsl(220 10% 20%)", borderRadius: 8 }} />
                  <Bar dataKey="roi" fill="hsl(195 62% 32%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-widest">Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={TIER_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" stroke="none">
                    {TIER_DIST.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 12% 7%)", border: "1px solid hsl(220 10% 20%)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {TIER_DIST.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="font-mono font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
