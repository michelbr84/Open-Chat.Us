-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true);

-- Create file_attachments table
CREATE TABLE public.file_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_by_guest_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for file_attachments
CREATE POLICY "Users can view all file attachments" 
ON public.file_attachments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can upload files" 
ON public.file_attachments 
FOR INSERT 
WITH CHECK (
  (auth.uid() = uploaded_by_user_id) OR 
  (auth.uid() IS NULL AND uploaded_by_guest_id IS NOT NULL)
);

CREATE POLICY "Users can delete their own files" 
ON public.file_attachments 
FOR DELETE 
USING (
  (auth.uid() = uploaded_by_user_id) OR 
  (auth.uid() IS NULL AND uploaded_by_guest_id IS NOT NULL)
);

-- Add parent_message_id column to messages table for threaded replies
ALTER TABLE public.messages ADD COLUMN parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN reply_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX idx_messages_parent_id ON public.messages(parent_message_id);
CREATE INDEX idx_file_attachments_uploader ON public.file_attachments(uploaded_by_user_id, uploaded_by_guest_id);

-- Storage policies for chat-attachments bucket
CREATE POLICY "Users can view chat attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-attachments');

CREATE POLICY "Users can upload chat attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-attachments');

CREATE POLICY "Users can update their own chat attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);