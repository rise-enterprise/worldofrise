import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics, Brand } from '@/types/loyalty';

async function fetchDashboardMetrics(brand: Brand): Promise<DashboardMetrics> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const params: Record<string, string> = {};
  if (brand && brand !== 'all') {
    params.brand = brand;
  }

  const queryString = new URLSearchParams(params).toString();
  const functionPath = queryString ? `dashboard-metrics?${queryString}` : 'dashboard-metrics';

  const { data, error } = await supabase.functions.invoke(functionPath, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;
  return data as DashboardMetrics;
}

export function useDashboardMetrics(brand: Brand = 'all') {
  return useQuery({
    queryKey: ['dashboard-metrics', brand],
    queryFn: () => fetchDashboardMetrics(brand),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}
