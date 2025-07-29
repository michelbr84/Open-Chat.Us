-- Add is_bot_message column to messages table to identify bot messages
ALTER TABLE public.messages ADD COLUMN is_bot_message BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering bot messages
CREATE INDEX idx_messages_is_bot_message ON public.messages(is_bot_message);

-- Add comment for documentation
COMMENT ON COLUMN public.messages.is_bot_message IS 'Indicates if this message was sent by an AI bot';