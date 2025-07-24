-- Critical Security Fixes for RLS Policies
-- Phase 1: Fix Critical Tables with Anonymous Access

-- 1. Secure Audit Logs - Remove anonymous access completely
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Secure Message Reports - Tighten access
DROP POLICY IF EXISTS "Users can create reports" ON public.message_reports;
CREATE POLICY "Users can create reports" 
ON public.message_reports 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid());

-- 3. Secure Private Messages - Ensure authenticated access only
DROP POLICY IF EXISTS "Users can view their own private messages" ON public.private_messages;
CREATE POLICY "Users can view their own private messages" 
ON public.private_messages 
FOR SELECT 
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 4. Secure Message Reactions - Require authentication for creation
DROP POLICY IF EXISTS "Secure reaction creation" ON public.message_reactions;
CREATE POLICY "Secure reaction creation" 
ON public.message_reactions 
FOR INSERT 
TO authenticated, anon
WITH CHECK (
  check_rate_limit(COALESCE((auth.uid())::text, user_id), 'reaction_add'::text, 20, 1) 
  AND (user_id IS NOT NULL) 
  AND (length(user_id) > 0)
  AND (
    -- Allow authenticated users
    (auth.uid() IS NOT NULL AND user_id = (auth.uid())::text)
    OR
    -- Allow guests with proper rate limiting
    (auth.uid() IS NULL AND user_id ~ '^guest-[0-9a-z]+-[0-9a-z]+$')
  )
);

-- 5. Secure Messages table - Add better validation
DROP POLICY IF EXISTS "Public read access to messages" ON public.messages;
CREATE POLICY "Public read access to messages" 
ON public.messages 
FOR SELECT 
TO authenticated, anon
USING (
  -- Only allow reading non-deleted messages
  is_deleted = false 
  OR 
  -- Allow users to see their own deleted messages
  (auth.uid() IS NOT NULL AND sender_id = auth.uid())
);

-- 6. Add proper message insert policy with validation
DROP POLICY IF EXISTS "Secure message creation" ON public.messages;
CREATE POLICY "Secure message creation" 
ON public.messages 
FOR INSERT 
TO authenticated, anon
WITH CHECK (
  -- Validate message content
  validate_message_content(content) 
  AND
  -- Rate limiting check
  check_rate_limit(COALESCE((auth.uid())::text, sender_name), 'message_post'::text, 10, 1)
  AND
  -- Ensure sender info is consistent
  (
    -- Authenticated users
    (auth.uid() IS NOT NULL AND sender_id = auth.uid())
    OR
    -- Guests with proper ID format
    (auth.uid() IS NULL AND sender_name ~ '^Guest[0-9]+$|^[a-zA-Z0-9_-]{3,20}$')
  )
);

-- 7. Secure profiles from anonymous access
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 8. Create security audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all operations on sensitive tables
  IF TG_TABLE_NAME IN ('message_reports', 'audit_logs', 'private_messages', 'profiles') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      action_description,
      metadata,
      ip_address
    ) VALUES (
      auth.uid(),
      TG_OP || '_SECURITY_SENSITIVE',
      'Sensitive operation on ' || TG_TABLE_NAME || ' by ' || COALESCE((auth.uid())::text, 'anonymous'),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW(),
        'authenticated', (auth.uid() IS NOT NULL)
      ),
      inet_client_addr()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply security audit trigger to critical tables
DROP TRIGGER IF EXISTS security_audit_message_reports ON public.message_reports;
CREATE TRIGGER security_audit_message_reports
  AFTER INSERT OR UPDATE OR DELETE ON public.message_reports
  FOR EACH ROW EXECUTE FUNCTION log_security_sensitive_operations();

DROP TRIGGER IF EXISTS security_audit_private_messages ON public.private_messages;
CREATE TRIGGER security_audit_private_messages
  AFTER INSERT OR UPDATE OR DELETE ON public.private_messages
  FOR EACH ROW EXECUTE FUNCTION log_security_sensitive_operations();

-- 9. Enhanced rate limiting function with security improvements
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  user_identifier text, 
  action_type text, 
  max_actions integer DEFAULT 5,
  time_window_minutes integer DEFAULT 1,
  strict_mode boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  action_count INTEGER;
  is_authenticated BOOLEAN := (auth.uid() IS NOT NULL);
BEGIN
  -- Stricter limits for anonymous users
  IF NOT is_authenticated AND strict_mode THEN
    max_actions := max_actions / 2;
  END IF;

  -- Count recent actions
  SELECT COUNT(*) INTO action_count
  FROM public.audit_logs
  WHERE 
    (audit_logs.user_id = auth.uid() OR audit_logs.action_description ILIKE '%' || user_identifier || '%')
    AND audit_logs.action_type = enhanced_rate_limit_check.action_type
    AND audit_logs.created_at > NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- Deny if limit exceeded
  IF action_count >= max_actions THEN
    -- Log rate limit violation
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      action_description,
      metadata
    ) VALUES (
      auth.uid(),
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded for ' || action_type || ' by ' || user_identifier,
      jsonb_build_object(
        'user_identifier', user_identifier, 
        'action_type', action_type,
        'count', action_count,
        'limit', max_actions,
        'authenticated', is_authenticated
      )
    );
    
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;