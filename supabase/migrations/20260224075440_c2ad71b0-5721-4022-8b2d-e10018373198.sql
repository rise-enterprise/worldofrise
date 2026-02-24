
-- AI Predictions table for storing churn, LTV, and segmentation predictions
CREATE TABLE public.ai_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  prediction_type text NOT NULL, -- 'churn', 'ltv', 'segment'
  score numeric, -- 0-100 for churn, dollar amount for LTV
  label text, -- 'safe', 'at_risk', 'high_risk' for churn; segment name for segmentation
  confidence numeric, -- 0-1 confidence level
  metadata_json jsonb DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_ai_predictions_member ON public.ai_predictions(member_id);
CREATE INDEX idx_ai_predictions_type ON public.ai_predictions(prediction_type);
CREATE INDEX idx_ai_predictions_generated ON public.ai_predictions(generated_at DESC);
CREATE INDEX idx_ai_predictions_label ON public.ai_predictions(label);

-- Enable RLS
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Admins can read predictions
CREATE POLICY "Admins can view predictions"
ON public.ai_predictions FOR SELECT
USING (is_admin(auth.uid()));

-- Admins with write access can manage predictions
CREATE POLICY "Admins can manage predictions"
ON public.ai_predictions FOR ALL
USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- AI Insights table for storing generated recommendations and analysis
CREATE TABLE public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL, -- 'reward_optimization', 'branch_performance', 'campaign_intelligence', 'general'
  title text NOT NULL,
  summary text NOT NULL,
  details_json jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'info', -- 'info', 'warning', 'critical', 'opportunity'
  is_actionable boolean DEFAULT true,
  is_dismissed boolean DEFAULT false,
  dismissed_by uuid REFERENCES public.admins(id),
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX idx_ai_insights_severity ON public.ai_insights(severity);
CREATE INDEX idx_ai_insights_generated ON public.ai_insights(generated_at DESC);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view insights"
ON public.ai_insights FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage insights"
ON public.ai_insights FOR ALL
USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));
