-- Create function to automatically update member tier based on total_visits
CREATE OR REPLACE FUNCTION public.update_member_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tier_id uuid;
BEGIN
  -- Find the appropriate tier based on total_visits
  SELECT id INTO new_tier_id
  FROM tiers
  WHERE is_active = true
    AND NEW.total_visits >= min_visits
  ORDER BY min_visits DESC
  LIMIT 1;

  -- If we found a tier, upsert the member_tier record
  IF new_tier_id IS NOT NULL THEN
    INSERT INTO member_tiers (member_id, tier_id, assigned_at)
    VALUES (NEW.id, new_tier_id, now())
    ON CONFLICT (member_id) 
    DO UPDATE SET 
      tier_id = EXCLUDED.tier_id,
      assigned_at = now()
    WHERE member_tiers.tier_id != EXCLUDED.tier_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to fire when total_visits changes
CREATE TRIGGER trigger_update_member_tier
AFTER INSERT OR UPDATE OF total_visits ON members
FOR EACH ROW
EXECUTE FUNCTION update_member_tier();