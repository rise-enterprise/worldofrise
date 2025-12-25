import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UpdateMemberProfileInput {
  full_name?: string;
  email?: string;
  phone?: string;
  city?: 'doha' | 'riyadh';
  brand_affinity?: 'noir' | 'sasso' | 'both';
  preferred_language?: 'ar' | 'en';
}

async function updateMemberProfile(updates: UpdateMemberProfileInput) {
  // Get current user's member_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: memberAuth, error: authError } = await supabase
    .from('member_auth')
    .select('member_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (authError) throw authError;
  if (!memberAuth?.member_id) throw new Error('Member not found');

  const { data, error } = await supabase
    .from('members')
    .update({
      full_name: updates.full_name,
      email: updates.email,
      phone: updates.phone,
      city: updates.city,
      brand_affinity: updates.brand_affinity,
      preferred_language: updates.preferred_language,
    })
    .eq('id', memberAuth.member_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
  });
}
