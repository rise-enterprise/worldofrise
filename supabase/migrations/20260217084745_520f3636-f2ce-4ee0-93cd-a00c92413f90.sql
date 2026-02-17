
CREATE OR REPLACE FUNCTION public.get_branch_visit_counts(brand_filter text DEFAULT NULL)
RETURNS TABLE(branch_name text, visit_count bigint) 
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    last_location AS branch_name,
    COUNT(*) AS visit_count
  FROM contacts
  WHERE last_location IS NOT NULL 
    AND last_location != ''
    AND (brand_filter IS NULL OR last_location ILIKE '%' || brand_filter || '%')
  GROUP BY last_location
  ORDER BY visit_count DESC
  LIMIT 10;
$$;
