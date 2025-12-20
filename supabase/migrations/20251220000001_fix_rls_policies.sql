-- Fix RLS policies for channels and group_members
-- This migration fixes the "ghost rooms" bug where rooms are created but not visible

-- ========================================
-- FIX 1: Channels SELECT policy
-- ========================================
-- Problem: Private rooms created by user are not visible because policy only allows public OR true
-- Solution: Allow users to see channels they created OR are members of

DROP POLICY IF EXISTS "Anyone can view public channels" ON public.channels;

CREATE POLICY "Users can view accessible channels"
ON public.channels FOR SELECT
USING (
  -- Public channels visible to all
  type = 'public'
  -- Creator can always see their own channels
  OR created_by = auth.uid()
  -- Members can see channels they belong to
  OR id IN (
    SELECT channel_id FROM public.group_members WHERE user_id = auth.uid()
  )
);

-- ========================================
-- FIX 2: Channels UPDATE/DELETE policies
-- ========================================
-- Allow creators to manage their channels

DROP POLICY IF EXISTS "Creators can update channels" ON public.channels;
CREATE POLICY "Creators can update channels"
ON public.channels FOR UPDATE
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Creators can delete channels" ON public.channels;
CREATE POLICY "Creators can delete channels"
ON public.channels FOR DELETE
USING (created_by = auth.uid());

-- ========================================
-- FIX 3: group_members SELECT policy
-- ========================================
-- Problem: Self-referential query blocks first member from seeing their own entry
-- Solution: Allow users to see their own membership records directly

DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;

CREATE POLICY "Users can view group members"
ON public.group_members FOR SELECT
USING (
  -- Users can always see their own membership record
  user_id = auth.uid()
  -- Users can view other members if they are in the same group
  OR channel_id IN (
    SELECT gm.channel_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
  )
);

-- ========================================
-- FIX 4: group_members INSERT policy
-- ========================================
-- Problem: Ambiguous channel_id reference in policy check
-- Solution: Clear policy - admins can add, or first member allowed

DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;

CREATE POLICY "Users can add group members"
ON public.group_members FOR INSERT
WITH CHECK (
  -- Room creator can add the first member (themselves)
  EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = channel_id AND c.created_by = auth.uid()
  )
  -- Existing admins can add new members
  OR EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.channel_id = group_members.channel_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
);

-- ========================================
-- FIX 5: group_members DELETE policy
-- ========================================
-- Ensure admins can remove and users can leave

DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;

CREATE POLICY "Users can leave or admins can remove members"
ON public.group_members FOR DELETE
USING (
  -- Users can remove themselves (leave)
  user_id = auth.uid()
  -- Admins can remove others
  OR EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.channel_id = group_members.channel_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
);

-- ========================================
-- FIX 6: group_members UPDATE policy for role changes
-- ========================================

DROP POLICY IF EXISTS "Admins can update member roles" ON public.group_members;

CREATE POLICY "Admins can update member roles"
ON public.group_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.channel_id = group_members.channel_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
);
