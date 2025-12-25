-- Create member notification preferences table
CREATE TABLE public.member_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL UNIQUE REFERENCES public.members(id) ON DELETE CASCADE,
  email_events BOOLEAN NOT NULL DEFAULT true,
  email_tier_upgrades BOOLEAN NOT NULL DEFAULT true,
  email_promotions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification history table
CREATE TABLE public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent'
);

-- Enable RLS
ALTER TABLE public.member_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Members can view/update their own preferences
CREATE POLICY "Members can view their own preferences"
ON public.member_notification_preferences FOR SELECT
USING (member_id = get_member_id(auth.uid()));

CREATE POLICY "Members can update their own preferences"
ON public.member_notification_preferences FOR UPDATE
USING (member_id = get_member_id(auth.uid()));

CREATE POLICY "Members can insert their own preferences"
ON public.member_notification_preferences FOR INSERT
WITH CHECK (member_id = get_member_id(auth.uid()));

-- Members can view their notification history
CREATE POLICY "Members can view their notification history"
ON public.member_notification_preferences FOR SELECT
USING (member_id = get_member_id(auth.uid()));

-- Admins can manage all preferences and history
CREATE POLICY "Admins can manage all notification preferences"
ON public.member_notification_preferences FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage notification history"
ON public.notification_history FOR ALL
USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_member_notification_preferences_updated_at
BEFORE UPDATE ON public.member_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();