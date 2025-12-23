-- Create a function to check if email is an active admin (safe for public use)
CREATE OR REPLACE FUNCTION public.check_admin_email(admin_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE email = LOWER(admin_email) AND is_active = true
  )
$$;