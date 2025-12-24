-- Create table to track SevenRooms sync status
CREATE TABLE public.sevenrooms_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  sevenrooms_client_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_direction TEXT NOT NULL DEFAULT 'inbound',
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id)
);

-- Create table for sync logs/history
CREATE TABLE public.sevenrooms_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  triggered_by UUID REFERENCES public.admins(id)
);

-- Enable RLS on both tables
ALTER TABLE public.sevenrooms_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sevenrooms_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for sevenrooms_sync
CREATE POLICY "Admins can view sync status" 
ON public.sevenrooms_sync 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage sync" 
ON public.sevenrooms_sync 
FOR ALL 
USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- RLS policies for sevenrooms_sync_logs
CREATE POLICY "Admins can view sync logs" 
ON public.sevenrooms_sync_logs 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage sync logs" 
ON public.sevenrooms_sync_logs 
FOR ALL 
USING (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]))
WITH CHECK (admin_has_role(auth.uid(), ARRAY['super_admin'::admin_role, 'admin'::admin_role]));

-- Add trigger for updated_at
CREATE TRIGGER update_sevenrooms_sync_updated_at
BEFORE UPDATE ON public.sevenrooms_sync
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();