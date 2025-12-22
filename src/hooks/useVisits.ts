import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Visit, mapDbBrandToBrand, mapDbCityToCountry } from '@/types/loyalty';

async function fetchMemberVisits(memberId: string): Promise<Visit[]> {
  const { data, error } = await supabase
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
    .order('visit_datetime', { ascending: false });

  if (error) throw error;

  return (data || []).map(v => ({
    id: v.id,
    date: new Date(v.visit_datetime),
    brand: mapDbBrandToBrand(v.brand),
    country: mapDbCityToCountry((v.locations as any)?.city || 'doha'),
    location: (v.locations as any)?.name || 'Unknown',
    notes: v.notes || undefined,
  }));
}

interface CreateVisitInput {
  member_id: string;
  brand: 'noir' | 'sasso' | 'both';
  location_id?: string;
  notes?: string;
}

async function createVisit(input: CreateVisitInput) {
  const { data, error } = await supabase
    .from('visits')
    .insert({
      member_id: input.member_id,
      brand: input.brand,
      location_id: input.location_id || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export function useVisits(memberId: string | undefined) {
  return useQuery({
    queryKey: ['visits', memberId],
    queryFn: () => fetchMemberVisits(memberId!),
    enabled: !!memberId,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVisit,
    onSuccess: (_, { member_id }) => {
      queryClient.invalidateQueries({ queryKey: ['visits', member_id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', member_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
