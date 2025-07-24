-- Fix function search path security issues
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix message content validation function
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
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix security monitoring function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';