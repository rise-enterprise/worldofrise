
-- Create chat-attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true);

-- Public read access
CREATE POLICY "Public can view chat attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Authenticated admins can upload
CREATE POLICY "Admins can upload chat attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND public.is_admin(auth.uid())
);

-- Admins can delete their uploads
CREATE POLICY "Admins can delete chat attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-attachments' 
  AND public.is_admin(auth.uid())
);
