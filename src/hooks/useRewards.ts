import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Reward {
  id: string;
  title: string;
  titleArabic: string | null;
  description: string | null;
  descriptionArabic: string | null;
  category: 'experience' | 'vip_table' | 'secret_menu' | 'invitation';
  brand: 'noir' | 'sasso' | 'both';
  tier: 'crystal' | 'onyx' | 'obsidian' | 'royal';
  pointsCost: number;
  availability: 'available' | 'limited' | 'sold_out';
  imageUrl: string | null;
  stockLimit: number | null;
  perMemberLimit: number | null;
  termsEn: string | null;
  termsAr: string | null;
  validityStart: string | null;
  validityEnd: string | null;
}

async function fetchRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_cost', { ascending: true });

  if (error) throw error;

  return (data || []).map(reward => {
    // Map tier based on points cost ranges
    let tier: 'crystal' | 'onyx' | 'obsidian' | 'royal' = 'crystal';
    if (reward.points_cost >= 7500) tier = 'royal';
    else if (reward.points_cost >= 4000) tier = 'obsidian';
    else if (reward.points_cost >= 2000) tier = 'onyx';

    // Determine availability based on stock
    let availability: 'available' | 'limited' | 'sold_out' = 'available';
    if (reward.stock_limit !== null) {
      if (reward.stock_limit <= 0) availability = 'sold_out';
      else if (reward.stock_limit <= 10) availability = 'limited';
    }

    // Default category based on title keywords
    let category: 'experience' | 'vip_table' | 'secret_menu' | 'invitation' = 'experience';
    const titleLower = reward.title_en.toLowerCase();
    if (titleLower.includes('vip') || titleLower.includes('lounge') || titleLower.includes('table')) {
      category = 'vip_table';
    } else if (titleLower.includes('secret') || titleLower.includes('menu') || titleLower.includes('tasting')) {
      category = 'secret_menu';
    } else if (titleLower.includes('gala') || titleLower.includes('invitation') || titleLower.includes('invite')) {
      category = 'invitation';
    }

    return {
      id: reward.id,
      title: reward.title_en,
      titleArabic: reward.title_ar,
      description: reward.description_en,
      descriptionArabic: reward.description_ar,
      category,
      brand: (reward.brand_scope as 'noir' | 'sasso' | 'both') || 'both',
      tier,
      pointsCost: reward.points_cost,
      availability,
      imageUrl: reward.image_url,
      stockLimit: reward.stock_limit,
      perMemberLimit: reward.per_member_limit,
      termsEn: reward.terms_en,
      termsAr: reward.terms_ar,
      validityStart: reward.validity_start,
      validityEnd: reward.validity_end,
    };
  });
}

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: fetchRewards,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
