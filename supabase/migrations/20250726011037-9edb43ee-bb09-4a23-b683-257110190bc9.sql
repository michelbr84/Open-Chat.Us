-- Add mentions support to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS mentions jsonb DEFAULT '[]'::jsonb;

-- Create index for mentions for better performance
CREATE INDEX IF NOT EXISTS idx_messages_mentions ON messages USING gin(mentions);

-- Add function to check if a user is mentioned in a message
CREATE OR REPLACE FUNCTION is_user_mentioned(mentions_json jsonb, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(mentions_json) AS mention
    WHERE mention->>'user_id' = user_id_param::text
  );
$$;