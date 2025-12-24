-- Add new columns to members table for SevenRooms import
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS salutation TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_location_id UUID REFERENCES public.locations(id);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMP WITH TIME ZONE;