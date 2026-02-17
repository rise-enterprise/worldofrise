import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brand } from '@/types/loyalty';

export interface BranchVisitCount {
  branch_name: string;
  visit_count: number;
}

export function useBranchPreferences(brand: Brand = 'all') {
  const brandFilter = brand === 'all' || brand === 'both' ? null : brand;

  return useQuery({
    queryKey: ['branch-preferences', brand],
    queryFn: async (): Promise<BranchVisitCount[]> => {
      const { data, error } = await supabase.rpc('get_branch_visit_counts', {
        brand_filter: brandFilter,
      });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        branch_name: row.branch_name,
        visit_count: Number(row.visit_count),
      }));
    },
  });
}
