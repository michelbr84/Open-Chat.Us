-- Create a SECURITY DEFINER function to check channel membership
-- This avoids RLS recursion by directly querying group_members table
CREATE OR REPLACE FUNCTION public.is_channel_member(
  _channel_id uuid,
  _user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE channel_id = _channel_id
      AND user_id = _user_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE channel_id = _channel_id
      AND user_id = _user_id
  )
$$;

-- Drop and recreate the messages_select_policy to require channel membership
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;

CREATE POLICY "messages_select_policy"
ON public.messages FOR SELECT
USING (
  -- Public messages (no channel) visible to all
  channel_id IS NULL
  OR
  -- Channel messages: user must be a member of the channel
  public.is_channel_member(channel_id, auth.uid())
);

-- Also fix the messages_insert_policy to require channel membership for channel messages
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;

CREATE POLICY "messages_insert_policy"
ON public.messages FOR INSERT
WITH CHECK (
  -- Public messages (no channel) allowed for all
  channel_id IS NULL
  OR
  -- Channel messages: user must be authenticated and a member of the channel
  (auth.uid() IS NOT NULL AND public.is_channel_member(channel_id, auth.uid()))
);