import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChurnPrediction {
  score: number;
  label: 'safe' | 'at_risk' | 'high_risk';
  confidence: number;
  factors: string[];
}

interface LTVPrediction {
  projected6m: number;
  projected12m: number;
  monthlyAvg: number;
  tier: string;
  confidence: number;
}

interface SegmentPrediction {
  name: string;
  reason: string;
  confidence: number;
}

export interface MemberPrediction {
  member_id: string;
  churn: ChurnPrediction;
  ltv: LTVPrediction;
  segment: SegmentPrediction;
}

export interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  summary: string;
  details_json: Record<string, any>;
  severity: string;
  is_actionable: boolean;
  generated_at: string;
}

export interface StoredPrediction {
  id: string;
  member_id: string;
  prediction_type: string;
  score: number | null;
  label: string | null;
  confidence: number | null;
  metadata_json: Record<string, any>;
  generated_at: string;
}

export function useAIPredictions() {
  const [isRunning, setIsRunning] = useState(false);
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<{
    count: number;
    summary: any;
  } | null>(null);

  const runBatchPredictions = useCallback(async (memberIds?: string[], limit?: number) => {
    setIsRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-predictions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            action: 'batch_predict',
            member_ids: memberIds,
            limit: limit || 50,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Prediction failed');
      }

      const result = await response.json();
      setLastRunResult({
        count: result.predictions_count,
        summary: result.summary,
      });
      return result;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const fetchPredictions = useCallback(async () => {
    setIsLoadingPredictions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-predictions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: 'get_predictions' }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      }
    } finally {
      setIsLoadingPredictions(false);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-predictions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: 'get_insights' }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  // Aggregate prediction stats
  const getChurnDistribution = useCallback(() => {
    const churnPreds = predictions.filter(p => p.prediction_type === 'churn');
    const latest = new Map<string, StoredPrediction>();
    churnPreds.forEach(p => {
      const existing = latest.get(p.member_id);
      if (!existing || new Date(p.generated_at) > new Date(existing.generated_at)) {
        latest.set(p.member_id, p);
      }
    });

    const values = Array.from(latest.values());
    return {
      safe: values.filter(p => p.label === 'safe').length,
      at_risk: values.filter(p => p.label === 'at_risk').length,
      high_risk: values.filter(p => p.label === 'high_risk').length,
      total: values.length,
    };
  }, [predictions]);

  const getSegmentDistribution = useCallback(() => {
    const segPreds = predictions.filter(p => p.prediction_type === 'segment');
    const latest = new Map<string, StoredPrediction>();
    segPreds.forEach(p => {
      const existing = latest.get(p.member_id);
      if (!existing || new Date(p.generated_at) > new Date(existing.generated_at)) {
        latest.set(p.member_id, p);
      }
    });

    const dist: Record<string, number> = {};
    latest.forEach(p => {
      if (p.label) dist[p.label] = (dist[p.label] || 0) + 1;
    });
    return dist;
  }, [predictions]);

  const getLTVDistribution = useCallback(() => {
    const ltvPreds = predictions.filter(p => p.prediction_type === 'ltv');
    const latest = new Map<string, StoredPrediction>();
    ltvPreds.forEach(p => {
      const existing = latest.get(p.member_id);
      if (!existing || new Date(p.generated_at) > new Date(existing.generated_at)) {
        latest.set(p.member_id, p);
      }
    });

    const values = Array.from(latest.values());
    return {
      platinum: values.filter(p => p.label === 'platinum').length,
      gold: values.filter(p => p.label === 'gold').length,
      silver: values.filter(p => p.label === 'silver').length,
      bronze: values.filter(p => p.label === 'bronze').length,
      avgLTV: values.length > 0
        ? Math.round(values.reduce((s, p) => s + (p.score || 0), 0) / values.length)
        : 0,
    };
  }, [predictions]);

  return {
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
  };
}
