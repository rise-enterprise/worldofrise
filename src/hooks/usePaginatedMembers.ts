import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Guest, mapDbTierToTier, mapDbCityToCountry, Tier, Brand } from '@/types/loyalty';

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

function mapTierFilterToIlike(tier: Tier): string {
  if (tier === 'inner-circle') return '%inner%';
  return `%${tier}%`;
}

function mapBrandToLocationFilter(brand: Brand): string | null {
  if (brand === 'noir') return '%noir%';
  if (brand === 'sasso') return '%sasso%';
  return null;
}

async function fetchPaginatedMembers({
  page,
  searchQuery,
  tierFilter,
  brandFilter,
}: PaginationParams): Promise<PaginatedResult> {
  const offset = (page - 1) * PAGE_SIZE;

  // Build the count query
  let countQuery = supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true });

  // Build the main query
  let query = supabase
    .from('contacts')
    .select('*')
    .order('last_visit', { ascending: false, nullsFirst: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    const search = `%${searchQuery.trim()}%`;
    const searchFilter = `first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search},phone.ilike.${search}`;
    query = query.or(searchFilter);
    countQuery = countQuery.or(searchFilter);
  }

  // Apply brand filter
  const brandLocationFilter = brandFilter ? mapBrandToLocationFilter(brandFilter) : null;
  if (brandLocationFilter) {
    query = query.ilike('last_location', brandLocationFilter);
    countQuery = countQuery.ilike('last_location', brandLocationFilter);
  }

  // Apply tier filter server-side
  if (tierFilter && tierFilter !== 'all') {
    const tierIlike = mapTierFilterToIlike(tierFilter);
    query = query.ilike('loyalty_tier', tierIlike);
    countQuery = countQuery.ilike('loyalty_tier', tierIlike);
  }

  // Execute both queries
  const [{ data: contacts, error }, { count, error: countError }] = await Promise.all([
    query,
    countQuery,
  ]);

  if (error) throw error;
  if (countError) throw countError;

  const totalCount = count || 0;

  if (contacts && contacts.length > 0) {
    const guests: Guest[] = contacts.map((contact: any) => {
      const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown';
      const tierName = contact.loyalty_tier || 'Initiation';
      const lastLocation = contact.last_location || '';
      
      // Determine brand from last_location
      let favBrand: Brand = 'both';
      if (lastLocation.toLowerCase().includes('noir')) favBrand = 'noir';
      else if (lastLocation.toLowerCase().includes('sasso')) favBrand = 'sasso';

      return {
        id: contact.id,
        name: fullName,
        email: contact.email,
        phone: contact.phone || undefined,
        country: mapDbCityToCountry(lastLocation.toLowerCase().includes('riyadh') ? 'riyadh' : 'doha'),
        tier: mapDbTierToTier(tierName),
        tierName: tierName,
        totalVisits: contact.visits || 0,
        lifetimeVisits: contact.visits || 0,
        lastVisit: contact.last_visit ? new Date(contact.last_visit) : new Date(contact.created_date || Date.now()),
        joinedAt: new Date(contact.created_date || Date.now()),
        favoriteBrand: favBrand,
        visits: [],
        tags: contact.tags ? contact.tags.split(',').map((t: string) => t.trim()) : [],
        notes: contact.notes || undefined,
        totalPoints: contact.total_spend ? Number(contact.total_spend) : 0,
        status: 'active',
        isVip: contact.vip || false,
        birthday: contact.birthday || undefined,
        salutation: contact.salutation || undefined,
      };
    });

    return {
      guests,
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
