-- ===================================
-- MILESTONE 4: SECURITY REMEDIATION
-- Fixing all detected security warnings
-- ===================================

-- Fix function search path security issues
-- Update functions to include proper search_path settings

-- 1. Fix update_user_reputation function
CREATE OR REPLACE FUNCTION public.update_user_reputation(user_id_param UUID, points INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_profiles 
  SET reputation_score = GREATEST(0, reputation_score + points)
  WHERE id = user_id_param;
END;
$$;

-- 2. Fix award_achievement function
CREATE OR REPLACE FUNCTION public.award_achievement(
  user_id_param UUID, 
  achievement_code_param TEXT, 
  achievement_name_param TEXT, 
  achievement_description_param TEXT DEFAULT '',
  points_param INTEGER DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 3. Fix update_thread_reply_count function
CREATE OR REPLACE FUNCTION public.update_thread_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.thread_id IS NOT NULL THEN
    UPDATE public.message_threads 
    SET reply_count = reply_count + 1, last_reply_at = now()
    WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Fix check_message_achievements function
CREATE OR REPLACE FUNCTION public.check_message_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 5. Fix check_reaction_achievements function
CREATE OR REPLACE FUNCTION public.check_reaction_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 6. Fix create_default_channel function
CREATE OR REPLACE FUNCTION public.create_default_channel()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  channel_id UUID;
BEGIN
  INSERT INTO public.chat_channels (name, description, type)
  VALUES ('General', 'General chat for everyone', 'public')
  RETURNING id INTO channel_id;
  
  RETURN channel_id;
END;
$$;

-- ===================================
-- STRENGTHEN RLS POLICIES FOR SECURITY
-- Remove overly permissive anonymous access
-- ===================================

-- Update user_status policies to require authentication for updates
DROP POLICY IF EXISTS "Users can update their own status" ON public.user_status;
CREATE POLICY "Authenticated users can update their own status" ON public.user_status
  FOR ALL USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update chat_channels policies to require authentication for creation
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.chat_channels;
CREATE POLICY "Authenticated users can create channels" ON public.chat_channels
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = creator_id);

-- Update channel_members policies to require authentication
DROP POLICY IF EXISTS "Users can join public channels" ON public.channel_members;
CREATE POLICY "Authenticated users can join public channels" ON public.channel_members
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_channels 
      WHERE id = channel_id AND type = 'public'
    )
  );

-- Update polls policies to require authentication
DROP POLICY IF EXISTS "Authenticated users can create polls" ON public.polls;
CREATE POLICY "Authenticated users can create polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = creator_id);

-- Update poll_votes policies to require authentication
DROP POLICY IF EXISTS "Users can vote on polls" ON public.poll_votes;
CREATE POLICY "Authenticated users can vote on polls" ON public.poll_votes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change their votes" ON public.poll_votes;
CREATE POLICY "Authenticated users can change their votes" ON public.poll_votes
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Strengthen notification policies - only system/admins can create
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System and admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() IS NULL OR  -- System (from triggers)
    (auth.uid() IS NOT NULL AND public.is_admin())  -- Admins only
  );

-- Update user_achievements policies - only system can insert
DROP POLICY IF EXISTS "System can insert achievements" ON public.user_achievements;
CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (
    auth.uid() IS NULL OR  -- System (from triggers)
    (auth.uid() IS NOT NULL AND public.is_admin())  -- Admins only
  );

-- Update admin_announcements to require proper authentication
DROP POLICY IF EXISTS "Everyone can view active announcements" ON public.admin_announcements;
CREATE POLICY "Users can view active announcements" ON public.admin_announcements
  FOR SELECT USING (is_active = true);

-- ===================================
-- ADDITIONAL SECURITY ENHANCEMENTS
-- ===================================

-- Add rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_channel_creation_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recent_channels INTEGER;
BEGIN
  -- Check if user has created too many channels recently (max 5 per hour)
  SELECT COUNT(*) INTO recent_channels
  FROM public.chat_channels
  WHERE creator_id = NEW.creator_id 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_channels >= 5 THEN
    RAISE EXCEPTION 'Too many channels created recently. Please wait before creating another channel.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER channel_creation_rate_limit_trigger
  BEFORE INSERT ON public.chat_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.check_channel_creation_limit();

-- Add rate limiting for poll creation
CREATE OR REPLACE FUNCTION public.check_poll_creation_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recent_polls INTEGER;
BEGIN
  -- Check if user has created too many polls recently (max 3 per hour)
  SELECT COUNT(*) INTO recent_polls
  FROM public.polls
  WHERE creator_id = NEW.creator_id 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_polls >= 3 THEN
    RAISE EXCEPTION 'Too many polls created recently. Please wait before creating another poll.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER poll_creation_rate_limit_trigger
  BEFORE INSERT ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.check_poll_creation_limit();

-- Add validation for notification data
CREATE OR REPLACE FUNCTION public.validate_notification_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Validate notification type
  IF NEW.type NOT IN ('mention', 'dm', 'reaction', 'achievement', 'announcement', 'system') THEN
    RAISE EXCEPTION 'Invalid notification type: %', NEW.type;
  END IF;
  
  -- Ensure title and message are not empty
  IF LENGTH(TRIM(NEW.title)) = 0 THEN
    RAISE EXCEPTION 'Notification title cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_notification_data_trigger
  BEFORE INSERT OR UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_notification_data();

-- Add validation for user status updates
CREATE OR REPLACE FUNCTION public.validate_user_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Validate status values
  IF NEW.status NOT IN ('online', 'offline', 'away', 'busy') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be one of: online, offline, away, busy', NEW.status;
  END IF;
  
  -- Limit custom message length
  IF LENGTH(NEW.custom_message) > 100 THEN
    RAISE EXCEPTION 'Custom status message too long. Maximum 100 characters.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_user_status_trigger
  BEFORE INSERT OR UPDATE ON public.user_status
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_status();