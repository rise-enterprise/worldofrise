CREATE OR REPLACE FUNCTION public.get_my_admin_info()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id, name, email, role::text
  FROM public.admins
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1
$$;