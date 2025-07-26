-- Drop existing policies first, then recreate enhanced schema
DROP POLICY IF EXISTS "Admins can manage content filters" ON public.content_filters;
DROP POLICY IF EXISTS "Public read for active filters" ON public.content_filters;

-- Enhanced Moderation System Database Schema
-- Create moderation_queue table for manual review
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'message', 'user_profile', etc.
  content_text TEXT NOT NULL,
  author_id UUID,
  author_name TEXT,
  flagged_by_filter_id UUID,
  flagged_by_user_id UUID,
  auto_flagged BOOLEAN NOT NULL DEFAULT false,
  confidence_score NUMERIC(3,2),
  priority_level INTEGER NOT NULL DEFAULT 1, -- 1-5, higher = more urgent
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'escalated'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  action_taken TEXT, -- 'approved', 'content_removed', 'user_warned', 'user_muted', 'user_banned'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate limiting tracking
CREATE TABLE IF NOT EXISTS public.rate_limit_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  channel_context TEXT,
  violation_count INTEGER NOT NULL DEFAULT 1,
  time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  last_violation_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin notifications for real-time alerts
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL, -- 'high_priority_flag', 'mass_violations', 'system_alert'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority_level INTEGER NOT NULL DEFAULT 1,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_by UUID[],
  metadata JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to content_filters if they don't exist
ALTER TABLE public.content_filters 
ADD COLUMN IF NOT EXISTS filter_type TEXT NOT NULL DEFAULT 'regex',
ADD COLUMN IF NOT EXISTS severity_level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT 'flag',
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Recreate content_filters policies
CREATE POLICY "Admins can manage content filters" 
ON public.content_filters FOR ALL 
USING (is_admin());

CREATE POLICY "Public read for active filters" 
ON public.content_filters FOR SELECT 
USING (is_active = true);

-- RLS Policies for moderation_queue
CREATE POLICY "Admins can manage moderation queue" 
ON public.moderation_queue FOR ALL 
USING (is_admin());

-- RLS Policies for rate_limit_violations
CREATE POLICY "Admins can view rate limit violations" 
ON public.rate_limit_violations FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert violations" 
ON public.rate_limit_violations FOR INSERT 
WITH CHECK (true);

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can manage notifications" 
ON public.admin_notifications FOR ALL 
USING (is_admin());

