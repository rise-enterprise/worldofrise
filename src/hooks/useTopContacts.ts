import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TopContact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  loyalty_tier: string | null;
  visits: number;
  total_spend: number | null;
  vip: boolean;
}

async function fetchTopContacts(): Promise<TopContact[]> {
  const { data, error } = await (supabase as any)
    .from('contacts')
    .select('id, first_name, last_name, loyalty_tier, visits, total_spend, vip')
    .not('total_spend', 'is', null)
    .order('total_spend', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data ?? [];
}

export function useTopContacts() {
  return useQuery({
    queryKey: ['top-contacts'],
    queryFn: fetchTopContacts,
    staleTime: 1000 * 60 * 5,
  });
}
