import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type InvitationRequest = Database['public']['Tables']['invitation_requests']['Row'];
type RejectedRequest = Database['public']['Tables']['rejected_invitation_requests']['Row'];

export interface ConfirmInvitationInput {
  requestId: string;
  adminId: string;
}

export interface RejectInvitationInput {
  requestId: string;
  rejectionReason: string;
  adminId: string;
}

export function useInvitationRequests() {
  return useQuery({
    queryKey: ['invitation-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvitationRequest[];
    },
  });
}

export function useRejectedRequests() {
  return useQuery({
    queryKey: ['rejected-invitation-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rejected_invitation_requests')
        .select('*')
        .order('rejected_at', { ascending: false });

      if (error) throw error;
      return data as RejectedRequest[];
    },
  });
}

export function useConfirmInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, adminId }: ConfirmInvitationInput) => {
      // Fetch the invitation request
      const { data: request, error: fetchError } = await supabase
        .from('invitation_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) throw fetchError || new Error('Request not found');

      // Create the member record
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          full_name: request.full_name,
          email: request.email,
          phone: request.phone || '',
          brand_affinity: request.preferred_brand || 'both',
          notes: request.message || undefined,
          created_by: adminId,
          city: 'doha', // Default city
        });

      if (memberError) throw memberError;

      // Update invitation request status
      const { error: updateError } = await supabase
        .from('invitation_requests')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      return request;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ['invitation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Invitation Confirmed',
        description: `${request.full_name} has been added as a member.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to confirm invitation',
        variant: 'destructive',
      });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, rejectionReason, adminId }: RejectInvitationInput) => {
      // Fetch the invitation request
      const { data: request, error: fetchError } = await supabase
        .from('invitation_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) throw fetchError || new Error('Request not found');

      // Insert into rejected_invitation_requests
      const { error: rejectError } = await supabase
        .from('rejected_invitation_requests')
        .insert({
          original_request_id: requestId,
          full_name: request.full_name,
          email: request.email,
          phone: request.phone,
          preferred_brand: request.preferred_brand,
          referral_source: request.referral_source,
          message: request.message,
          rejection_reason: rejectionReason,
          rejected_by: adminId,
        });

      if (rejectError) throw rejectError;

      // Update invitation request status
      const { error: updateError } = await supabase
        .from('invitation_requests')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      return request;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ['invitation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['rejected-invitation-requests'] });
      toast({
        title: 'Request Rejected',
        description: `${request.full_name}'s request has been declined.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject invitation',
        variant: 'destructive',
      });
    },
  });
}

export function useReconsiderRejection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rejectedId, adminId }: { rejectedId: string; adminId: string }) => {
      // Fetch the rejected request
      const { data: rejectedRequest, error: fetchError } = await supabase
        .from('rejected_invitation_requests')
        .select('*')
        .eq('id', rejectedId)
        .single();

      if (fetchError || !rejectedRequest) throw fetchError || new Error('Rejected request not found');

      // Create the member record
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          full_name: rejectedRequest.full_name,
          email: rejectedRequest.email,
          phone: rejectedRequest.phone || '',
          brand_affinity: rejectedRequest.preferred_brand || 'both',
          notes: rejectedRequest.message || undefined,
          created_by: adminId,
          city: 'doha',
        });

      if (memberError) throw memberError;

      // Update rejected request
      const { error: updateError } = await supabase
        .from('rejected_invitation_requests')
        .update({
          can_reconsider: false,
          reconsidered_at: new Date().toISOString(),
          reconsidered_by: adminId,
        })
        .eq('id', rejectedId);

      if (updateError) throw updateError;

      // Update original invitation request if exists
      if (rejectedRequest.original_request_id) {
        await supabase
          .from('invitation_requests')
          .update({
            status: 'approved',
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', rejectedRequest.original_request_id);
      }

      return rejectedRequest;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ['invitation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['rejected-invitation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Member Added',
        description: `${request.full_name} has been reconsidered and added as a member.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reconsider rejection',
        variant: 'destructive',
      });
    },
  });
}
