import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TierSpend {
  name: string;
  members: number;
  spend: number;
}

async function fetchTierSpendMetrics(): Promise<TierSpend[]> {
  const { data, error } = await (supabase as any)
    .from('contacts')
    .select('loyalty_tier, total_spend');

  if (error) throw error;

  const tierMap = new Map<string, { members: number; spend: number }>();

  (data ?? []).forEach((c: any) => {
    const tier = (c.loyalty_tier || 'Unknown').trim() || 'Unknown';
    const existing = tierMap.get(tier) || { members: 0, spend: 0 };
    existing.members += 1;
    existing.spend += Number(c.total_spend) || 0;
    tierMap.set(tier, existing);
  });

  return Array.from(tierMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.spend - a.spend);
}

export function useTierSpendMetrics() {
  return useQuery({
    queryKey: ['tier-spend-metrics'],
    queryFn: fetchTierSpendMetrics,
    staleTime: 1000 * 60 * 5,
  });
}
