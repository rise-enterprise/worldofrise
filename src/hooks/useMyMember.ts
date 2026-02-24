import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Guest, mapDbTierToTier, mapDbBrandToBrand, mapDbCityToCountry } from '@/types/loyalty';

/**
 * Fetches the currently authenticated member's own data
 * using get_member_id() RPC to resolve the member ID from the session.
 */
async function fetchMyMember(): Promise<Guest | null> {
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Get member_id from member_auth via RPC
  const { data: memberId, error: rpcError } = await supabase.rpc('get_member_id', {
    _user_id: session.user.id,
  });

  if (rpcError || !memberId) return null;

  // Fetch member with tier
  const { data: member, error } = await supabase
    .from('members')
    .select(`
      *,
      member_tiers (
        tier_id,
        tiers (
          name,
          color
        )
      )
    `)
    .eq('id', memberId)
    .maybeSingle();

  if (error || !member) return null;

  // Fetch visits
  const { data: visits } = await supabase
    .from('visits')
    .select(`
      id,
      brand,
      visit_datetime,
      notes,
      locations (
        name,
        city
      )
    `)
    .eq('member_id', memberId)
    .eq('is_voided', false)
    .order('visit_datetime', { ascending: false })
    .limit(50);

  const tierInfo = (member as any).member_tiers?.[0]?.tiers;
  const tierName = tierInfo?.name || 'Initiation';

  return {
    id: member.id,
    name: member.full_name,
    email: member.email,
    phone: member.phone,
    country: mapDbCityToCountry(member.city),
    tier: mapDbTierToTier(tierName),
    tierName,
    totalVisits: member.total_visits || 0,
    lifetimeVisits: member.total_visits || 0,
    lastVisit: visits?.[0]
      ? new Date(visits[0].visit_datetime)
      : new Date(member.created_at || Date.now()),
    joinedAt: new Date(member.created_at || Date.now()),
    favoriteBrand: mapDbBrandToBrand(member.brand_affinity),
    visits: (visits || []).map(v => ({
      id: v.id,
      date: new Date(v.visit_datetime),
      brand: mapDbBrandToBrand(v.brand),
      country: mapDbCityToCountry((v.locations as any)?.city || 'doha'),
      location: (v.locations as any)?.name || 'Unknown',
      notes: v.notes || undefined,
    })),
    tags: [],
    notes: member.notes || undefined,
    avatarUrl: member.avatar_url || undefined,
    totalPoints: member.total_points || 0,
    status: member.status || 'active',
  };
}

export function useMyMember() {
  return useQuery({
    queryKey: ['my-member'],
    queryFn: fetchMyMember,
    staleTime: 1000 * 60 * 5,
  });
}
