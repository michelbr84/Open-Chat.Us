-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  mentions JSONB DEFAULT '[]'::jsonb,
  reply_count INTEGER DEFAULT 0,
  parent_message_id UUID REFERENCES public.messages(id),
  is_bot_message BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read non-deleted messages (public chat)
CREATE POLICY "Anyone can read messages"
ON public.messages
FOR SELECT
USING (is_deleted = false);

-- Allow anyone to insert messages (guests and authenticated users)
CREATE POLICY "Anyone can insert messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (
  (sender_id IS NOT NULL AND sender_id = auth.uid()) OR
  (sender_id IS NULL AND sender_name IS NOT NULL)
);

-- Enable realtime for the messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster queries
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_parent_message_id ON public.messages(parent_message_id);