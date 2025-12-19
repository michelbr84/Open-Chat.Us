-- Add room_type and is_temporary columns to channels table
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS room_type text DEFAULT 'public',
ADD COLUMN IF NOT EXISTS is_temporary boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_participants integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;