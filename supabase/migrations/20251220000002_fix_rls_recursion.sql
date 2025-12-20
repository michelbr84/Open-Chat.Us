-- FIX: Infinite recursion in group_members RLS policies
-- Root cause: SELECT policy on group_members references itself, triggering infinite loop
-- Solution: Simplify policies to avoid self-referencing subqueries

-- ========================================
-- FIX 1: Drop all problematic policies on group_members
-- ========================================

DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can add group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave or admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON public.group_members;

-- ========================================
-- FIX 2: Recreate SELECT policy WITHOUT self-reference
-- ========================================
-- Users can see all members of channels they are allowed to see
-- This avoids infinite recursion by not referencing group_members in the policy

CREATE POLICY "Users can view group members"
ON public.group_members FOR SELECT
USING (
  -- Users can always see their own membership record
  user_id = auth.uid()
  -- Users can see other members if they are the channel creator
  OR EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = group_members.channel_id AND c.created_by = auth.uid()
  )
  -- Allow viewing if the channel is accessible (public channels)
  OR EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = group_members.channel_id AND c.type = 'public'
  )
);

-- ========================================
-- FIX 3: Recreate INSERT policy without self-reference
-- ========================================
-- Room creator can add members, or existing channel creators can add

CREATE POLICY "Users can add group members"
ON public.group_members FOR INSERT
WITH CHECK (
  -- Room creator can add the first member (themselves)
  EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = channel_id AND c.created_by = auth.uid()
  )
  -- Users can add themselves to public channels
  OR (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = channel_id AND c.type = 'public'
  ))
);

-- ========================================
-- FIX 4: Recreate DELETE policy without self-reference
-- ========================================

CREATE POLICY "Users can leave or admins can remove members"
ON public.group_members FOR DELETE
USING (
  -- Users can remove themselves (leave)
  user_id = auth.uid()
  -- Channel creators can remove anyone
  OR EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = group_members.channel_id AND c.created_by = auth.uid()
  )
);

-- ========================================
-- FIX 5: Recreate UPDATE policy without self-reference
-- ========================================

CREATE POLICY "Admins can update member roles"
ON public.group_members FOR UPDATE
USING (
  -- Channel creators can update roles
  EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = group_members.channel_id AND c.created_by = auth.uid()
  )
);
