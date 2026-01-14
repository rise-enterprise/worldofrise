import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Experience {
  id: string;
  title: string;
  titleArabic: string | null;
  description: string | null;
  descriptionArabic: string | null;
  date: string;
  time: string;
  location: string;
  capacity: number;
  spotsLeft: number;
  tier: 'crystal' | 'onyx' | 'obsidian' | 'royal';
  brand: 'noir' | 'sasso' | 'both';
  category: 'dinner' | 'tasting' | 'chefs_table' | 'gala';
  imageUrl: string | null;
  isInviteOnly: boolean;
}

export interface MemberEvent {
  id: string;
  title: string;
  titleArabic: string | null;
  date: Date;
  time: string;
  location: string;
  brand: 'noir' | 'sasso' | 'both';
  tier: string;
  capacity: number;
  registered: number;
  description: string | null;
  isRegistered: boolean;
}

async function fetchExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('status', 'upcoming')
    .order('experience_date', { ascending: true });

  if (error) throw error;

  return (data || []).map(exp => {
    // Parse date and time
    const dateTime = exp.experience_date ? new Date(exp.experience_date) : new Date();
    const time = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Determine tier from tier_requirement array
    const tierReq = exp.tier_requirement?.[0]?.toLowerCase() || 'crystal';
    let tier: 'crystal' | 'onyx' | 'obsidian' | 'royal' = 'crystal';
    if (tierReq.includes('royal') || tierReq.includes('black')) tier = 'royal';
    else if (tierReq.includes('obsidian') || tierReq.includes('platinum')) tier = 'obsidian';
    else if (tierReq.includes('onyx') || tierReq.includes('gold')) tier = 'onyx';

    // Determine category from experience_type
    let category: 'dinner' | 'tasting' | 'chefs_table' | 'gala' = 'dinner';
    const expType = (exp.experience_type || '').toLowerCase();
    if (expType.includes('tasting')) category = 'tasting';
    else if (expType.includes('chef')) category = 'chefs_table';
    else if (expType.includes('gala')) category = 'gala';

    return {
      id: exp.id,
      title: exp.title_en,
      titleArabic: exp.title_ar,
      description: exp.description_en,
      descriptionArabic: exp.description_ar,
      date: exp.experience_date || new Date().toISOString(),
      time,
      location: 'RISE Private Venue', // Default location
      capacity: exp.capacity || 30,
      spotsLeft: exp.capacity || 30, // TODO: Calculate from invitations
      tier,
      brand: (exp.brand as 'noir' | 'sasso' | 'both') || 'both',
      category,
      imageUrl: exp.image_url,
      isInviteOnly: exp.is_invite_only || false,
    };
  });
}

async function fetchMemberEvents(): Promise<MemberEvent[]> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('status', 'upcoming')
    .order('experience_date', { ascending: true });

  if (error) throw error;

  return (data || []).map(exp => {
    const dateTime = exp.experience_date ? new Date(exp.experience_date) : new Date();
    const time = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const tierReq = exp.tier_requirement?.[0] || 'Crystal';

    return {
      id: exp.id,
      title: exp.title_en,
      titleArabic: exp.title_ar,
      date: dateTime,
      time,
      location: 'RISE Private Venue',
      brand: (exp.brand as 'noir' | 'sasso' | 'both') || 'both',
      tier: tierReq + '+',
      capacity: exp.capacity || 30,
      registered: 0, // TODO: Calculate from invitations
      description: exp.description_en,
      isRegistered: false, // TODO: Check member's invitations
    };
  });
}

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: fetchExperiences,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMemberEvents() {
  return useQuery({
    queryKey: ['member-events'],
    queryFn: fetchMemberEvents,
    staleTime: 1000 * 60 * 5,
  });
}
