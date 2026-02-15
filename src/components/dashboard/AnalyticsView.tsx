import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Users, Target, Award, ArrowUp, ArrowDown } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useTopContacts } from '@/hooks/useTopContacts';
import { useTierSpendMetrics } from '@/hooks/useTierSpendMetrics';

const retentionData = [
  { month: 'Jan', rate: 78 },
  { month: 'Feb', rate: 82 },
  { month: 'Mar', rate: 79 },
  { month: 'Apr', rate: 85 },
  { month: 'May', rate: 88 },
  { month: 'Jun', rate: 92 },
];

export function AnalyticsView() {
  const { data: metrics } = useDashboardMetrics();
  const { data: topContacts } = useTopContacts();
  const { data: tierSpend } = useTierSpendMetrics();

  const totalMembers = metrics?.totalMembers ?? 0;
  const visitsThisMonth = metrics?.totalVisitsThisMonth ?? 0;
  const vipCount = metrics?.vipGuestsCount ?? 0;
  const churnRisk = metrics?.churnRiskCount ?? 0;

  const brandComparison = [
    { name: 'NOIR', value: metrics?.visitsByBrand?.noir ?? 0 },
    { name: 'SASSO', value: metrics?.visitsByBrand?.sasso ?? 0 },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-wide">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-2 tracking-refined">
          Comprehensive insights from your CRM contacts database
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card variant="obsidian" className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Total Contacts</p>
                <p className="font-display text-2xl md:text-3xl font-medium text-foreground mt-2">{totalMembers.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border/30 text-primary/70">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Visits This Month</p>
                <p className="font-display text-2xl md:text-3xl font-medium text-foreground mt-2">{visitsThisMonth.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border/30 text-primary/70">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">VIP Members</p>
                <p className="font-display text-2xl md:text-3xl font-medium text-foreground mt-2">{vipCount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border/30 text-primary/70">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Re-engagement Needed</p>
                <p className="font-display text-2xl md:text-3xl font-medium text-foreground mt-2">{churnRisk.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border/30 text-primary/70">
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
            <p className="text-xs text-muted-foreground/60">Total revenue contribution per loyalty tier</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierSpend ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
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
            <div className="h-[200px] md:h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} fontSize={12} domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
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
            <p className="text-xs text-muted-foreground/60">NOIR vs SASSO contact distribution</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar dataKey="value" name="Contacts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top VIPs from contacts */}
        <Card variant="obsidian" className="animate-slide-up" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle className="text-lg font-display tracking-wide">Top VIP Guests</CardTitle>
            <p className="text-xs text-muted-foreground/60">Highest value contacts by spend</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(topContacts ?? []).map((contact, index) => {
                const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown';
                return (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border/30 hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{fullName}</p>
                        <p className="text-xs text-muted-foreground/60">{contact.loyalty_tier || 'N/A'} • {contact.visits} visits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">${(contact.total_spend ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground/60">lifetime</p>
                    </div>
                  </div>
                );
              })}
              {(!topContacts || topContacts.length === 0) && (
                <p className="text-sm text-muted-foreground/60 text-center py-8">No contact spend data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
