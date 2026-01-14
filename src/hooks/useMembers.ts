import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Guest, mapDbTierToTier, mapDbBrandToBrand, mapDbCityToCountry } from '@/types/loyalty';

interface MemberWithTier {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  city: 'doha' | 'riyadh';
  brand_affinity: 'noir' | 'sasso' | 'both' | null;
  status: 'active' | 'blocked' | null;
  total_visits: number | null;
  total_points: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  member_tiers: {
    tier_id: string;
    tiers: {
      name: string;
      color: string | null;
    } | null;
  }[] | null;
}

async function fetchMembers(): Promise<Guest[]> {
  const { data: members, error } = await supabase
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
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch visits for all members
  const memberIds = members?.map(m => m.id) || [];
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

  // Group visits by member
  const visitsByMember = new Map<string, typeof visits>();
  visits?.forEach(visit => {
    const existing = visitsByMember.get(visit.member_id) || [];
    existing.push(visit);
    visitsByMember.set(visit.member_id, existing);
  });

  return (members || []).map((member: any) => {
    const memberVisits = visitsByMember.get(member.id) || [];
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
      lastVisit: memberVisits[0] 
        ? new Date(memberVisits[0].visit_datetime)
        : new Date(member.created_at || Date.now()),
      joinedAt: new Date(member.created_at || Date.now()),
      favoriteBrand: mapDbBrandToBrand(member.brand_affinity),
      visits: memberVisits.map(v => ({
        id: v.id,
        date: new Date(v.visit_datetime),
        brand: mapDbBrandToBrand(v.brand),
        country: mapDbCityToCountry((v.locations as any)?.city || 'doha'),
        location: (v.locations as any)?.name || 'Unknown',
        notes: v.notes || undefined,
      })),
      tags: [], // Tags would need a separate table
      notes: member.notes || undefined,
      avatarUrl: member.avatar_url || undefined,
      totalPoints: member.total_points || 0,
      status: member.status || 'active',
    };
  });
}

async function fetchMember(id: string): Promise<Guest | null> {
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
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!member) return null;

  const { data: visits, error: visitsError } = await supabase
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
    .eq('member_id', id)
    .eq('is_voided', false)
    .order('visit_datetime', { ascending: false });

  if (visitsError) throw visitsError;

  const tierInfo = (member as any).member_tiers?.[0]?.tiers;
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

interface CreateMemberInput {
  full_name: string;
  phone: string;
  email?: string;
  city?: 'doha' | 'riyadh';
  brand_affinity?: 'noir' | 'sasso' | 'both';
  notes?: string;
}

async function createMember(input: CreateMemberInput) {
  const { data, error } = await supabase
    .from('members')
    .insert({
      full_name: input.full_name,
      phone: input.phone,
      email: input.email || null,
      city: input.city || 'doha',
      brand_affinity: input.brand_affinity || 'both',
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateMember(id: string, updates: Partial<CreateMemberInput>) {
  const { data, error } = await supabase
    .from('members')
    .update({
      full_name: updates.full_name,
      phone: updates.phone,
      email: updates.email,
      city: updates.city,
      brand_affinity: updates.brand_affinity,
      notes: updates.notes,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fetch a single demo member with LIMIT 1 for performance
async function fetchDemoMember(): Promise<Guest | null> {
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
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!member) return null;

  const { data: visits, error: visitsError } = await supabase
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
    .eq('member_id', member.id)
    .eq('is_voided', false)
    .order('visit_datetime', { ascending: false })
    .limit(20);

  if (visitsError) throw visitsError;

  const tierInfo = (member as any).member_tiers?.[0]?.tiers;
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

export function useDemoMember() {
  return useQuery({
    queryKey: ['demo-member'],
    queryFn: fetchDemoMember,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  });
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => fetchMember(id!),
    enabled: !!id,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateMemberInput> }) =>
      updateMember(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', id] });
    },
  });
}
