-- Insert superuser admin for ibrahim@rise.qa
INSERT INTO public.admins (user_id, email, name, role, is_active)
VALUES (
  '3efc4a20-8d48-4bc3-bab6-d46973e00d79',
  'ibrahim@rise.qa',
  'Ibrahim',
  'super_admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;

-- Add RLS policy for members to view their own data
CREATE POLICY "Members can view own member data"
ON public.members
FOR SELECT
USING (
  id = get_member_id(auth.uid())
);

-- Add RLS policy for members to view their own visits
CREATE POLICY "Members can view own visits"
ON public.visits
FOR SELECT
USING (
  member_id = get_member_id(auth.uid())
);

-- Add RLS policy for members to view their own tiers
CREATE POLICY "Members can view own tier"
ON public.member_tiers
FOR SELECT
USING (
  member_id = get_member_id(auth.uid())
);

-- Add RLS policy for members to view tiers info
CREATE POLICY "Members can view tiers"
ON public.tiers
FOR SELECT
USING (is_member(auth.uid()));