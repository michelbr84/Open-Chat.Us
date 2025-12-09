-- Create private_messages table
CREATE TABLE public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  receiver_id UUID NOT NULL,
  receiver_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own private messages"
ON public.private_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send private messages"
ON public.private_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
ON public.private_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

ALTER TABLE public.private_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT DEFAULT 'active',
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create content_filters table for moderation
CREATE TABLE public.content_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filter_type TEXT NOT NULL,
  pattern TEXT NOT NULL,
  is_regex BOOLEAN DEFAULT false,
  severity TEXT NOT NULL DEFAULT 'warning',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage content filters"
ON public.content_filters FOR ALL USING (true);

-- Create flagged_content table
CREATE TABLE public.flagged_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id),
  reason TEXT NOT NULL,
  auto_flagged BOOLEAN DEFAULT false,
  review_status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage flagged content"
ON public.flagged_content FOR ALL USING (true);

ALTER TABLE public.flagged_content REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flagged_content;

-- Create moderation_actions table
CREATE TABLE public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  target_message_id UUID REFERENCES public.messages(id),
  moderator_id UUID,
  reason TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage moderation actions"
ON public.moderation_actions FOR ALL USING (true);

-- Create user_moderation_status table
CREATE TABLE public.user_moderation_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  muted_until TIMESTAMP WITH TIME ZONE,
  banned_until TIMESTAMP WITH TIME ZONE,
  total_warnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_moderation_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage user moderation status"
ON public.user_moderation_status FOR ALL USING (true);

CREATE POLICY "Users can view their own status"
ON public.user_moderation_status FOR SELECT USING (auth.uid() = user_id);

-- Create message_reports table
CREATE TABLE public.message_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id),
  reporter_id UUID,
  reporter_name TEXT,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.message_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage reports"
ON public.message_reports FOR ALL USING (true);

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID,
  user_name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_name, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
ON public.message_reactions FOR SELECT USING (true);

CREATE POLICY "Anyone can add reactions"
ON public.message_reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can remove their reactions"
ON public.message_reactions FOR DELETE USING (true);

ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Create channels table
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT DEFAULT 'public',
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public channels"
ON public.channels FOR SELECT USING (type = 'public' OR true);

CREATE POLICY "Authenticated users can create channels"
ON public.channels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create channel_members table
CREATE TABLE public.channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view channel members"
ON public.channel_members FOR SELECT USING (true);

CREATE POLICY "Users can join channels"
ON public.channel_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave channels"
ON public.channel_members FOR DELETE USING (auth.uid() = user_id);

-- Create message_threads table
CREATE TABLE public.message_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id),
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view threads"
ON public.message_threads FOR SELECT USING (true);

CREATE POLICY "Anyone can create threads"
ON public.message_threads FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update threads"
ON public.message_threads FOR UPDATE USING (true);

ALTER TABLE public.message_threads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their bookmarks"
ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Insert default General channel
INSERT INTO public.channels (name, description, type) VALUES ('General', 'General chat channel', 'public');