-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT USING (true);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_code TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_code)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their achievements"
ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
ON public.user_achievements FOR INSERT WITH CHECK (true);

-- Create leaderboard table
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  achievement_count INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard FOR SELECT USING (true);

CREATE POLICY "System can update leaderboard"
ON public.leaderboard FOR ALL USING (true);

-- Create is_admin function for admin checks
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$;

-- Create enhanced_rate_limit_check function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  p_user_id UUID,
  p_action_type TEXT DEFAULT 'message'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_count INTEGER;
  time_window INTERVAL := '1 minute'::INTERVAL;
  max_messages INTEGER := 10;
BEGIN
  -- Count messages in the time window
  SELECT COUNT(*) INTO message_count
  FROM public.messages
  WHERE sender_id = p_user_id
    AND created_at > NOW() - time_window;
  
  -- Return true if within limit, false if exceeded
  RETURN message_count < max_messages;
END;
$$;

-- Create get_unread_message_count function
CREATE OR REPLACE FUNCTION public.get_unread_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.private_messages
  WHERE receiver_id = p_user_id AND is_read = false;
  
  RETURN unread_count;
END;
$$;

-- Create get_unread_conversations function
CREATE OR REPLACE FUNCTION public.get_unread_conversations(p_user_id UUID)
RETURNS TABLE(
  sender_id UUID,
  sender_name TEXT,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.sender_id,
    pm.sender_name,
    COUNT(*) as unread_count
  FROM public.private_messages pm
  WHERE pm.receiver_id = p_user_id AND pm.is_read = false
  GROUP BY pm.sender_id, pm.sender_name;
END;
$$;

-- Create mark_messages_as_read function
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_user_id UUID,
  p_sender_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.private_messages
  SET is_read = true
  WHERE receiver_id = p_user_id AND sender_id = p_sender_id AND is_read = false;
END;
$$;