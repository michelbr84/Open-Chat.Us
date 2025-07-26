-- ===================================
-- PHASE 3.1: MODERATION & ADMIN TOOLS
-- Database Foundation & Security Schema
-- ===================================

-- Create moderation status enum
CREATE TYPE public.moderation_status AS ENUM (
  'active',
  'warned', 
  'muted',
  'banned',
  'suspended'
);

-- Create moderation action enum  
CREATE TYPE public.moderation_action AS ENUM (
  'warn',
  'mute', 
  'unmute',
  'ban',
  'unban',
  'suspend',
  'unsuspend',
  'flag_message',
  'unflag_message',
  'delete_message'
);

-- User moderation status table
CREATE TABLE public.user_moderation_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status public.moderation_status NOT NULL DEFAULT 'active',
  muted_until TIMESTAMP WITH TIME ZONE NULL,
  banned_until TIMESTAMP WITH TIME ZONE NULL,
  total_warnings INTEGER NOT NULL DEFAULT 0,
  reputation_score INTEGER NOT NULL DEFAULT 100,
  is_shadow_banned BOOLEAN NOT NULL DEFAULT FALSE,
  last_infraction_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Moderation actions log table
CREATE TABLE public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action public.moderation_action NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  duration_minutes INTEGER NULL, -- For temporary mutes/bans
  message_id UUID NULL, -- Reference to specific message if applicable
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User warnings table
CREATE TABLE public.user_warnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  reason TEXT NOT NULL,
  severity INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high
  is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Flagged content table
CREATE TABLE public.flagged_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'message', 'user', 'attachment'
  content_id UUID NOT NULL, -- ID of the flagged item
  flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flag_reason TEXT NOT NULL,
  auto_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score DECIMAL(3,2) NULL, -- For auto-moderation confidence
  review_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE NULL,
  review_notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Word filter/blocklist table
CREATE TABLE public.content_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filter_type TEXT NOT NULL, -- 'profanity', 'spam', 'keyword'
  pattern TEXT NOT NULL,
  is_regex BOOLEAN NOT NULL DEFAULT FALSE,
  severity INTEGER NOT NULL DEFAULT 1, -- 1=warning, 2=auto-flag, 3=auto-moderate
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_moderation_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_filters ENABLE ROW LEVEL SECURITY;

-- ===================================
-- SECURITY POLICIES
-- ===================================

-- User moderation status policies
CREATE POLICY "Users can view their own moderation status"
ON public.user_moderation_status FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all moderation statuses"
ON public.user_moderation_status FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage moderation statuses"
ON public.user_moderation_status FOR ALL
USING (is_admin());

-- Moderation actions policies
CREATE POLICY "Admins can view all moderation actions"
ON public.moderation_actions FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can create moderation actions"
ON public.moderation_actions FOR INSERT
WITH CHECK (is_admin() AND moderator_id = auth.uid());

-- User warnings policies
CREATE POLICY "Users can view their own warnings"
ON public.user_warnings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all warnings"
ON public.user_warnings FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can issue warnings"
ON public.user_warnings FOR INSERT
WITH CHECK (is_admin() AND issued_by = auth.uid());

-- Flagged content policies
CREATE POLICY "Admins can view all flagged content"
ON public.flagged_content FOR SELECT
USING (is_admin());

CREATE POLICY "Users can flag content"
ON public.flagged_content FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage flagged content"
ON public.flagged_content FOR UPDATE
USING (is_admin());

-- Content filters policies
CREATE POLICY "Admins can manage content filters"
ON public.content_filters FOR ALL
USING (is_admin());

-- ===================================
-- HELPER FUNCTIONS
-- ===================================

-- Function to check if user is currently muted
CREATE OR REPLACE FUNCTION public.is_user_muted(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_moderation_status 
    WHERE user_id = user_id_param 
    AND status = 'muted'
    AND (muted_until IS NULL OR muted_until > now())
  );
$$;

