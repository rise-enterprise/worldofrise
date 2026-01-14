-- Experiences (events reimagined as private invitations)
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  brand public.brand_type,
  experience_type TEXT, -- 'chefs_table', 'tasting_ritual', 'private_lounge', 'limited_drop'
  capacity INTEGER,
  experience_date TIMESTAMPTZ,
  image_url TEXT,
  tier_requirement TEXT[], -- which tiers can access
  is_invite_only BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Member Experience Invitations
CREATE TABLE public.experience_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, attended
  invited_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  UNIQUE(member_id, experience_id)
);

-- Brand-specific circles (tiers per brand)
CREATE TABLE public.brand_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand public.brand_type NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  display_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  min_visits INTEGER DEFAULT 0,
  privileges_en TEXT[],
  privileges_ar TEXT[],
  color TEXT,
  is_invite_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Member brand circles (members can have different circles per brand)
CREATE TABLE public.member_brand_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  brand_circle_id UUID NOT NULL REFERENCES public.brand_circles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, brand_circle_id)
);

-- Invitation requests (for new members seeking access)
CREATE TABLE public.invitation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_brand public.brand_type,
  referral_source TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, declined
  reviewed_by UUID REFERENCES public.admins(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_brand_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_requests ENABLE ROW LEVEL SECURITY;

-- Experiences: Viewable by authenticated users
CREATE POLICY "Experiences are viewable by authenticated users"
ON public.experiences FOR SELECT
USING (auth.role() = 'authenticated');

-- Experiences: Only admins can manage
CREATE POLICY "Admins can manage experiences"
ON public.experiences FOR ALL
USING (public.is_admin(auth.uid()));

-- Experience Invitations: Members can view their own
CREATE POLICY "Members can view their own invitations"
ON public.experience_invitations FOR SELECT
USING (member_id IN (SELECT id FROM public.members WHERE id = member_id AND EXISTS (SELECT 1 FROM public.member_auth WHERE member_auth.member_id = members.id AND member_auth.user_id = auth.uid())));

-- Experience Invitations: Members can update their own (accept/decline)
CREATE POLICY "Members can respond to their invitations"
ON public.experience_invitations FOR UPDATE
USING (member_id IN (SELECT id FROM public.members WHERE id = member_id AND EXISTS (SELECT 1 FROM public.member_auth WHERE member_auth.member_id = members.id AND member_auth.user_id = auth.uid())));

-- Experience Invitations: Admins can manage all
CREATE POLICY "Admins can manage experience invitations"
ON public.experience_invitations FOR ALL
USING (public.is_admin(auth.uid()));

-- Brand Circles: Viewable by everyone (public info about tiers)
CREATE POLICY "Brand circles are publicly viewable"
ON public.brand_circles FOR SELECT
USING (true);

-- Brand Circles: Only admins can manage
CREATE POLICY "Admins can manage brand circles"
ON public.brand_circles FOR ALL
USING (public.is_admin(auth.uid()));

-- Member Brand Circles: Members can view their own
CREATE POLICY "Members can view their own circles"
ON public.member_brand_circles FOR SELECT
USING (member_id IN (SELECT id FROM public.members WHERE id = member_id AND EXISTS (SELECT 1 FROM public.member_auth WHERE member_auth.member_id = members.id AND member_auth.user_id = auth.uid())));

-- Member Brand Circles: Admins can manage
CREATE POLICY "Admins can manage member circles"
ON public.member_brand_circles FOR ALL
USING (public.is_admin(auth.uid()));

-- Invitation Requests: Anyone can insert (request access)
CREATE POLICY "Anyone can request an invitation"
ON public.invitation_requests FOR INSERT
WITH CHECK (true);

-- Invitation Requests: Users can view their own by email
CREATE POLICY "Users can view their own requests"
ON public.invitation_requests FOR SELECT
USING (true);

-- Invitation Requests: Admins can manage
CREATE POLICY "Admins can manage invitation requests"
ON public.invitation_requests FOR ALL
USING (public.is_admin(auth.uid()));

-- Seed initial brand circles (NOIR)
INSERT INTO public.brand_circles (brand, name, name_ar, display_name, sort_order, min_visits, privileges_en, color, is_invite_only) VALUES
('noir', 'society', 'المجتمع', 'Noir Society', 1, 1, ARRAY['Welcome ritual', 'Priority seating', 'Birthday acknowledgment'], '#A7B0BF', false),
('noir', 'reserve', 'الاحتياطي', 'Noir Reserve', 2, 5, ARRAY['Private tasting sessions', 'Early access to drops', 'Exclusive events'], '#C8A24A', false),
('noir', 'obsidian', 'السبج', 'Noir Obsidian', 3, 15, ARRAY['Chef''s table access', 'Personal concierge', 'Bespoke experiences', 'Annual gift'], '#07080A', true);

-- Seed initial brand circles (SASSO)
INSERT INTO public.brand_circles (brand, name, name_ar, display_name, sort_order, min_visits, privileges_en, color, is_invite_only) VALUES
('sasso', 'tavola', 'الطاولة', 'Sasso Tavola', 1, 1, ARRAY['Welcome aperitivo', 'Priority reservations', 'Chef greeting'], '#A7B0BF', false),
('sasso', 'maestro', 'المايسترو', 'Sasso Maestro', 2, 5, ARRAY['Wine pairing sessions', 'Kitchen tours', 'Seasonal previews'], '#C8A24A', false),
('sasso', 'imperium', 'الإمبراطورية', 'Sasso Imperium', 3, 15, ARRAY['Private dining room', 'Personal sommelier', 'Culinary journeys', 'Annual celebration'], '#4A0F18', true);

-- Add updated_at trigger for experiences
CREATE TRIGGER update_experiences_updated_at
BEFORE UPDATE ON public.experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();