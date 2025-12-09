-- Fix for RLS Volatile Function Issue
-- Moving rate limiting from RLS policies to BEFORE INSERT triggers

-- 1. Create a wrapper function for the trigger
CREATE OR REPLACE FUNCTION public.trigger_check_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rate_limit_result BOOLEAN;
  action_type TEXT;
  max_actions INTEGER;
BEGIN
  -- Determine action type and limits based on table
  IF TG_TABLE_NAME = 'messages' THEN
    action_type := 'public_message_post';
    -- 15 per minute for auth, 8 for guest
    IF auth.uid() IS NOT NULL THEN
      max_actions := 15;
    ELSE
      max_actions := 8;
    END IF;
  ELSIF TG_TABLE_NAME = 'chat_messages' THEN
    action_type := 'chat_message_post';
    -- 10 per minute for auth, 5 for guest
    IF auth.uid() IS NOT NULL THEN
      max_actions := 10;
    ELSE
      max_actions := 5;
    END IF;
  ELSIF TG_TABLE_NAME = 'message_reactions' THEN
    action_type := 'reaction_add';
    max_actions := 20;
  ELSE
    -- Fallback default
    action_type := 'generic_post';
    max_actions := 10;
  END IF;

  -- Call the existing check_rate_limit function
  -- Note: We use COALESCE to handle both auth and guest users
  rate_limit_result := public.check_rate_limit(
    COALESCE(auth.uid()::text, NEW.sender_name, NEW.user_id, 'guest'), 
    action_type,
    max_actions,
    1
  );

  IF rate_limit_result = FALSE THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more messages.';
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Drop existing problematic policies and recreate them WITHOUT check_rate_limit

-- --- MESSAGES TABLE ---
DROP POLICY IF EXISTS "Secure message posting" ON public.messages;

CREATE POLICY "Secure message posting" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  -- Validate content (keep this as it is likely strictly stable/immutable or doesn't write)
  validate_message_content(content) AND
  -- Ensure proper user identification
  (
    (auth.uid() IS NULL AND sender_name IS NOT NULL AND LENGTH(sender_name) > 0) OR 
    (auth.uid() IS NOT NULL AND sender_id = auth.uid())
  )
);

-- Access the existing security monitor trigger to ensure we don't duplicate or conflict
-- (The existing one logs attempts but doesn't block. We want to BLOCK if rate limit exceeded.)
-- So we add our new trigger BEFORE the insert. Trigger order is alphabetical by default, but we can rely on standard execution.

DROP TRIGGER IF EXISTS tr_rate_limit_messages ON public.messages;
CREATE TRIGGER tr_rate_limit_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_rate_limit();


-- --- CHAT_MESSAGES TABLE ---
DROP POLICY IF EXISTS "Secure chat message creation" ON public.chat_messages;

CREATE POLICY "Secure chat message creation" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Validate content
  validate_message_content(content) AND
  -- Ensure proper user identification for authenticated users
  (auth.uid() IS NULL OR (auth.uid() IS NOT NULL AND user_id = auth.uid()))
);

DROP TRIGGER IF EXISTS tr_rate_limit_chat_messages ON public.chat_messages;
CREATE TRIGGER tr_rate_limit_chat_messages
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_rate_limit();


-- --- MESSAGE_REACTIONS TABLE ---
DROP POLICY IF EXISTS "Secure reaction creation" ON public.message_reactions;

CREATE POLICY "Secure reaction creation" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  -- Ensure valid user identification
  user_id IS NOT NULL AND LENGTH(user_id) > 0
);

DROP TRIGGER IF EXISTS tr_rate_limit_reactions ON public.message_reactions;
CREATE TRIGGER tr_rate_limit_reactions
  BEFORE INSERT ON public.message_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_rate_limit();
