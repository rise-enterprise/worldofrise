import { useEffect, useMemo } from 'react';
import { useAIPredictions } from '@/hooks/useAIPredictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, AlertTriangle, TrendingUp, Users, Zap, RefreshCw, Loader2, Sparkles, ShieldAlert, Target, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CHURN_COLORS = {
  safe: 'hsl(var(--chart-2))',
  at_risk: 'hsl(var(--chart-4))',
  high_risk: 'hsl(var(--destructive))',
};

const SEGMENT_COLORS: Record<string, string> = {
  future_vip: 'hsl(var(--chart-1))',
  loyal_steady: 'hsl(var(--chart-2))',
  high_margin: 'hsl(var(--chart-3))',
  dormant_reactivatable: 'hsl(var(--chart-4))',
  new_promising: 'hsl(var(--chart-5))',
  reward_abuser: 'hsl(var(--destructive))',
  lapsed: 'hsl(var(--muted-foreground))',
  standard: 'hsl(var(--border))',
};

const SEGMENT_LABELS: Record<string, string> = {
  future_vip: 'Future VIP',
  loyal_steady: 'Loyal Steady',
  high_margin: 'High Margin',
  dormant_reactivatable: 'Dormant (Reactivatable)',
  new_promising: 'New & Promising',
  reward_abuser: 'Reward Abuser',
  lapsed: 'Lapsed',
  standard: 'Standard',
};

const LTV_COLORS = {
  platinum: '#C8A24A',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  bronze: '#B45309',
};

export default function AIIntelligenceOverview() {
  const {
    isRunning,
    predictions,
    insights,
    isLoadingPredictions,
    isLoadingInsights,
    lastRunResult,
    runBatchPredictions,
    fetchPredictions,
    fetchInsights,
    getChurnDistribution,
    getSegmentDistribution,
    getLTVDistribution,
  } = useAIPredictions();

  useEffect(() => {
    fetchPredictions();
    fetchInsights();
  }, [fetchPredictions, fetchInsights]);

  const churnDist = useMemo(() => getChurnDistribution(), [getChurnDistribution]);
  const segmentDist = useMemo(() => getSegmentDistribution(), [getSegmentDistribution]);
  const ltvDist = useMemo(() => getLTVDistribution(), [getLTVDistribution]);

  const churnChartData = [
    { name: 'Safe', value: churnDist.safe, fill: CHURN_COLORS.safe },
    { name: 'At Risk', value: churnDist.at_risk, fill: CHURN_COLORS.at_risk },
    { name: 'High Risk', value: churnDist.high_risk, fill: CHURN_COLORS.high_risk },
  ].filter(d => d.value > 0);

  const segmentChartData = Object.entries(segmentDist)
    .map(([key, value]) => ({
      name: SEGMENT_LABELS[key] || key,
      value,
      fill: SEGMENT_COLORS[key] || 'hsl(var(--muted))',
    }))
    .sort((a, b) => b.value - a.value);

  const ltvChartData = [
    { name: 'Platinum', value: ltvDist.platinum, fill: LTV_COLORS.platinum },
    { name: 'Gold', value: ltvDist.gold, fill: LTV_COLORS.gold },
    { name: 'Silver', value: ltvDist.silver, fill: LTV_COLORS.silver },
    { name: 'Bronze', value: ltvDist.bronze, fill: LTV_COLORS.bronze },
  ].filter(d => d.value > 0);

  const hasPredictions = predictions.length > 0;

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Intelligence Overview
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Predictive analytics and smart insights powered by AI
          </p>
        </div>
        <div className="flex gap-2">
          {hasPredictions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchPredictions(); fetchInsights(); }}
              disabled={isLoadingPredictions || isLoadingInsights}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
          <Button
            onClick={() => runBatchPredictions(undefined, 100)}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isRunning ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>
      </div>

      {/* Last Run Result */}
      {lastRunResult && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Analysis complete — {lastRunResult.count} members processed
              </p>
              {lastRunResult.summary && (
                <p className="text-sm text-muted-foreground mt-1">
                  {lastRunResult.summary.summary}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Cards */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Active Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 4).map((insight) => (
              <Card key={insight.id} className={
                insight.severity === 'critical' ? 'border-destructive/50' :
                insight.severity === 'warning' ? 'border-yellow-500/50' :
                insight.severity === 'opportunity' ? 'border-primary/50' :
                ''
              }>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    {insight.severity === 'critical' ? <ShieldAlert className="w-5 h-5 text-destructive shrink-0" /> :
                     insight.severity === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" /> :
                     insight.severity === 'opportunity' ? <Target className="w-5 h-5 text-primary shrink-0" /> :
                     <Sparkles className="w-5 h-5 text-muted-foreground shrink-0" />}
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.summary}</p>
                      {insight.details_json?.recommendation && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {insight.details_json.recommendation}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasPredictions && !isLoadingPredictions && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
              Run the AI Analysis to generate churn predictions, lifetime value estimates,
              and smart customer segments for your members.
            </p>
            <Button onClick={() => runBatchPredictions(undefined, 100)} disabled={isRunning}>
              <Zap className="w-4 h-4 mr-2" />
              Run First Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoadingPredictions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      )}

      {/* Charts Grid */}
      {hasPredictions && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-2xl font-bold">{churnDist.total}</p>
                <p className="text-xs text-muted-foreground">Members Analyzed</p>
              </CardContent>
            </Card>
            <Card className={churnDist.high_risk > 0 ? 'border-destructive/30' : ''}>
              <CardContent className="pt-4 pb-3 text-center">
                <ShieldAlert className="w-5 h-5 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-destructive">{churnDist.high_risk}</p>
                <p className="text-xs text-muted-foreground">High Churn Risk</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">${ltvDist.avgLTV.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Avg 12m LTV</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{segmentDist['future_vip'] || 0}</p>
                <p className="text-xs text-muted-foreground">Future VIPs</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Churn Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Churn Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {churnChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={churnChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {churnChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    No data yet
                  </div>
                )}
                <div className="flex justify-center gap-4 mt-2">
                  {churnChartData.map(d => (
                    <div key={d.name} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Smart Segments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Smart Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {segmentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={segmentChartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {segmentChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    No data yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LTV Tiers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  LTV Value Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ltvChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={ltvChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {ltvChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    No data yet
                  </div>
                )}
                <div className="flex justify-center gap-4 mt-2">
                  {ltvChartData.map(d => (
                    <div key={d.name} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
