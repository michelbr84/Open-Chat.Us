-- Create contacts/friends table
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_user_id uuid NOT NULL,
  nickname text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, contact_user_id)
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for contacts - users can only see/manage their own contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own contacts"
ON public.contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own contacts"
ON public.contacts FOR DELETE
USING (auth.uid() = user_id);

-- Create group_members table for group chat participants
CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamp with time zone DEFAULT now(),
  invited_by uuid,
  UNIQUE(channel_id, user_id)
);

-- Enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_members
CREATE POLICY "Users can view members of groups they belong to"
ON public.group_members FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.group_members gm 
    WHERE gm.channel_id = group_members.channel_id
  )
);

CREATE POLICY "Group admins can add members"
ON public.group_members FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.group_members gm 
    WHERE gm.channel_id = channel_id AND gm.role = 'admin'
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.group_members gm WHERE gm.channel_id = channel_id
  )
);

CREATE POLICY "Group admins can remove members"
ON public.group_members FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.group_members gm 
    WHERE gm.channel_id = group_members.channel_id AND gm.role = 'admin'
  )
  OR auth.uid() = user_id
);

-- Function to cleanup temporary rooms
CREATE OR REPLACE FUNCTION public.cleanup_temporary_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.channels 
  WHERE is_temporary = true 
  AND expires_at IS NOT NULL 
  AND expires_at < now();
END;
$$;

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;