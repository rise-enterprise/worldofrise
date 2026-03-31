
CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'member-companion',
  status text NOT NULL DEFAULT 'pending',
  response_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.ai_messages
  FOR ALL USING (false);

CREATE INDEX idx_ai_messages_request_id ON public.ai_messages (request_id);
CREATE INDEX idx_ai_messages_status ON public.ai_messages (status) WHERE status = 'pending';
