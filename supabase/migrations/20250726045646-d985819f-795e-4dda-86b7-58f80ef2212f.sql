-- ===================================
-- MILESTONE 4: Advanced User Experience & Community Platform
-- Step 1: Database Schema Enhancement
-- ===================================

-- Extend user_profiles table for advanced features
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS custom_status TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS status_emoji TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"mentions": true, "dms": true, "reactions": true, "announcements": true}'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Create user_status table for real-time presence
CREATE TABLE IF NOT EXISTS public.user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline', -- online, offline, away, busy
  custom_message TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create chat_channels table for multiple rooms
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public', -- public, private, dm
  creator_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  member_limit INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create channel_members table for channel membership
CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create message_bookmarks table
CREATE TABLE IF NOT EXISTS public.message_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  achievement_code TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  points_awarded INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_code)
);

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL, -- Array of option objects with id, text, votes
  multiple_choice BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Create message_threads table for threaded conversations
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_message_id)
);

-- Add thread support to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES public.message_threads(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- mention, dm, reaction, achievement, announcement
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_announcements table
CREATE TABLE IF NOT EXISTS public.admin_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general', -- general, maintenance, feature, urgent
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;

-- ===================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================

-- User Status Policies
CREATE POLICY "Users can view all user status" ON public.user_status
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own status" ON public.user_status
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat Channels Policies
CREATE POLICY "Users can view public channels" ON public.chat_channels
  FOR SELECT USING (type = 'public' OR EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_id = chat_channels.id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create channels" ON public.chat_channels
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Channel creators and admins can update channels" ON public.chat_channels
  FOR UPDATE USING (
    auth.uid() = creator_id OR 
    is_admin() OR
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = chat_channels.id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Channel Members Policies
CREATE POLICY "Users can view channel members for channels they belong to" ON public.channel_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm 
      WHERE cm.channel_id = channel_members.channel_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public channels" ON public.channel_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_channels 
      WHERE id = channel_id AND type = 'public'
    )
  );

CREATE POLICY "Users can leave channels or channel admins can manage" ON public.channel_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.channel_members cm 
      WHERE cm.channel_id = channel_members.channel_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    )
  );

