-- Add read status tracking to private messages
ALTER TABLE public.private_messages 
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Create index for better performance when querying unread messages
CREATE INDEX idx_private_messages_unread ON public.private_messages(receiver_id, is_read, created_at) WHERE is_read = FALSE;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_private_messages_as_read(p_sender_id UUID, p_receiver_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.private_messages 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE 
    sender_id = p_sender_id 
    AND receiver_id = p_receiver_id 
    AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Create function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_private_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.private_messages
  WHERE receiver_id = p_user_id 
    AND is_read = FALSE;
$$;

-- Create function to get unread conversation partners
CREATE OR REPLACE FUNCTION get_unread_conversation_partners(p_user_id UUID)
RETURNS TABLE(
  sender_id UUID,
  sender_name TEXT,
  unread_count BIGINT,
  latest_message TEXT,
  latest_message_time TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    pm.sender_id,
    pm.sender_name,
    COUNT(*) as unread_count,
    MAX(pm.content) as latest_message,
    MAX(pm.created_at) as latest_message_time
  FROM public.private_messages pm
  WHERE pm.receiver_id = p_user_id 
    AND pm.is_read = FALSE
  GROUP BY pm.sender_id, pm.sender_name
  ORDER BY MAX(pm.created_at) DESC;
$$;