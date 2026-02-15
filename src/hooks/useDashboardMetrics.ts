import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics } from '@/types/loyalty';

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // Fetch all contacts (up to 1000)
  const { data: contacts, error: contactsError } = await (supabase as any)
    .from('contacts')
    .select('id, vip, visits, loyalty_tier, loyalty_rank, last_visit, last_location, city, country, total_spend');

  if (contactsError) throw contactsError;

  const allContacts = contacts ?? [];

  const totalMembers = allContacts.length;

  // Count total contacts (exact)
  const { count: exactTotal, error: countError } = await (supabase as any)
    .from('contacts')
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;

  const totalCount = exactTotal ?? totalMembers;

  // Visits this month: sum of visits field from contacts with last_visit this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const totalVisitsThisMonth = allContacts
    .filter((c: any) => c.last_visit && new Date(c.last_visit) >= monthStart)
    .reduce((sum: number, c: any) => sum + (c.visits || 0), 0);

  // VIP count
  const vipGuestsCount = allContacts.filter((c: any) => c.vip).length;

  // Churn risk: contacts with last_visit older than 30 days or no visit
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const churnRiskCount = allContacts.filter((c: any) => 
    !c.last_visit || new Date(c.last_visit) < thirtyDaysAgo
  ).length;

  // Tier distribution from loyalty_tier field
  const tierDistribution: Record<string, number> = {
    initiation: 0,
    connoisseur: 0,
    elite: 0,
    'inner-circle': 0,
    black: 0,
  };

  allContacts.forEach((c: any) => {
    const tier = (c.loyalty_tier || '').toLowerCase().trim();
    if (tier.includes('black')) tierDistribution['black']++;
    else if (tier.includes('inner') || tier.includes('circle')) tierDistribution['inner-circle']++;
    else if (tier.includes('elite')) tierDistribution['elite']++;
    else if (tier.includes('connoisseur')) tierDistribution['connoisseur']++;
    else tierDistribution['initiation']++;
  });

  // Brand metrics from last_location
  const visitsByBrand = {
    noir: allContacts.filter((c: any) => (c.last_location || '').toLowerCase().includes('noir')).length,
    sasso: allContacts.filter((c: any) => (c.last_location || '').toLowerCase().includes('sasso')).length,
  };

  // Country metrics from country field
  const visitsByCountry = {
    doha: allContacts.filter((c: any) => (c.country || '').toLowerCase().includes('qatar') || (c.city || '').toLowerCase().includes('doha')).length,
    riyadh: allContacts.filter((c: any) => (c.country || '').toLowerCase().includes('saudi') || (c.city || '').toLowerCase().includes('riyadh')).length,
  };

  return {
    totalMembers: totalCount,
    activeMembers: totalCount,
    totalVisitsThisMonth,
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
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}
