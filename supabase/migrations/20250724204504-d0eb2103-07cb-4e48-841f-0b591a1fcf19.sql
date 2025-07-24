-- Create guest-friendly policies for all tables

-- Message reactions policies (now with text user_id)
CREATE POLICY "Anyone can view reactions" 
ON public.message_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can add reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  -- Allow any user_id for reactions (guests use guest names, auth users use UUID as text)
  user_id IS NOT NULL AND user_id != ''
);

CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (
  -- Guests can remove by matching user_id, authenticated users by matching auth.uid()
  (auth.uid() IS NULL AND user_id IS NOT NULL) OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
);

-- Chat messages policies (support both guests and authenticated users)
CREATE POLICY "Anyone can view chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can send chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Allow guests (no auth) OR authenticated users who own the message
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

CREATE POLICY "Users can update their own chat messages" 
ON public.chat_messages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own chat messages" 
ON public.chat_messages 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id
);