-- ==============================================
-- RISE LOYALTY ADMIN DASHBOARD - COMPLETE SCHEMA
-- ==============================================

-- 1) ENUM TYPES
-- ==============================================

-- Admin roles enum
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'manager', 'viewer');

-- Brand enum
CREATE TYPE public.brand_type AS ENUM ('noir', 'sasso', 'both');

-- Country/City enum
CREATE TYPE public.location_city AS ENUM ('doha', 'riyadh');

-- Language preference
CREATE TYPE public.language_pref AS ENUM ('ar', 'en');

-- Member status
CREATE TYPE public.member_status AS ENUM ('active', 'blocked');

-- Visit source
CREATE TYPE public.visit_source AS ENUM ('manual', 'qr', 'pos', 'import');

-- Points reference type
CREATE TYPE public.points_ref_type AS ENUM ('visit', 'redemption', 'manual', 'import', 'campaign', 'birthday', 'bonus');

-- Redemption status
CREATE TYPE public.redemption_status AS ENUM ('requested', 'approved', 'declined', 'fulfilled', 'cancelled');

-- Campaign status
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');

-- Audit action types
CREATE TYPE public.audit_action AS ENUM (
  'create', 'update', 'delete', 'login', 'logout', 'export', 'import',
  'approve', 'decline', 'fulfill', 'cancel', 'block', 'unblock', 'merge',
  'tier_override', 'points_adjust', 'password_change', 'role_change'
);

-- ==============================================
-- 2) LOCATIONS TABLE (referenced by others)
-- ==============================================

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  city location_city NOT NULL,
  brand brand_type NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================
-- 3) ADMINS TABLE (with roles)
-- ==============================================

CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role admin_role NOT NULL DEFAULT 'viewer',
  brand_scope brand_type,
  location_scope UUID REFERENCES public.locations(id),
  is_active BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  last_login_at TIMESTAMPTZ,
  session_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================
-- 4) MEMBERS TABLE (Core CRM)
-- ==============================================

CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  city location_city NOT NULL DEFAULT 'doha',
  preferred_language language_pref DEFAULT 'ar',
  brand_affinity brand_type DEFAULT 'both',
  status member_status DEFAULT 'active',
  notes TEXT,
  total_visits INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admins(id)
);

CREATE INDEX idx_members_phone ON public.members(phone);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_members_city ON public.members(city);
CREATE INDEX idx_members_status ON public.members(status);

-- ==============================================
-- 5) TIERS TABLE
-- ==============================================

CREATE TABLE public.tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  min_visits INTEGER NOT NULL DEFAULT 0,
  min_points INTEGER DEFAULT 0,
  benefits_text_en TEXT,
  benefits_text_ar TEXT,
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================
-- 6) MEMBER TIERS (Current tier assignment)
-- ==============================================

CREATE TABLE public.member_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES public.tiers(id) ON DELETE RESTRICT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES public.admins(id),
  override_flag BOOLEAN DEFAULT false,
  override_reason TEXT,
  UNIQUE(member_id)
);

-- ==============================================
-- 7) VISITS TABLE
-- ==============================================

CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  brand brand_type NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  visit_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  source visit_source DEFAULT 'manual',
  notes TEXT,
  is_voided BOOLEAN DEFAULT false,
  void_reason TEXT,
  voided_by UUID REFERENCES public.admins(id),
  voided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admins(id)
);

CREATE INDEX idx_visits_member ON public.visits(member_id);
CREATE INDEX idx_visits_datetime ON public.visits(visit_datetime);
CREATE INDEX idx_visits_brand ON public.visits(brand);

-- ==============================================
-- 8) POINTS LEDGER
-- ==============================================

CREATE TABLE public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  points_delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type points_ref_type NOT NULL,
  reference_id UUID,
  balance_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admins(id)
);

CREATE INDEX idx_points_member ON public.points_ledger(member_id);
CREATE INDEX idx_points_created ON public.points_ledger(created_at);

-- ==============================================
-- 9) REWARDS CATALOG
-- ==============================================

CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  points_cost INTEGER NOT NULL,
  brand_scope brand_type DEFAULT 'both',
  validity_start DATE,
  validity_end DATE,
  is_active BOOLEAN DEFAULT true,
  stock_limit INTEGER,
  per_member_limit INTEGER DEFAULT 1,
  terms_en TEXT,
  terms_ar TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admins(id)
);

CREATE INDEX idx_rewards_active ON public.rewards(is_active);
CREATE INDEX idx_rewards_brand ON public.rewards(brand_scope);

-- ==============================================
-- 10) REDEMPTIONS
-- ==============================================

CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE RESTRICT NOT NULL,
  points_spent INTEGER NOT NULL,
  status redemption_status DEFAULT 'requested',
  code_or_qr TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.admins(id),
  declined_at TIMESTAMPTZ,
  declined_by UUID REFERENCES public.admins(id),
  decline_reason TEXT,
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES public.admins(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES public.admins(id),
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_redemptions_member ON public.redemptions(member_id);
CREATE INDEX idx_redemptions_status ON public.redemptions(status);

-- ==============================================
-- 11) CAMPAIGNS
-- ==============================================

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  segment_rules_json JSONB DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  bonus_points_rules JSONB DEFAULT '{}',
  message_en TEXT,
  message_ar TEXT,
  status campaign_status DEFAULT 'draft',
  members_reached INTEGER DEFAULT 0,
  visits_generated INTEGER DEFAULT 0,
  points_issued INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.admins(id)
);

CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- ==============================================
-- 12) AUDIT LOGS (Full trail)
-- ==============================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admins(id),
  action_type audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_admin ON public.audit_logs(admin_id);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at);

-- ==============================================
-- 13) SETTINGS TABLE (Key-Value)
-- ==============================================

CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.admins(id)
);

-- ==============================================
-- 14) POINTS RULES TABLE
-- ==============================================

CREATE TABLE public.points_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand brand_type,
  points_per_visit INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================
-- 15) ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_rules ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 16) SECURITY DEFINER FUNCTIONS FOR RLS
-- ==============================================

-- Check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = _user_id AND is_active = true
  )
$$;

-- Get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id UUID)
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admins
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

-- Get admin ID from user ID
CREATE OR REPLACE FUNCTION public.get_admin_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.admins
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

-- Check if admin has role
CREATE OR REPLACE FUNCTION public.admin_has_role(_user_id UUID, _roles admin_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = _user_id 
      AND is_active = true 
      AND role = ANY(_roles)
  )
$$;

-- ==============================================
-- 17) RLS POLICIES
-- ==============================================

-- Locations: all admins can read, super_admin can modify
CREATE POLICY "Admins can view locations" ON public.locations
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage locations" ON public.locations
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]));

-- Admins: admins can view their own, super_admin can manage all
CREATE POLICY "Admins can view admins" ON public.admins
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admins" ON public.admins
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]));

-- Members: all admins can read, admin+ can modify
CREATE POLICY "Admins can view members" ON public.members
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage members" ON public.members
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role, 'manager'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role, 'manager'::admin_role]));

-- Tiers: all admins can read, super_admin can modify
CREATE POLICY "Admins can view tiers" ON public.tiers
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage tiers" ON public.tiers
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]));

-- Member tiers: all admins can read, admin+ can modify
CREATE POLICY "Admins can view member tiers" ON public.member_tiers
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage member tiers" ON public.member_tiers
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Visits: all admins can read, admin+ can modify
CREATE POLICY "Admins can view visits" ON public.visits
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage visits" ON public.visits
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role, 'manager'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role, 'manager'::admin_role]));

-- Points ledger: all admins can read, admin+ can modify
CREATE POLICY "Admins can view points" ON public.points_ledger
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage points" ON public.points_ledger
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Rewards: all admins can read, admin+ can modify
CREATE POLICY "Admins can view rewards" ON public.rewards
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage rewards" ON public.rewards
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Redemptions: all admins can read, admin+ can modify
CREATE POLICY "Admins can view redemptions" ON public.redemptions
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage redemptions" ON public.redemptions
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role, 'manager'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role, 'manager'::admin_role]));

