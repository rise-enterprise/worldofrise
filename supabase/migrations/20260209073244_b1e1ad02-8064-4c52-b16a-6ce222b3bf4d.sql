-- Create rejected_invitation_requests table
CREATE TABLE IF NOT EXISTS public.rejected_invitation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_request_id uuid REFERENCES public.invitation_requests(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  preferred_brand public.brand_type,
  referral_source text,
  message text,
  rejection_reason text NOT NULL,
  rejected_by uuid REFERENCES public.admins(id),
  rejected_at timestamptz DEFAULT now(),
  can_reconsider boolean DEFAULT true,
  reconsidered_at timestamptz,
  reconsidered_by uuid REFERENCES public.admins(id)
);

-- Enable RLS
ALTER TABLE public.rejected_invitation_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for rejected requests
CREATE POLICY "Admins can view rejected requests"
ON public.rejected_invitation_requests
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage rejected requests"
ON public.rejected_invitation_requests
FOR ALL
USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));