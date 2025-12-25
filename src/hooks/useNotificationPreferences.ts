import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationPreferences {
  id: string;
  member_id: string;
  email_events: boolean;
  email_tier_upgrades: boolean;
  email_promotions: boolean;
}

export function useNotificationPreferences(memberId: string | null) {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences", memberId],
    queryFn: async () => {
      if (!memberId) return null;
      
      const { data, error } = await supabase
        .from("member_notification_preferences")
        .select("*")
        .eq("member_id", memberId)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    enabled: !!memberId,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!memberId) throw new Error("No member ID");

      if (preferences) {
        const { error } = await supabase
          .from("member_notification_preferences")
          .update(updates)
          .eq("member_id", memberId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("member_notification_preferences")
          .insert({ member_id: memberId, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", memberId] });
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    },
  });

  return {
    preferences: preferences || {
      email_events: true,
      email_tier_upgrades: true,
      email_promotions: false,
    },
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  };
}
