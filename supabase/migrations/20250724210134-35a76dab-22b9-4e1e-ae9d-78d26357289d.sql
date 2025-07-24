-- Fix ambiguous column references in security functions
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier TEXT,
  action_type TEXT,
  max_actions INTEGER DEFAULT 10,
  time_window_minutes INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  action_count INTEGER;
BEGIN
  -- Count recent actions from this user with fully qualified column names
  SELECT COUNT(*) INTO action_count
  FROM public.audit_logs
  WHERE 
    (audit_logs.user_id = auth.uid() OR audit_logs.action_description ILIKE '%' || user_identifier || '%')
    AND audit_logs.action_type = check_rate_limit.action_type
    AND audit_logs.created_at > NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- Return false if rate limit exceeded
  IF action_count >= max_actions THEN
    RETURN FALSE;
  END IF;
  
  -- Log this action for monitoring with fully qualified column names
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

-- Also fix the security monitoring function to avoid any potential conflicts
CREATE OR REPLACE FUNCTION public.log_security_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Log message posting activities with fully qualified references
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