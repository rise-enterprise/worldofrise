
-- Create contacts table for CRM module
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salutation text,
  last_name text,
  first_name text,
  title text,
  company text,
  gender text,
  vip boolean NOT NULL DEFAULT false,
  visits integer NOT NULL DEFAULT 0,
  cancels integer NOT NULL DEFAULT 0,
  no_show integer NOT NULL DEFAULT 0,
  orders integer NOT NULL DEFAULT 0,
  spend_per_cover numeric,
  total_spend numeric,
  spend_per_visit numeric,
  avg_rating numeric,
  birthday date,
  anniversary date,
  phone text,
  work_phone text,
  email text,
  alt_email text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  notes text,
  tags text,
  loyalty_id text,
  loyalty_tier text,
  loyalty_rank text,
  created_date timestamptz,
  last_location text,
  last_visit timestamptz,
  venue_group_marketing_opt_in boolean NOT NULL DEFAULT false,
  cafe_noir_london_opt_in boolean NOT NULL DEFAULT false,
  noir_cafe_abu_dhabi_opt_in boolean NOT NULL DEFAULT false,
  noir_cafe_al_hazm_opt_in boolean NOT NULL DEFAULT false,
  noir_cafe_old_doha_port_opt_in boolean NOT NULL DEFAULT false,
  noir_cafe_riyadh_opt_in boolean NOT NULL DEFAULT false,
  noir_cafe_tennis_opt_in boolean NOT NULL DEFAULT false,
  noir_cafe_west_walk_opt_in boolean NOT NULL DEFAULT false,
  sasso_al_hazm_opt_in boolean NOT NULL DEFAULT false,
  sasso_london_opt_in boolean NOT NULL DEFAULT false,
  sasso_riyadh_opt_in boolean NOT NULL DEFAULT false,
  sasso_west_walk_opt_in boolean NOT NULL DEFAULT false,
  imported_at timestamptz NOT NULL DEFAULT now(),
  imported_by uuid
);

-- Indexes for search and filtering
CREATE INDEX idx_contacts_email ON public.contacts (email);
CREATE INDEX idx_contacts_phone ON public.contacts (phone);
CREATE INDEX idx_contacts_loyalty_id ON public.contacts (loyalty_id);
CREATE INDEX idx_contacts_last_name ON public.contacts (last_name);
CREATE INDEX idx_contacts_company ON public.contacts (company);
CREATE INDEX idx_contacts_city ON public.contacts (city);
CREATE INDEX idx_contacts_country ON public.contacts (country);
CREATE INDEX idx_contacts_vip ON public.contacts (vip);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Public read access (matches existing open-access pattern)
CREATE POLICY "Public read access for contacts"
  ON public.contacts FOR SELECT
  USING (true);

-- Public insert access
CREATE POLICY "Public insert access for contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

-- Public update access
CREATE POLICY "Public update access for contacts"
  ON public.contacts FOR UPDATE
  USING (true);

-- Public delete access
CREATE POLICY "Public delete access for contacts"
  ON public.contacts FOR DELETE
  USING (true);

-- Admin read access
CREATE POLICY "Admins can view contacts"
  ON public.contacts FOR SELECT
  USING (is_admin(auth.uid()));

-- Super admin full access
CREATE POLICY "Super admins can manage contacts"
  ON public.contacts FOR ALL
  USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]))
  WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role]));
