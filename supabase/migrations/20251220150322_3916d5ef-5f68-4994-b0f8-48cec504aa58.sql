-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;

-- Create secure policies requiring authentication
CREATE POLICY "Authenticated users can view attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND octet_length(name) < 10485760
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);