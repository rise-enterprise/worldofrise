-- Allow members to update their own profile
CREATE POLICY "Members can update own profile"
ON public.members
FOR UPDATE
USING (id = get_member_id(auth.uid()))
WITH CHECK (id = get_member_id(auth.uid()));