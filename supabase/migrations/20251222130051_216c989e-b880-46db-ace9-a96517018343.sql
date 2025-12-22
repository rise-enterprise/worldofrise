-- Create member_auth table to link auth.users to members via phone
CREATE TABLE public.member_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(phone)
);

-- Enable RLS
ALTER TABLE public.member_auth ENABLE ROW LEVEL SECURITY;

-- Members can view their own auth record
CREATE POLICY "Members can view own auth"
ON public.member_auth
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert auth records during signup
CREATE POLICY "System can insert auth"
ON public.member_auth
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_member_auth_updated_at
  BEFORE UPDATE ON public.member_auth
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user is a member
CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.member_auth
    WHERE user_id = _user_id
  )
$$;

-- Create function to get member_id from user_id
CREATE OR REPLACE FUNCTION public.get_member_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT member_id FROM public.member_auth
  WHERE user_id = _user_id
  LIMIT 1
$$;