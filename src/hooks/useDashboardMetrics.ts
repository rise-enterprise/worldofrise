import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics } from '@/types/loyalty';

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // Fetch total members count
  const { count: totalMembers, error: membersError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  if (membersError) throw membersError;

  // Fetch active members (not blocked)
  const { count: activeMembers, error: activeError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (activeError) throw activeError;

  // Get current month start
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch visits this month
  const { data: monthVisits, error: visitsError } = await supabase
    .from('visits')
    .select('id, brand, location_id, locations(city)')
    .gte('visit_datetime', monthStart)
    .eq('is_voided', false);

  if (visitsError) throw visitsError;

  // Calculate visits by brand
  const visitsByBrand = {
    noir: monthVisits?.filter(v => v.brand === 'noir').length || 0,
    sasso: monthVisits?.filter(v => v.brand === 'sasso').length || 0,
  };

  // Calculate visits by country
  const visitsByCountry = {
    doha: monthVisits?.filter(v => (v.locations as any)?.city === 'doha').length || 0,
    riyadh: monthVisits?.filter(v => (v.locations as any)?.city === 'riyadh').length || 0,
  };

  // Fetch tier distribution
  const { data: tierData, error: tierError } = await supabase
    .from('member_tiers')
    .select(`
      tier_id,
      tiers (
        name
      )
    `);

  if (tierError) throw tierError;

  // Count by tier
  const tierDistribution: Record<string, number> = {
    initiation: 0,
    connoisseur: 0,
    elite: 0,
    'inner-circle': 0,
    black: 0,
  };

  tierData?.forEach(mt => {
    const tierName = (mt.tiers as any)?.name?.toLowerCase().replace(/\s+/g, '-') || 'initiation';
    if (tierName === 'rise-black') {
      tierDistribution['black'] = (tierDistribution['black'] || 0) + 1;
    } else if (tierDistribution[tierName] !== undefined) {
      tierDistribution[tierName]++;
    }
  });

  // Members without tier assignment are in initiation
  const membersWithTiers = tierData?.length || 0;
  tierDistribution['initiation'] += (totalMembers || 0) - membersWithTiers;

  // Calculate churn risk (members who haven't visited in 30+ days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentVisitors, error: recentError } = await supabase
    .from('visits')
    .select('member_id')
    .gte('visit_datetime', thirtyDaysAgo.toISOString())
    .eq('is_voided', false);

  if (recentError) throw recentError;

  const uniqueRecentVisitors = new Set(recentVisitors?.map(v => v.member_id) || []);
  const churnRiskCount = Math.max(0, (totalMembers || 0) - uniqueRecentVisitors.size);

  // VIP guests (black + inner-circle tiers)
  const vipGuestsCount = (tierDistribution['black'] || 0) + (tierDistribution['inner-circle'] || 0);

  return {
    totalMembers: totalMembers || 0,
    activeMembers: activeMembers || 0,
    totalVisitsThisMonth: monthVisits?.length || 0,
    visitsByBrand,
    visitsByCountry,
    tierDistribution,
    churnRiskCount,
    vipGuestsCount,
  };
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5000, // Data considered fresh for 5 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchInterval: 30000, // Background refresh every 30 seconds
  });
}
