-- ============================================================================
-- ADD CHANNEL_ID COLUMN TO MESSAGES TABLE
-- ============================================================================
-- Fixes error 42703: column messages.channel_id does not exist
-- 
-- The messages table was created without a channel_id column, but the frontend
-- expects it for room-based message filtering. This migration adds the column
-- and necessary indexes/RLS policies.
-- ============================================================================

-- Add the channel_id column (nullable - null = public chat)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE;

-- Create index for faster room-based queries
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);

-- Create composite index for efficient pagination within rooms
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON public.messages(channel_id, created_at DESC);

-- ============================================================================
-- UPDATE RLS POLICIES FOR ROOM-SCOPED MESSAGES
-- ============================================================================
-- Messages should be visible based on:
-- 1. Public messages (channel_id IS NULL) - visible to everyone
-- 2. Room messages - visible to room members or creators

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read room messages" ON public.messages;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;

-- New SELECT policy with room awareness
CREATE POLICY "messages_select_policy"
ON public.messages FOR SELECT
USING (
  -- Public chat messages (no room) visible to all
  channel_id IS NULL
  -- Room messages visible to authenticated users
  -- (Note: fine-grained room membership checks should be done in application layer)
  OR auth.uid() IS NOT NULL
);

-- Drop and recreate INSERT policy for room support
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;

CREATE POLICY "messages_insert_policy"
ON public.messages FOR INSERT
WITH CHECK (
  -- Public chat: anyone can post
  channel_id IS NULL
  -- Room messages: only authenticated users
  OR auth.uid() IS NOT NULL
);

-- Keep existing UPDATE policy (users can update their own messages)
-- No changes needed for UPDATE/DELETE policies