-- Campaigns: all admins can read, admin+ can modify
CREATE POLICY "Admins can view campaigns" ON public.campaigns
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Audit logs: all admins can read, no one can modify/delete
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Settings: all admins can read, super_admin can modify
CREATE POLICY "Admins can view settings" ON public.settings
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage settings" ON public.settings
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]));

-- Points rules: all admins can read, super_admin can modify
CREATE POLICY "Admins can view points rules" ON public.points_rules
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage points rules" ON public.points_rules
  FOR ALL TO authenticated
  USING (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]))
  WITH CHECK (public.admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]));

-- ==============================================
-- 18) TRIGGERS FOR UPDATED_AT
-- ==============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tiers_updated_at BEFORE UPDATE ON public.tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_points_rules_updated_at BEFORE UPDATE ON public.points_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 19) INSERT DEFAULT DATA
-- ==============================================

-- Default locations
INSERT INTO public.locations (name, name_ar, city, brand, address) VALUES
  ('Old Port', 'الميناء القديم', 'doha', 'noir', 'Mina District, Doha'),
  ('West Walk', 'ويست ووك', 'doha', 'noir', 'West Walk, Lusail'),
  ('Al Hazm', 'الحزم', 'doha', 'noir', 'Al Hazm Mall, Doha'),
  ('Msheireb', 'مشيرب', 'doha', 'sasso', 'Msheireb Downtown, Doha'),
  ('Laysen Valley', 'وادي ليسن', 'riyadh', 'sasso', 'Laysen Valley, Riyadh');

-- Default tiers
INSERT INTO public.tiers (name, name_ar, min_visits, min_points, benefits_text_en, benefits_text_ar, color, sort_order) VALUES
  ('Bronze', 'برونزي', 0, 0, 'Welcome tier with basic benefits', 'فئة الترحيب مع المزايا الأساسية', '#CD7F32', 1),
  ('Silver', 'فضي', 5, 50, '10% discount on all drinks', 'خصم 10% على جميع المشروبات', '#C0C0C0', 2),
  ('Gold', 'ذهبي', 15, 150, '15% discount + priority seating', 'خصم 15% + أولوية الجلوس', '#FFD700', 3),
  ('Platinum', 'بلاتيني', 30, 300, '20% discount + exclusive events + free monthly drink', 'خصم 20% + فعاليات حصرية + مشروب مجاني شهري', '#E5E4E2', 4),
  ('Black', 'أسود', 50, 500, 'VIP access + 25% discount + personal concierge + birthday special', 'وصول VIP + خصم 25% + كونسيرج شخصي + هدية عيد الميلاد', '#1a1a1a', 5);

-- Default points rules
INSERT INTO public.points_rules (name, brand, points_per_visit) VALUES
  ('Noir Standard', 'noir', 10),
  ('SASSO Standard', 'sasso', 10),
  ('Global Bonus', 'both', 15);

-- Default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('language_default', '"ar"', 'Default language for the system'),
  ('branding_active', '{"rise": true, "noir": true, "sasso": true}', 'Active branding toggles'),
  ('daily_manual_points_limit', '500', 'Maximum manual points adjustment per admin per day'),
  ('require_approval_points_threshold', '100', 'Points threshold requiring approval'),
  ('session_timeout_minutes', '60', 'Admin session timeout in minutes'),
  ('allowed_email_domains', '["rise.qa", "noir.qa", "sasso.qa"]', 'Allowed email domains for admin signup'),
  ('ip_whitelist_enabled', 'false', 'Enable IP whitelist for admin access'),
  ('ip_whitelist', '[]', 'List of allowed IP addresses'),
  ('terms_conditions_en', '"Terms and conditions for RISE Loyalty program..."', 'Terms & Conditions in English'),
  ('terms_conditions_ar', '"الشروط والأحكام لبرنامج ولاء RISE..."', 'Terms & Conditions in Arabic'),
  ('privacy_policy_en', '"Privacy Policy for RISE Loyalty program..."', 'Privacy Policy in English'),
  ('privacy_policy_ar', '"سياسة الخصوصية لبرنامج ولاء RISE..."', 'Privacy Policy in Arabic');