import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TierConfig, mapDbTierToTier } from '@/types/loyalty';

interface DbTier {
  id: string;
  name: string;
  name_ar: string | null;
  min_visits: number;
  min_points: number | null;
  color: string | null;
  benefits_text_en: string | null;
  benefits_text_ar: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

async function fetchTiers(): Promise<TierConfig[]> {
  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data || []).map((tier: DbTier) => ({
    id: tier.id,
    name: mapDbTierToTier(tier.name),
    displayName: tier.name,
    arabicName: tier.name_ar || tier.name,
    minVisits: tier.min_visits,
    minPoints: tier.min_points || 0,
    color: tier.color || '#6366f1',
    privileges: tier.benefits_text_en 
      ? tier.benefits_text_en.split('\n').filter(Boolean)
      : [],
  }));
}

export function useTiers() {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: fetchTiers,
    staleTime: 300000, // Cache for 5 minutes
  });
}
