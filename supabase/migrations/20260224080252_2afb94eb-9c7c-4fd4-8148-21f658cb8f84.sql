
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(brand_filter text DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'totalMembers', COUNT(*),
    'activeMembers', COUNT(*),
    'totalVisitsThisMonth', COUNT(*) FILTER (WHERE last_visit >= date_trunc('month', now())),
    'visitsByBrand', jsonb_build_object(
      'noir', COUNT(*) FILTER (WHERE last_location ILIKE '%noir%'),
      'sasso', COUNT(*) FILTER (WHERE last_location ILIKE '%sasso%')
    ),
    'visitsByCountry', jsonb_build_object(
      'doha', COUNT(*) FILTER (WHERE last_location IS NOT NULL AND last_location NOT ILIKE '%Riyadh%'),
      'riyadh', COUNT(*) FILTER (WHERE last_location ILIKE '%Riyadh%')
    ),
    'tierDistribution', jsonb_build_object(
      'black', COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%black%'),
      'inner-circle', COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%inner%'),
      'elite', COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%elite%'),
      'connoisseur', COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%connoisseur%'),
      'initiation', COUNT(*) - COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%black%') - COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%inner%') - COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%elite%') - COUNT(*) FILTER (WHERE loyalty_tier ILIKE '%connoisseur%')
    ),
    'churnRiskCount', COUNT(*) FILTER (WHERE last_visit < (now() - interval '30 days') OR last_visit IS NULL),
    'vipGuestsCount', COUNT(*) FILTER (WHERE vip = true)
  )
  FROM contacts
  WHERE (brand_filter IS NULL OR last_location ILIKE '%' || brand_filter || '%');
$$;
