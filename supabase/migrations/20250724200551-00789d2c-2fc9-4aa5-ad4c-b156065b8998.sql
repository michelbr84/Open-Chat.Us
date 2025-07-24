-- Create messages table for public chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create private_messages table for private chat
CREATE TABLE public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public messages (anyone can read/write)
CREATE POLICY "Public messages are viewable by everyone" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert public messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

-- Create policies for private messages (only sender and receiver)
CREATE POLICY "Users can view their own private messages" 
ON public.private_messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send private messages" 
ON public.private_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Enable realtime for both tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.private_messages REPLICA IDENTITY FULL;