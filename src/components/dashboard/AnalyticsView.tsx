import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Users, Target, Award, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const tierData = [
  { name: 'Crystal', members: 450, spend: 125000, color: 'hsl(var(--crystal))' },
  { name: 'Onyx', members: 280, spend: 340000, color: 'hsl(var(--onyx))' },
  { name: 'Obsidian', members: 120, spend: 520000, color: 'hsl(var(--obsidian))' },
  { name: 'Royal', members: 35, spend: 890000, color: 'hsl(var(--royal))' },
];

const retentionData = [
  { month: 'Jan', rate: 78 },
  { month: 'Feb', rate: 82 },
  { month: 'Mar', rate: 79 },
  { month: 'Apr', rate: 85 },
  { month: 'May', rate: 88 },
  { month: 'Jun', rate: 92 },
];

const brandComparison = [
  { month: 'Jan', noir: 1200, sasso: 800 },
  { month: 'Feb', noir: 1350, sasso: 920 },
  { month: 'Mar', noir: 1100, sasso: 1050 },
  { month: 'Apr', noir: 1450, sasso: 1100 },
  { month: 'May', noir: 1600, sasso: 1250 },
  { month: 'Jun', noir: 1750, sasso: 1400 },
];

const topVIPs = [
  { name: 'Sheikh Abdullah Al-Thani', tier: 'Royal', visits: 156, spend: 245000 },
  { name: 'Princess Fatima Al-Saud', tier: 'Royal', visits: 142, spend: 198000 },
  { name: 'Dr. Mohammed Al-Rashid', tier: 'Obsidian', visits: 98, spend: 156000 },
  { name: 'Sarah Al-Mahmoud', tier: 'Obsidian', visits: 87, spend: 134000 },
  { name: 'Ahmed Hassan', tier: 'Onyx', visits: 76, spend: 98000 },
];

export function AnalyticsView() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-wide">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-2 tracking-refined">
          Comprehensive insights into your loyalty program performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card variant="obsidian" className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Loyalty ROI</p>
                <p className="font-display text-3xl font-medium text-foreground mt-2">342%</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-500">
                  <ArrowUp className="h-3 w-3" />
                  <span className="text-xs">+18% vs Q1</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] text-primary/70">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Member LTV</p>
                <p className="font-display text-3xl font-medium text-foreground mt-2">$2,847</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-500">
                  <ArrowUp className="h-3 w-3" />
                  <span className="text-xs">+12% growth</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] text-primary/70">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Retention Rate</p>
                <p className="font-display text-3xl font-medium text-foreground mt-2">92%</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-500">
                  <ArrowUp className="h-3 w-3" />
                  <span className="text-xs">+4% this month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] text-primary/70">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Tier Upgrades</p>
                <p className="font-display text-3xl font-medium text-foreground mt-2">47</p>
                <div className="flex items-center gap-1 mt-2 text-amber-500">
                  <ArrowDown className="h-3 w-3" />
                  <span className="text-xs">-3 vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] text-primary/70">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Tier */}
        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="text-lg font-display tracking-wide">Spend by Tier</CardTitle>
            <p className="text-xs text-muted-foreground/60">Total revenue contribution per tier</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,222,231,0.08)" />
                  <XAxis type="number" stroke="rgba(217,222,231,0.4)" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="rgba(217,222,231,0.4)" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0E1116', 
                      border: '1px solid rgba(217,222,231,0.08)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Retention Trend */}
        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="text-lg font-display tracking-wide">Retention Trend</CardTitle>
            <p className="text-xs text-muted-foreground/60">Monthly member retention rate</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,222,231,0.08)" />
                  <XAxis dataKey="month" stroke="rgba(217,222,231,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(217,222,231,0.4)" fontSize={12} domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0E1116', 
                      border: '1px solid rgba(217,222,231,0.08)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Retention']}
                  />
                  <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Brand Comparison */}
        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="text-lg font-display tracking-wide">Brand Performance</CardTitle>
            <p className="text-xs text-muted-foreground/60">NOIR vs SASSO monthly visits</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,222,231,0.08)" />
                  <XAxis dataKey="month" stroke="rgba(217,222,231,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(217,222,231,0.4)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0E1116', 
                      border: '1px solid rgba(217,222,231,0.08)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="noir" name="NOIR" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sasso" name="SASSO" fill="hsl(var(--burgundy))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top VIPs */}
        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle className="text-lg font-display tracking-wide">Top VIP Guests</CardTitle>
            <p className="text-xs text-muted-foreground/60">Highest value members this quarter</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVIPs.map((vip, index) => (
                <div 
                  key={vip.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{vip.name}</p>
                      <p className="text-xs text-muted-foreground/60">{vip.tier} • {vip.visits} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">${vip.spend.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground/60">lifetime</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
