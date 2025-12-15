import { Guest, GuestInsight } from '@/types/loyalty';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { ChurnRiskGauge } from './ChurnRiskGauge';
import { PatternAnalysisCard } from './PatternAnalysisCard';
import { AIMessageGenerator } from './AIMessageGenerator';
import { useGuestInsights } from '@/hooks/useGuestInsights';

interface GuestInsightsPanelProps {
  guest: Guest;
}

export function GuestInsightsPanel({ guest }: GuestInsightsPanelProps) {
  const { loading, insight, generateInsights, clearInsight } = useGuestInsights();

  const handleGenerate = () => {
    generateInsights(guest);
  };

  const handleRegenerate = () => {
    clearInsight();
    generateInsights(guest);
  };

  if (!insight && !loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
              Analyze visit patterns, predict churn risk, and generate personalized 
              re-engagement messages tailored to this guest.
            </p>
            <Button onClick={handleGenerate} disabled={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Analyzing guest patterns and generating insights...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-display text-lg">AI Insights</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleRegenerate}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Churn Risk */}
        <ChurnRiskGauge 
          risk={insight!.churnRisk} 
          score={insight!.churnScore} 
        />

        {/* Patterns */}
        <PatternAnalysisCard patterns={insight!.patterns} />

        {/* AI Message */}
        <AIMessageGenerator insight={insight!} />

        {/* Generated timestamp */}
        <p className="text-xs text-muted-foreground text-center">
          Generated: {new Date(insight!.generatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
