import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics } from '@/types/loyalty';

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  const [
    totalRes,
    vipRes,
    churnOldRes,
    churnNullRes,
    visitsMonthRes,
    noirRes,
    sassoRes,
    qatarRes,
    dohaRes,
    saudiRes,
    riyadhRes,
    blackRes,
    innerRes,
    eliteRes,
    connoisseurRes,
  ] = await Promise.all([
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).eq('vip', true),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).lt('last_visit', thirtyDaysAgoISO),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).is('last_visit', null),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).gte('last_visit', monthStart),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('last_location', '%noir%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('last_location', '%sasso%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('country', '%qatar%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('city', '%doha%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('country', '%saudi%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('city', '%riyadh%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%black%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%inner%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%elite%'),
    (supabase as any).from('contacts').select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%connoisseur%'),
  ]);

  for (const r of [totalRes, vipRes, churnOldRes, churnNullRes, visitsMonthRes, noirRes, sassoRes, qatarRes, dohaRes, saudiRes, riyadhRes, blackRes, innerRes, eliteRes, connoisseurRes]) {
    if (r.error) throw r.error;
  }

  const totalMembers = totalRes.count ?? 0;
  const blackCount = blackRes.count ?? 0;
  const innerCount = innerRes.count ?? 0;
  const eliteCount = eliteRes.count ?? 0;
  const connoisseurCount = connoisseurRes.count ?? 0;
  const initiationCount = totalMembers - blackCount - innerCount - eliteCount - connoisseurCount;

  const dohaCount = Math.max(qatarRes.count ?? 0, dohaRes.count ?? 0);
  const riyadhCount = Math.max(saudiRes.count ?? 0, riyadhRes.count ?? 0);

  return {
    totalMembers,
    activeMembers: totalMembers,
    totalVisitsThisMonth: visitsMonthRes.count ?? 0,
    visitsByBrand: { noir: noirRes.count ?? 0, sasso: sassoRes.count ?? 0 },
    visitsByCountry: { doha: dohaCount, riyadh: riyadhCount },
    tierDistribution: {
      initiation: initiationCount,
      connoisseur: connoisseurCount,
      elite: eliteCount,
      'inner-circle': innerCount,
      black: blackCount,
    },
    churnRiskCount: (churnOldRes.count ?? 0) + (churnNullRes.count ?? 0),
    vipGuestsCount: vipRes.count ?? 0,
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