-- Message Bookmarks Policies
CREATE POLICY "Users can manage their own bookmarks" ON public.message_bookmarks
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Achievements Policies
CREATE POLICY "Users can view all achievements" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- Polls Policies
CREATE POLICY "Users can view polls in channels they belong to" ON public.polls
  FOR SELECT USING (
    channel_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.channel_members 
      WHERE channel_id = polls.channel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Poll creators can update their polls" ON public.polls
  FOR UPDATE USING (auth.uid() = creator_id);

-- Poll Votes Policies
CREATE POLICY "Users can view poll votes" ON public.poll_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls p 
      WHERE p.id = poll_votes.poll_id 
      AND (p.channel_id IS NULL OR EXISTS (
        SELECT 1 FROM public.channel_members 
        WHERE channel_id = p.channel_id AND user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can vote on polls" ON public.poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their votes" ON public.poll_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Message Threads Policies
CREATE POLICY "Users can view threads for messages they can see" ON public.message_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = message_threads.parent_message_id
    )
  );

CREATE POLICY "System can manage threads" ON public.message_threads
  FOR ALL USING (true);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin Announcements Policies
CREATE POLICY "Everyone can view active announcements" ON public.admin_announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON public.admin_announcements
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ===================================
-- TRIGGERS AND FUNCTIONS
-- ===================================

-- Function to update user reputation
CREATE OR REPLACE FUNCTION public.update_user_reputation(user_id_param UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles 
  SET reputation_score = GREATEST(0, reputation_score + points)
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award achievement
CREATE OR REPLACE FUNCTION public.award_achievement(
  user_id_param UUID, 
  achievement_code_param TEXT, 
  achievement_name_param TEXT, 
  achievement_description_param TEXT DEFAULT '',
  points_param INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  achievement_exists BOOLEAN;
BEGIN
  -- Check if achievement already exists for user
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = user_id_param AND achievement_code = achievement_code_param
  ) INTO achievement_exists;
  
  IF NOT achievement_exists THEN
    -- Insert achievement
    INSERT INTO public.user_achievements (
      user_id, achievement_code, achievement_name, achievement_description, points_awarded
    ) VALUES (
      user_id_param, achievement_code_param, achievement_name_param, achievement_description_param, points_param
    );
    
    -- Update reputation
    PERFORM public.update_user_reputation(user_id_param, points_param);
    
    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message, data) VALUES (
      user_id_param,
      'achievement',
      'Achievement Unlocked!',
      'You earned: ' || achievement_name_param,
      jsonb_build_object(
        'achievement_code', achievement_code_param,
        'points', points_param
      )
    );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update thread reply count
CREATE OR REPLACE FUNCTION public.update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.thread_id IS NOT NULL THEN
    UPDATE public.message_threads 
    SET reply_count = reply_count + 1, last_reply_at = now()
    WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_reply_count_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_reply_count();

-- Trigger to award achievements based on activity
CREATE OR REPLACE FUNCTION public.check_message_achievements()
RETURNS TRIGGER AS $$
DECLARE
  message_count INTEGER;
  reaction_count INTEGER;
BEGIN
  -- Count total messages by user
  SELECT COUNT(*) INTO message_count
  FROM public.messages 
  WHERE sender_id = NEW.sender_id;
  
  -- Award achievements based on message count
  IF message_count = 1 THEN
    PERFORM public.award_achievement(NEW.sender_id, 'first_message', 'First Message', 'Sent your first message!', 10);
  ELSIF message_count = 10 THEN
    PERFORM public.award_achievement(NEW.sender_id, 'chatty_10', 'Getting Chatty', 'Sent 10 messages', 25);
  ELSIF message_count = 100 THEN
    PERFORM public.award_achievement(NEW.sender_id, 'chatty_100', 'Conversation Master', 'Sent 100 messages', 100);
  ELSIF message_count = 1000 THEN
    PERFORM public.award_achievement(NEW.sender_id, 'chatty_1000', 'Chat Legend', 'Sent 1000 messages', 500);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_message_achievements_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_achievements();

-- Trigger to award reaction achievements
CREATE OR REPLACE FUNCTION public.check_reaction_achievements()
RETURNS TRIGGER AS $$
DECLARE
  reaction_count INTEGER;
  message_author_id UUID;
BEGIN
  -- Get message author
  SELECT sender_id INTO message_author_id
  FROM public.messages 
  WHERE id = NEW.message_id;
  
  -- Count total reactions received by message author
  SELECT COUNT(*) INTO reaction_count
  FROM public.message_reactions mr
  JOIN public.messages m ON mr.message_id = m.id
  WHERE m.sender_id = message_author_id;
  
  -- Award achievements to message author
  IF reaction_count = 1 THEN
    PERFORM public.award_achievement(message_author_id, 'first_reaction', 'First Reaction', 'Received your first reaction!', 5);
  ELSIF reaction_count = 50 THEN
    PERFORM public.award_achievement(message_author_id, 'popular_50', 'Getting Popular', 'Received 50 reactions', 50);
  ELSIF reaction_count = 100 THEN
    PERFORM public.award_achievement(message_author_id, 'popular_100', 'Crowd Favorite', 'Received 100 reactions', 100);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_reaction_achievements_trigger
  AFTER INSERT ON public.message_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_reaction_achievements();

-- Function to create default channel
CREATE OR REPLACE FUNCTION public.create_default_channel()
RETURNS UUID AS $$
DECLARE
  channel_id UUID;
BEGIN
  INSERT INTO public.chat_channels (name, description, type)
  VALUES ('General', 'General chat for everyone', 'public')
  RETURNING id INTO channel_id;
  
  RETURN channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default general channel if it doesn't exist
DO $$
DECLARE
  general_channel_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.chat_channels WHERE name = 'General' AND type = 'public'
  ) INTO general_channel_exists;
  
  IF NOT general_channel_exists THEN
    PERFORM public.create_default_channel();
  END IF;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_status_user_id ON public.user_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_status ON public.user_status(status);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_bookmarks_user_id ON public.message_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_channel_id ON public.polls(channel_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_parent_message_id ON public.message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Update existing messages to belong to general channel
UPDATE public.messages 
SET channel_id = (SELECT id FROM public.chat_channels WHERE name = 'General' AND type = 'public' LIMIT 1)
WHERE channel_id IS NULL;