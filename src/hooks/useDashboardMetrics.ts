import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics } from '@/types/loyalty';

async function fetchAllColumn(table: string, column: string): Promise<any[]> {
  const PAGE = 1000;
  let all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await (supabase as any)
      .from(table)
      .select(column)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  // Run all count queries in parallel
  const [
    totalRes,
    vipRes,
    churnRes,
    noVisitRes,
    noirRes,
    sassoRes,
    qatarRes,
    dohaRes,
    saudiRes,
    riyadhRes,
  ] = await Promise.all([
    // Total members
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }),
    // VIP count
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).eq('vip', true),
    // Churn: last_visit older than 30 days
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).lt('last_visit', thirtyDaysAgoISO),
    // Churn: no visit at all
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).is('last_visit', null),
    // Brand: noir
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('last_location', '%noir%'),
    // Brand: sasso
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('last_location', '%sasso%'),
    // Region: qatar (country)
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('country', '%qatar%'),
    // Region: doha (city)
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('city', '%doha%'),
    // Region: saudi (country)
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('country', '%saudi%'),
    // Region: riyadh (city)
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('city', '%riyadh%'),
  ]);

  for (const r of [totalRes, vipRes, churnRes, noVisitRes, noirRes, sassoRes, qatarRes, dohaRes, saudiRes, riyadhRes]) {
    if (r.error) throw r.error;
  }

  const totalMembers = totalRes.count ?? 0;
  const vipGuestsCount = vipRes.count ?? 0;
  const churnRiskCount = (churnRes.count ?? 0) + (noVisitRes.count ?? 0);

  // Visits this month: paginate to sum all visits fields
  const visitsRows = await fetchAllColumn('contacts', 'visits, last_visit');
  const totalVisitsThisMonth = visitsRows
    .filter((c: any) => c.last_visit && c.last_visit >= monthStart)
    .reduce((sum: number, c: any) => sum + (c.visits || 0), 0);

  // Tier distribution: paginate loyalty_tier column
  const tierRows = await fetchAllColumn('contacts', 'loyalty_tier');
  const tierDistribution: Record<string, number> = {
    initiation: 0, connoisseur: 0, elite: 0, 'inner-circle': 0, black: 0,
  };
  tierRows.forEach((c: any) => {
    const tier = (c.loyalty_tier || '').toLowerCase().trim();
    if (tier.includes('black')) tierDistribution['black']++;
    else if (tier.includes('inner') || tier.includes('circle')) tierDistribution['inner-circle']++;
    else if (tier.includes('elite')) tierDistribution['elite']++;
    else if (tier.includes('connoisseur')) tierDistribution['connoisseur']++;
    else tierDistribution['initiation']++;
  });

  // Combine region counts (deduplicate by using max of country vs city match)
  const dohaCount = Math.max(qatarRes.count ?? 0, dohaRes.count ?? 0);
  const riyadhCount = Math.max(saudiRes.count ?? 0, riyadhRes.count ?? 0);

  return {
    totalMembers,
    activeMembers: totalMembers,
    totalVisitsThisMonth,
    visitsByBrand: { noir: noirRes.count ?? 0, sasso: sassoRes.count ?? 0 },
    visitsByCountry: { doha: dohaCount, riyadh: riyadhCount },
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