-- Enhanced content validation function
CREATE OR REPLACE FUNCTION public.enhanced_content_validation(
  content_text text,
  user_id_param uuid DEFAULT NULL,
  context_type text DEFAULT 'message'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  filter_result RECORD;
  user_reputation INTEGER := 100;
  violation_score INTEGER := 0;
  triggered_filters jsonb := '[]'::jsonb;
  action_required TEXT := 'allow';
  confidence NUMERIC := 0.0;
BEGIN
  -- Get user reputation if user is provided
  IF user_id_param IS NOT NULL THEN
    SELECT COALESCE(reputation_score, 100) INTO user_reputation
    FROM public.user_moderation_status 
    WHERE user_id = user_id_param;
  END IF;
  
  -- Check against active content filters
  FOR filter_result IN 
    SELECT cf.*, 
           CASE 
             WHEN COALESCE(cf.filter_type, 'regex') = 'regex' THEN content_text ~* cf.filter_pattern
             WHEN cf.filter_type = 'keyword' THEN LOWER(content_text) LIKE '%' || LOWER(cf.filter_pattern) || '%'
             WHEN cf.filter_type = 'phrase' THEN LOWER(content_text) = LOWER(cf.filter_pattern)
             ELSE false
           END AS matches
    FROM public.content_filters cf
    WHERE cf.is_active = true
  LOOP
    IF filter_result.matches THEN
      -- Add to triggered filters
      triggered_filters := triggered_filters || jsonb_build_object(
        'filter_id', filter_result.id,
        'filter_name', filter_result.filter_name,
        'severity_level', COALESCE(filter_result.severity_level, 1),
        'action_type', COALESCE(filter_result.action_type, 'flag')
      );
      
      -- Accumulate violation score
      violation_score := violation_score + COALESCE(filter_result.severity_level, 1);
      
      -- Determine most severe action required
      IF COALESCE(filter_result.action_type, 'flag') = 'auto_remove' AND action_required != 'auto_remove' THEN
        action_required := 'auto_remove';
      ELSIF filter_result.action_type = 'warn' AND action_required = 'allow' THEN
        action_required := 'warn';
      ELSIF COALESCE(filter_result.action_type, 'flag') = 'flag' AND action_required = 'allow' THEN
        action_required := 'flag';
      END IF;
    END IF;
  END LOOP;
  
  -- Calculate confidence score (0.0 to 1.0)
  confidence := LEAST(violation_score / 10.0, 1.0);
  
  -- Adjust action based on user reputation
  IF user_reputation < 50 AND violation_score > 0 THEN
    action_required := CASE 
      WHEN action_required = 'flag' THEN 'warn'
      WHEN action_required = 'warn' THEN 'auto_remove'
      ELSE action_required
    END;
  END IF;
  
  RETURN jsonb_build_object(
    'action_required', action_required,
    'violation_score', violation_score,
    'confidence_score', confidence,
    'triggered_filters', triggered_filters,
    'user_reputation', user_reputation
  );
END;
$$;

-- Function to create moderation queue entry
CREATE OR REPLACE FUNCTION public.create_moderation_queue_entry(
  p_content_id uuid,
  p_content_type text,
  p_content_text text,
  p_author_id uuid DEFAULT NULL,
  p_author_name text DEFAULT NULL,
  p_filter_id uuid DEFAULT NULL,
  p_flagged_by_user uuid DEFAULT NULL,
  p_auto_flagged boolean DEFAULT true,
  p_confidence_score numeric DEFAULT NULL,
  p_priority_level integer DEFAULT 1
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  queue_id UUID;
BEGIN
  INSERT INTO public.moderation_queue (
    content_id,
    content_type,
    content_text,
    author_id,
    author_name,
    flagged_by_filter_id,
    flagged_by_user_id,
    auto_flagged,
    confidence_score,
    priority_level
  ) VALUES (
    p_content_id,
    p_content_type,
    p_content_text,
    p_author_id,
    p_author_name,
    p_filter_id,
    p_flagged_by_user,
    p_auto_flagged,
    p_confidence_score,
    p_priority_level
  ) RETURNING id INTO queue_id;
  
  -- Create admin notification for high priority items
  IF p_priority_level >= 4 THEN
    INSERT INTO public.admin_notifications (
      notification_type,
      title,
      message,
      priority_level,
      metadata
    ) VALUES (
      'high_priority_flag',
      'High Priority Content Flagged',
      'Content with high violation confidence requires immediate review',
      p_priority_level,
      jsonb_build_object(
        'queue_id', queue_id,
        'content_type', p_content_type,
        'confidence_score', p_confidence_score
      )
    );
  END IF;
  
  RETURN queue_id;
END;
$$;

-- Function to process moderation queue action
CREATE OR REPLACE FUNCTION public.process_moderation_action(
  p_queue_id uuid,
  p_action text,
  p_review_notes text DEFAULT NULL,
  p_duration_minutes integer DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  queue_item RECORD;
  action_id UUID;
BEGIN
  -- Only admins can process moderation actions
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can process moderation actions';
  END IF;
  
  -- Get queue item
  SELECT * INTO queue_item
  FROM public.moderation_queue
  WHERE id = p_queue_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Queue item not found or already processed';
  END IF;
  
  -- Update queue item
  UPDATE public.moderation_queue
  SET 
    status = CASE 
      WHEN p_action IN ('approved', 'content_removed') THEN 'approved'
      WHEN p_action IN ('user_warned', 'user_muted', 'user_banned') THEN 'rejected'
      ELSE 'escalated'
    END,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_notes = p_review_notes,
    action_taken = p_action,
    updated_at = now()
  WHERE id = p_queue_id;
  
  -- Apply user action if needed
  IF queue_item.author_id IS NOT NULL AND p_action IN ('user_warned', 'user_muted', 'user_banned') THEN
    SELECT apply_moderation_action(
      queue_item.author_id,
      CASE 
        WHEN p_action = 'user_warned' THEN 'warn'::moderation_action
        WHEN p_action = 'user_muted' THEN 'mute'::moderation_action
        WHEN p_action = 'user_banned' THEN 'ban'::moderation_action
      END,
      COALESCE(p_review_notes, 'Moderation queue action'),
      p_duration_minutes
    ) INTO action_id;
  END IF;
  
  RETURN true;
END;
$$;

-- Enable realtime for admin notifications and moderation queue
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.moderation_queue REPLICA IDENTITY FULL;