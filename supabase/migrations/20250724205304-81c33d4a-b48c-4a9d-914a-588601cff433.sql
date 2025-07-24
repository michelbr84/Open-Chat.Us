-- Security Fix: Comprehensive Security Improvements
-- Fix 1: Improve Guest User Security and Add Content Validation

-- First, let's ensure we have proper rate limiting functions
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier TEXT,
  action_type TEXT,
  max_actions INTEGER DEFAULT 10,
  time_window_minutes INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  action_count INTEGER;
BEGIN
  -- Count recent actions from this user
  SELECT COUNT(*) INTO action_count
  FROM public.audit_logs
  WHERE 
    (user_id = auth.uid() OR action_description ILIKE '%' || user_identifier || '%')
    AND action_type = check_rate_limit.action_type
    AND created_at > NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- Return false if rate limit exceeded
  IF action_count >= max_actions THEN
    RETURN FALSE;
  END IF;
  
  -- Log this action for monitoring
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    action_description,
    metadata
  ) VALUES (
    auth.uid(),
    check_rate_limit.action_type,
    'Rate limit check for ' || user_identifier,
    jsonb_build_object('user_identifier', user_identifier, 'count', action_count + 1)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security Fix 2: Add message content validation function
CREATE OR REPLACE FUNCTION public.validate_message_content(content TEXT) RETURNS BOOLEAN AS $$
BEGIN
  -- Check length limits
  IF LENGTH(content) > 1000 THEN
    RAISE EXCEPTION 'Message too long. Maximum 1000 characters allowed.';
  END IF;
  
  IF LENGTH(TRIM(content)) = 0 THEN
    RAISE EXCEPTION 'Message cannot be empty.';
  END IF;
  
  -- Basic content filtering (extend as needed)
  IF content ~* '\b(spam|scam|phishing|hack|virus|malware)\b' THEN
    RAISE EXCEPTION 'Message contains prohibited content.';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Security Fix 3: Update message_reactions policies with proper validation and rate limiting
DROP POLICY IF EXISTS "Anyone can add reactions" ON public.message_reactions;

CREATE POLICY "Secure reaction creation" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  -- Apply rate limiting (20 reactions per minute)
  check_rate_limit(
    COALESCE(auth.uid()::text, user_id), 
    'reaction_add',
    20,
    1
  ) AND
  -- Ensure valid user identification
  user_id IS NOT NULL AND LENGTH(user_id) > 0
);

-- Security Fix 4: Update messages table policies with security improvements
DROP POLICY IF EXISTS "Users can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Anyone can read non-deleted messages (public chat)
CREATE POLICY "Public read access to messages" 
ON public.messages 
FOR SELECT 
USING (NOT COALESCE(is_deleted, false));

-- Secure message posting with validation and rate limiting
CREATE POLICY "Secure message posting" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  -- Validate content
  validate_message_content(content) AND
  -- Apply rate limiting (15 messages per minute for auth users, 8 for guests)
  check_rate_limit(
    COALESCE(auth.uid()::text, sender_name), 
    'public_message_post',
    CASE WHEN auth.uid() IS NOT NULL THEN 15 ELSE 8 END,
    1
  ) AND
  -- Ensure proper user identification
  (
    (auth.uid() IS NULL AND sender_name IS NOT NULL AND LENGTH(sender_name) > 0) OR 
    (auth.uid() IS NOT NULL AND sender_id = auth.uid())
  )
);

-- Users can only edit their own messages within 15 minutes
CREATE POLICY "Users can edit own messages" 
ON public.messages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = sender_id AND
  created_at > NOW() - INTERVAL '15 minutes' AND
  NOT COALESCE(is_deleted, false)
)
WITH CHECK (
  validate_message_content(content) AND
  auth.uid() = sender_id AND
  NOT is_deleted
);

-- Users can delete their own messages (soft delete)
CREATE POLICY "Users can delete own messages" 
ON public.messages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = sender_id
)
WITH CHECK (
  is_deleted = true AND
  auth.uid() = sender_id
);

-- Security Fix 5: Update chat_messages policies (using correct column names)
DROP POLICY IF EXISTS "Anyone can send chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON public.chat_messages;

-- Secure chat message posting
CREATE POLICY "Secure chat message creation" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Validate content
  validate_message_content(content) AND
  -- Apply rate limiting (10 messages per minute for auth users, 5 for guests)
  check_rate_limit(
    COALESCE(auth.uid()::text, 'guest'), 
    'chat_message_post',
    CASE WHEN auth.uid() IS NOT NULL THEN 10 ELSE 5 END,
    1
  ) AND
  -- Ensure proper user identification for authenticated users
  (auth.uid() IS NULL OR (auth.uid() IS NOT NULL AND user_id = auth.uid()))
);

-- Users can edit their own chat messages within 15 minutes
CREATE POLICY "Users can edit own chat messages" 
ON public.chat_messages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND
  timestamp > NOW() - INTERVAL '15 minutes' AND
  NOT COALESCE(is_deleted, false)
)
WITH CHECK (
  validate_message_content(content) AND
  auth.uid() = user_id
);

-- Users can delete their own chat messages
CREATE POLICY "Users can delete own chat messages" 
ON public.chat_messages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id
)
WITH CHECK (
  is_deleted = true AND
  auth.uid() = user_id
);

-- Security Fix 6: Restrict overly permissive anonymous access on sensitive tables
-- Update profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Security Fix 7: Add security monitoring trigger
CREATE OR REPLACE FUNCTION public.log_security_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Log message posting activities
  IF TG_OP = 'INSERT' THEN
    -- Log message posts for monitoring
    IF TG_TABLE_NAME IN ('messages', 'chat_messages') THEN
      INSERT INTO public.audit_logs (
        user_id,
        action_type,
        action_description,
        metadata,
        ip_address
      ) VALUES (
        auth.uid(),
        'MESSAGE_POST',
        'Message posted in ' || TG_TABLE_NAME,
        jsonb_build_object(
          'table', TG_TABLE_NAME,
          'content_length', LENGTH(COALESCE(NEW.content, '')),
          'timestamp', NOW()
        ),
        inet_client_addr()
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add security monitoring triggers
DROP TRIGGER IF EXISTS security_monitor_messages ON public.messages;
DROP TRIGGER IF EXISTS security_monitor_chat_messages ON public.chat_messages;

CREATE TRIGGER security_monitor_messages
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.log_security_events();

CREATE TRIGGER security_monitor_chat_messages
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.log_security_events();