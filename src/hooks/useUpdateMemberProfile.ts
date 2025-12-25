import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UpdateMemberProfileInput {
  full_name?: string;
  email?: string;
  phone?: string;
  city?: 'doha' | 'riyadh';
  brand_affinity?: 'noir' | 'sasso' | 'both';
  preferred_language?: 'ar' | 'en';
  avatar_url?: string;
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

  const updateData: Record<string, any> = {};
  if (updates.full_name !== undefined) updateData.full_name = updates.full_name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.city !== undefined) updateData.city = updates.city;
  if (updates.brand_affinity !== undefined) updateData.brand_affinity = updates.brand_affinity;
  if (updates.preferred_language !== undefined) updateData.preferred_language = updates.preferred_language;
  if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;

  const { data, error } = await supabase
    .from('members')
    .update(updateData)
    .eq('id', memberAuth.member_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadMemberAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl;
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

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const updateProfile = useUpdateMemberProfile();

  return useMutation({
    mutationFn: async (file: File) => {
      const avatarUrl = await uploadMemberAvatar(file);
      await updateProfile.mutateAsync({ avatar_url: avatarUrl });
      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
  });
}
