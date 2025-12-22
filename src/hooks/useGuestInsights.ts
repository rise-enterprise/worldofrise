import { useState } from 'react';
import { Guest, GuestInsight } from '@/types/loyalty';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useGuestInsights() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<GuestInsight | null>(null);
  const { toast } = useToast();

  const generateInsights = async (guest: Guest) => {
    setLoading(true);
    setInsight(null);

    try {
      // Transform guest data for the edge function
      const guestData = {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        country: guest.country,
        tier: guest.tier,
        totalVisits: guest.totalVisits,
        lifetimeVisits: guest.lifetimeVisits,
        lastVisit: guest.lastVisit.toISOString(),
        joinedAt: guest.joinedAt.toISOString(),
        favoriteBrand: guest.favoriteBrand,
        visits: guest.visits.map(v => ({
          date: v.date.toISOString(),
          brand: v.brand,
          country: v.country,
          location: v.location,
        })),
        tags: guest.tags,
      };

      const { data, error } = await supabase.functions.invoke('guest-insights', {
        body: { guest: guestData },
      });

      if (error) {
        throw error;
      }

      setInsight(data as GuestInsight);
      
      toast({
        title: 'Insights Generated',
        description: `AI analysis complete for ${guest.name}`,
      });

      return data as GuestInsight;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearInsight = () => {
    setInsight(null);
  };

  return {
    loading,
    insight,
    generateInsights,
    clearInsight,
  };
}
