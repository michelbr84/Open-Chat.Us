-- First, drop all policies that reference the user_id column
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.message_reactions;

-- Also drop existing chat_messages policies to fix them too
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Now change the column type
ALTER TABLE public.message_reactions 
ALTER COLUMN user_id TYPE text USING user_id::text;