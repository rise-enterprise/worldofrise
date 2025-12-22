import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  name: string;
  nameAr: string | null;
  city: 'doha' | 'riyadh';
  brand: 'noir' | 'sasso' | 'both';
  address: string | null;
  isActive: boolean;
}

async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  return (data || []).map(loc => ({
    id: loc.id,
    name: loc.name,
    nameAr: loc.name_ar,
    city: loc.city,
    brand: loc.brand,
    address: loc.address,
    isActive: loc.is_active ?? true,
  }));
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 300000, // Cache for 5 minutes
  });
}
