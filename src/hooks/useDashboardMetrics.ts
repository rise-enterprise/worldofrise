import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics } from '@/types/loyalty';

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data, error } = await supabase.functions.invoke('dashboard-metrics', {
    method: 'GET',
  });

  if (error) throw error;
  return data as DashboardMetrics;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}
