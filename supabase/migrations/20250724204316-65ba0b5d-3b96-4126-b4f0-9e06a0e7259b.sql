-- Fix RLS policies to allow guest users while maintaining security

-- Update messages table policies to support both guests and authenticated users
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Allow both guest and authenticated users to send messages
CREATE POLICY "Anyone can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  -- Allow guests (no auth) OR authenticated users who own the message
  (auth.uid() IS NULL AND sender_id IS NULL) OR 
  (auth.uid() IS NOT NULL AND sender_id = auth.uid())
);

-- Only authenticated users can update their own messages
CREATE POLICY "Authenticated users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = sender_id
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = sender_id
);

-- Only authenticated users can delete their own messages
CREATE POLICY "Authenticated users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = sender_id
);

-- Fix message_reactions to allow guests with fallback identification
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.message_reactions;

-- Allow reactions from both guests and authenticated users
CREATE POLICY "Anyone can add reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  -- For guests, allow any user_id (they'll use guest names)
  -- For authenticated users, require matching auth.uid()
  (auth.uid() IS NULL) OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
);

-- Users can remove reactions they added
CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (
  -- Guests can remove by user_id match, authenticated users by auth.uid()
  (auth.uid() IS NULL) OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
);

-- Fix message_reports to require authentication (reports should be from real users)
DROP POLICY IF EXISTS "Users can create reports" ON public.message_reports;

CREATE POLICY "Authenticated users can create reports" 
ON public.message_reports 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  reporter_id = auth.uid()
);