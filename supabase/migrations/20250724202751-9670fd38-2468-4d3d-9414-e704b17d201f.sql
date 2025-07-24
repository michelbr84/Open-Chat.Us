-- Fix critical security issues in chat system

-- First, let's see the current structure and fix chat_messages security
DROP POLICY IF EXISTS "Allow public access to chat_messages" ON public.chat_messages;

-- Create proper RLS policies for chat_messages
CREATE POLICY "Users can view all chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can send messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  sender_id = auth.uid()
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Fix messages table security
DROP POLICY IF EXISTS "Anyone can insert public messages" ON public.messages;
DROP POLICY IF EXISTS "Public messages are viewable by everyone" ON public.messages;

CREATE POLICY "Users can view all messages" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  sender_id = auth.uid()
);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Create message reactions table with proper security
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS on message_reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Anyone can view reactions" 
ON public.message_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can add reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create message_reports table for moderation
CREATE TABLE IF NOT EXISTS public.message_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, reporter_id)
);

-- Enable RLS on message_reports
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reports
CREATE POLICY "Users can create reports" 
ON public.message_reports 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  reporter_id = auth.uid()
);

CREATE POLICY "Users can view their own reports" 
ON public.message_reports 
FOR SELECT 
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports" 
ON public.message_reports 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);

-- Add realtime support for reactions
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.message_reports REPLICA IDENTITY FULL;