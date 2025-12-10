-- Fix the search_path warnings by updating the existing functions
-- The linter warnings are for validate_message_content and trigger_check_rate_limit

CREATE OR REPLACE FUNCTION public.validate_message_content(content text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.trigger_check_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Placeholder - will add rate limit logic later if check_rate_limit exists/is created
  RETURN NEW;
END;
$function$;