import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Guest, mapDbTierToTier, mapDbBrandToBrand, mapDbCityToCountry, Tier, Brand } from '@/types/loyalty';

const PAGE_SIZE = 20;

interface PaginationParams {
  page: number;
  searchQuery?: string;
  tierFilter?: Tier | 'all';
  brandFilter?: Brand;
}

interface PaginatedResult {
  guests: Guest[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

async function fetchPaginatedMembers({
  page,
  searchQuery,
  tierFilter,
  brandFilter,
}: PaginationParams): Promise<PaginatedResult> {
  const offset = (page - 1) * PAGE_SIZE;

  // Build the base query for counting
  let countQuery = supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  // Build the main query
  let query = supabase
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
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    const search = `%${searchQuery.trim()}%`;
    query = query.or(`full_name.ilike.${search},email.ilike.${search},phone.ilike.${search}`);
    countQuery = countQuery.or(`full_name.ilike.${search},email.ilike.${search},phone.ilike.${search}`);
  }

  // Apply brand filter
  if (brandFilter && brandFilter !== 'all') {
    query = query.eq('brand_affinity', brandFilter);
    countQuery = countQuery.eq('brand_affinity', brandFilter);
  }

  // Execute both queries
  const [{ data: members, error }, { count, error: countError }] = await Promise.all([
    query,
    countQuery,
  ]);

  if (error) throw error;
  if (countError) throw countError;

  const totalCount = count || 0;

  // If we have members, fetch their visits
  if (members && members.length > 0) {
    const memberIds = members.map(m => m.id);
    
    // Fetch only the most recent visit for each member (for display purposes)
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select(`
        id,
        member_id,
        brand,
        visit_datetime,
        notes,
        locations (
          name,
          city
        )
      `)
      .in('member_id', memberIds)
      .eq('is_voided', false)
      .order('visit_datetime', { ascending: false });

    if (visitsError) throw visitsError;

    // Group visits by member (only need most recent for list view)
    const latestVisitByMember = new Map<string, any>();
    visits?.forEach(visit => {
      if (!latestVisitByMember.has(visit.member_id)) {
        latestVisitByMember.set(visit.member_id, visit);
      }
    });

    const guests: Guest[] = members.map((member: any) => {
      const latestVisit = latestVisitByMember.get(member.id);
      const tierInfo = member.member_tiers?.[0]?.tiers;
      const tierName = tierInfo?.name || 'Initiation';

      return {
        id: member.id,
        name: member.full_name,
        email: member.email,
        phone: member.phone,
        country: mapDbCityToCountry(member.city),
        tier: mapDbTierToTier(tierName),
        tierName: tierName,
        totalVisits: member.total_visits || 0,
        lifetimeVisits: member.total_visits || 0,
        lastVisit: latestVisit
          ? new Date(latestVisit.visit_datetime)
          : new Date(member.created_at || Date.now()),
        joinedAt: new Date(member.created_at || Date.now()),
        favoriteBrand: mapDbBrandToBrand(member.brand_affinity),
        visits: [], // Don't load all visits for list view
        tags: member.tags ? member.tags.split(',').map((t: string) => t.trim()) : [],
        notes: member.notes || undefined,
        totalPoints: member.total_points || 0,
        status: member.status || 'active',
        isVip: member.is_vip || false,
        birthday: member.birthday || undefined,
        salutation: member.salutation || undefined,
      };
    });

    // Apply tier filter client-side (since it requires join data)
    const filteredGuests = tierFilter && tierFilter !== 'all'
      ? guests.filter(g => g.tier === tierFilter)
      : guests;

    return {
      guests: filteredGuests,
      totalCount,
      totalPages: Math.ceil(totalCount / PAGE_SIZE),
      currentPage: page,
    };
  }

  return {
    guests: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: page,
  };
}

export function usePaginatedMembers(params: PaginationParams) {
  return useQuery({
    queryKey: ['members', 'paginated', params.page, params.searchQuery, params.tierFilter, params.brandFilter],
    queryFn: () => fetchPaginatedMembers(params),
    placeholderData: (previousData) => previousData,
  });
}

export { PAGE_SIZE };
