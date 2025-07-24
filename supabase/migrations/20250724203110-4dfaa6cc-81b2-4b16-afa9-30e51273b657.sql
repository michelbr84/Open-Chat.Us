-- Add message edit and delete functionality

-- Add edit tracking columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add edit tracking columns to chat_messages table (if it exists and is used)
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create message edit history table
CREATE TABLE IF NOT EXISTS public.message_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  editor_id UUID NOT NULL,
  original_content TEXT NOT NULL,
  new_content TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on message_edit_history
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_edit_history
CREATE POLICY "Users can view edit history of their own messages" 
ON public.message_edit_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages 
    WHERE id = message_edit_history.message_id 
    AND sender_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all edit history" 
ON public.message_edit_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);

CREATE POLICY "System can insert edit history" 
ON public.message_edit_history 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add trigger function to track message edits
CREATE OR REPLACE FUNCTION public.track_message_edits()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.message_edit_history (
      message_id, 
      editor_id, 
      original_content, 
      new_content
    ) VALUES (
      NEW.id,
      auth.uid(),
      OLD.content,
      NEW.content
    );
    
    -- Update edited_at timestamp
    NEW.edited_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for both message tables
DROP TRIGGER IF EXISTS track_message_edits_trigger ON public.messages;
CREATE TRIGGER track_message_edits_trigger
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.track_message_edits();

DROP TRIGGER IF EXISTS track_chat_message_edits_trigger ON public.chat_messages;
CREATE TRIGGER track_chat_message_edits_trigger
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.track_message_edits();

-- Add realtime support
ALTER TABLE public.message_edit_history REPLICA IDENTITY FULL;