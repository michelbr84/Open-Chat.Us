-- Add is_bot_message column to messages table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'is_bot_message'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN is_bot_message boolean DEFAULT false;
    END IF;
END $$;