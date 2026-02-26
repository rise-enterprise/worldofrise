
-- Import runs tracking table
CREATE TABLE public.import_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES public.admins(id),
  file_name text NOT NULL,
  file_size_bytes bigint,
  status text NOT NULL DEFAULT 'pending',
  total_rows integer DEFAULT 0,
  rows_imported integer DEFAULT 0,
  rows_rejected integer DEFAULT 0,
  rows_deduplicated integer DEFAULT 0,
  mapping_decisions jsonb DEFAULT '{}',
  validation_report jsonb DEFAULT '{}',
  anomalies jsonb DEFAULT '[]',
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view import runs"
  ON public.import_runs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage import runs"
  ON public.import_runs FOR ALL
  USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Staging contacts table (mirrors contacts but adds validation columns)
CREATE TABLE public.staging_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_run_id uuid NOT NULL REFERENCES public.import_runs(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  raw_data jsonb NOT NULL DEFAULT '{}',
  mapped_data jsonb NOT NULL DEFAULT '{}',
  validation_status text NOT NULL DEFAULT 'pending', -- pending, valid, warning, error
  validation_errors jsonb DEFAULT '[]',
  validation_warnings jsonb DEFAULT '[]',
  dedup_key text,
  is_duplicate boolean DEFAULT false,
  duplicate_of uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.staging_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view staging"
  ON public.staging_contacts FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage staging"
  ON public.staging_contacts FOR ALL
  USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Guest segments table for RFM and behavioral classification
CREATE TABLE public.guest_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
  segment_type text NOT NULL, -- rfm, behavioral, vip, branch_affinity
  segment_label text NOT NULL,
  score numeric,
  metadata_json jsonb DEFAULT '{}',
  computed_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  CONSTRAINT at_least_one_ref CHECK (contact_id IS NOT NULL OR member_id IS NOT NULL)
);

ALTER TABLE public.guest_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view segments"
  ON public.guest_segments FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage segments"
  ON public.guest_segments FOR ALL
  USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- AI operator execution log
CREATE TABLE public.ai_operator_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES public.admins(id),
  action_type text NOT NULL,
  intent text NOT NULL,
  plan jsonb DEFAULT '{}',
  input_params jsonb DEFAULT '{}',
  output_result jsonb DEFAULT '{}',
  before_state jsonb,
  after_state jsonb,
  status text NOT NULL DEFAULT 'pending', -- pending, confirmed, executing, completed, failed, cancelled
  requires_confirmation boolean DEFAULT false,
  confirmed_at timestamptz,
  ai_rationale text,
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_operator_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view operator logs"
  ON public.ai_operator_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage operator logs"
  ON public.ai_operator_logs FOR ALL
  USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
  WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Index for efficient segment queries
CREATE INDEX idx_guest_segments_contact ON public.guest_segments(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_guest_segments_member ON public.guest_segments(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX idx_guest_segments_type ON public.guest_segments(segment_type, segment_label);
CREATE INDEX idx_staging_contacts_run ON public.staging_contacts(import_run_id);
CREATE INDEX idx_import_runs_status ON public.import_runs(status);