-- Function to check if user is currently banned
CREATE OR REPLACE FUNCTION public.is_user_banned(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_moderation_status 
    WHERE user_id = user_id_param 
    AND status = 'banned'
    AND (banned_until IS NULL OR banned_until > now())
  );
$$;

-- Function to get user reputation score
CREATE OR REPLACE FUNCTION public.get_user_reputation(user_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(reputation_score, 100) 
  FROM public.user_moderation_status 
  WHERE user_id = user_id_param;
$$;

-- Function to apply moderation action
CREATE OR REPLACE FUNCTION public.apply_moderation_action(
  target_user_id UUID,
  action_type public.moderation_action,
  reason_text TEXT,
  duration_minutes INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  action_id UUID;
  expires_at_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only admins can apply moderation actions
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can apply moderation actions';
  END IF;
  
  -- Calculate expiration if duration is provided
  IF duration_minutes IS NOT NULL THEN
    expires_at_timestamp := now() + (duration_minutes || ' minutes')::INTERVAL;
  END IF;
  
  -- Insert moderation action
  INSERT INTO public.moderation_actions (
    target_user_id,
    moderator_id,
    action,
    reason,
    duration_minutes,
    expires_at
  ) VALUES (
    target_user_id,
    auth.uid(),
    action_type,
    reason_text,
    duration_minutes,
    expires_at_timestamp
  ) RETURNING id INTO action_id;
  
  -- Update user moderation status based on action
  INSERT INTO public.user_moderation_status (user_id, status, muted_until, banned_until)
  VALUES (target_user_id, 'active', NULL, NULL)
  ON CONFLICT (user_id) DO UPDATE SET
    status = CASE 
      WHEN action_type = 'mute' THEN 'muted'::public.moderation_status
      WHEN action_type = 'ban' THEN 'banned'::public.moderation_status
      WHEN action_type = 'warn' THEN 'warned'::public.moderation_status
      WHEN action_type IN ('unmute', 'unban') THEN 'active'::public.moderation_status
      ELSE public.user_moderation_status.status
    END,
    muted_until = CASE 
      WHEN action_type = 'mute' THEN expires_at_timestamp
      WHEN action_type = 'unmute' THEN NULL
      ELSE public.user_moderation_status.muted_until
    END,
    banned_until = CASE 
      WHEN action_type = 'ban' THEN expires_at_timestamp
      WHEN action_type = 'unban' THEN NULL
      ELSE public.user_moderation_status.banned_until
    END,
    total_warnings = CASE 
      WHEN action_type = 'warn' THEN public.user_moderation_status.total_warnings + 1
      ELSE public.user_moderation_status.total_warnings
    END,
    last_infraction_at = CASE 
      WHEN action_type IN ('warn', 'mute', 'ban') THEN now()
      ELSE public.user_moderation_status.last_infraction_at
    END,
    updated_at = now();
  
  RETURN action_id;
END;
$$;

-- ===================================
-- TRIGGERS
-- ===================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_user_moderation_status_updated_at
BEFORE UPDATE ON public.user_moderation_status
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_content_filters_updated_at
BEFORE UPDATE ON public.content_filters
FOR EACH ROW  
EXECUTE FUNCTION public.handle_updated_at();

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

-- Indexes for efficient moderation queries
CREATE INDEX idx_user_moderation_status_user_id ON public.user_moderation_status(user_id);
CREATE INDEX idx_user_moderation_status_status ON public.user_moderation_status(status);
CREATE INDEX idx_moderation_actions_target_user ON public.moderation_actions(target_user_id);
CREATE INDEX idx_moderation_actions_moderator ON public.moderation_actions(moderator_id);
CREATE INDEX idx_moderation_actions_created_at ON public.moderation_actions(created_at DESC);
CREATE INDEX idx_user_warnings_user_id ON public.user_warnings(user_id);
CREATE INDEX idx_flagged_content_review_status ON public.flagged_content(review_status);
CREATE INDEX idx_flagged_content_created_at ON public.flagged_content(created_at DESC);
CREATE INDEX idx_content_filters_active ON public.content_filters(is_active) WHERE is_active = true;