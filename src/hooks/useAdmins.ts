import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Admin {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'viewer';
  is_active: boolean;
  created_at: string | null;
  last_login_at: string | null;
}

export interface CreateAdminInput {
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'viewer';
}

export interface UpdateAdminInput {
  id: string;
  name?: string;
  role?: 'super_admin' | 'admin' | 'manager' | 'viewer';
  is_active?: boolean;
}

export function useAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Admin[];
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAdminInput) => {
      // Call the invite-admin edge function
      const { data, error } = await supabase.functions.invoke('invite-admin', {
        body: {
          email: input.email,
          name: input.name,
          role: input.role,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Invitation Sent',
        description: 'An invitation email has been sent to the new admin.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAdminInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Admin Updated',
        description: 'Admin user has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('admins')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Admin Deactivated',
        description: 'Admin user has been deactivated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; name: string; role: 'super_admin' | 'admin' | 'manager' | 'viewer' }) => {
      const { data, error } = await supabase.functions.invoke('invite-admin', {
        body: {
          email: input.email,
          name: input.name,
          role: input.role,
          resend: true,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Invitation Resent',
        description: 'A new invitation email has been sent.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAdminPermanently() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-admin', {
        body: { adminId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Admin Deleted',
        description: 'The admin record has been permanently deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
