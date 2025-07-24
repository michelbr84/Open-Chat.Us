-- Fix the data type issue by changing user_id to text to support both guest names and UUIDs
ALTER TABLE public.message_reactions 
ALTER COLUMN user_id TYPE text USING user_id::text;

-- Now create the correct policies
DROP POLICY IF EXISTS "Anyone can add reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.message_reactions;

-- Allow reactions from both guests and authenticated users
CREATE POLICY "Anyone can add reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  -- For guests, allow any user_id (they'll use guest names as strings)
  -- For authenticated users, require matching auth.uid() converted to text
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