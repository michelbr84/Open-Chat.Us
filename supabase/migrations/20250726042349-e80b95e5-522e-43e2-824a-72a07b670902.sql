-- Enhanced User Management System Database Schema

-- Create user_profiles table if it doesn't exist with enhanced fields
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  total_messages INTEGER NOT NULL DEFAULT 0,
  total_reports_received INTEGER NOT NULL DEFAULT 0,
  total_reports_made INTEGER NOT NULL DEFAULT 0
);

-- Enhanced user moderation status with detailed tracking
CREATE TABLE IF NOT EXISTS public.user_moderation_detailed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  moderator_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'reputation_change', 'warning_issued', 'mute', 'ban', 'unban', 'unmute'
  previous_value JSONB,
  new_value JSONB,
  reason TEXT NOT NULL,
  duration_minutes INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Bulk action operations tracking
CREATE TABLE IF NOT EXISTS public.bulk_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES auth.users(id),
  operation_type TEXT NOT NULL, -- 'bulk_ban', 'bulk_unban', 'bulk_delete_messages', etc.
  target_count INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  filters_applied JSONB,
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User activity metrics for reputation calculation
CREATE TABLE IF NOT EXISTS public.user_activity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  reactions_given INTEGER NOT NULL DEFAULT 0,
  reactions_received INTEGER NOT NULL DEFAULT 0,
  reports_made INTEGER NOT NULL DEFAULT 0,
  reports_received INTEGER NOT NULL DEFAULT 0,
  uptime_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moderation_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage user profiles" 
ON public.user_profiles FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can manage moderation details" 
ON public.user_moderation_detailed FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own moderation history" 
ON public.user_moderation_detailed FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage bulk operations" 
ON public.bulk_operations FOR ALL 
USING (is_admin());

CREATE POLICY "Admins can view activity metrics" 
ON public.user_activity_metrics FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert activity metrics" 
ON public.user_activity_metrics FOR INSERT 
WITH CHECK (true);

-- Function to calculate user reputation score
CREATE OR REPLACE FUNCTION public.calculate_user_reputation(
  user_id_param uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  base_score INTEGER := 100;
  message_bonus INTEGER := 0;
  reaction_bonus INTEGER := 0;
  report_penalty INTEGER := 0;
  moderation_penalty INTEGER := 0;
  final_score INTEGER;
BEGIN
  -- Calculate bonuses and penalties
  SELECT 
    LEAST(total_messages * 2, 200), -- Max 200 points from messages
    0, -- Will calculate reaction bonus separately
    total_reports_received * -10, -- -10 per report
    0 -- Will calculate moderation penalty separately
  INTO message_bonus, reaction_bonus, report_penalty, moderation_penalty
  FROM public.user_profiles
  WHERE id = user_id_param;
  
  -- Calculate reaction bonus from activity metrics
  SELECT COALESCE(SUM(reactions_received * 2), 0)
  INTO reaction_bonus
  FROM public.user_activity_metrics
  WHERE user_activity_metrics.user_id = user_id_param
  AND date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Calculate moderation penalties
  SELECT COALESCE(COUNT(*) * -25, 0)
  INTO moderation_penalty
  FROM public.user_moderation_detailed
  WHERE user_moderation_detailed.user_id = user_id_param
  AND action_type IN ('warning_issued', 'mute', 'ban')
  AND created_at >= CURRENT_DATE - INTERVAL '90 days';
  
  final_score := base_score + message_bonus + LEAST(reaction_bonus, 100) + report_penalty + moderation_penalty;
  
  -- Ensure score is within bounds
  final_score := GREATEST(final_score, 0);
  final_score := LEAST(final_score, 1000);
  
  RETURN final_score;
END;
$$;

-- Function to get user moderation summary
CREATE OR REPLACE FUNCTION public.get_user_moderation_summary(
  user_id_param uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  total_warnings INTEGER;
  total_mutes INTEGER;
  total_bans INTEGER;
  active_restrictions jsonb := '[]'::jsonb;
  recent_actions jsonb;
BEGIN
  -- Only admins can access moderation summaries
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Count moderation actions
  SELECT 
    COALESCE(SUM(CASE WHEN action_type = 'warning_issued' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN action_type = 'mute' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN action_type = 'ban' THEN 1 ELSE 0 END), 0)
  INTO total_warnings, total_mutes, total_bans
  FROM public.user_moderation_detailed
  WHERE user_id = user_id_param;
  
  -- Get active restrictions
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', action_type,
      'expires_at', expires_at,
      'reason', reason,
      'created_at', created_at
    )
  )
  INTO active_restrictions
  FROM public.user_moderation_detailed
  WHERE user_id = user_id_param
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
  
  -- Get recent actions (last 10)
  SELECT jsonb_agg(
    jsonb_build_object(
      'action_type', action_type,
      'reason', reason,
      'created_at', created_at,
      'expires_at', expires_at,
      'is_active', is_active
    )
    ORDER BY created_at DESC
  )
  INTO recent_actions
  FROM (
    SELECT * FROM public.user_moderation_detailed
    WHERE user_id = user_id_param
    ORDER BY created_at DESC
    LIMIT 10
  ) recent;
  
  result := jsonb_build_object(
    'total_warnings', total_warnings,
    'total_mutes', total_mutes,
    'total_bans', total_bans,
    'active_restrictions', COALESCE(active_restrictions, '[]'::jsonb),
    'recent_actions', COALESCE(recent_actions, '[]'::jsonb),
    'reputation_score', calculate_user_reputation(user_id_param)
  );
  
  RETURN result;
END;
$$;

-- Function to perform bulk user actions
CREATE OR REPLACE FUNCTION public.perform_bulk_user_action(
  user_ids uuid[],
  action_type text,
  reason text,
  duration_minutes integer DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  operation_id UUID;
  user_id UUID;
  success_count INTEGER := 0;
  fail_count INTEGER := 0;
BEGIN
  -- Only admins can perform bulk actions
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can perform bulk actions';
  END IF;
  
  -- Create bulk operation record
  INSERT INTO public.bulk_operations (
    operator_id,
    operation_type,
    target_count,
    status,
    filters_applied
  ) VALUES (
    auth.uid(),
    action_type,
    array_length(user_ids, 1),
    'processing',
    jsonb_build_object('user_ids', user_ids)
  ) RETURNING id INTO operation_id;
  
  -- Process each user
  FOREACH user_id IN ARRAY user_ids
  LOOP
    BEGIN
      CASE action_type
        WHEN 'bulk_ban' THEN
          INSERT INTO public.user_moderation_detailed (
            user_id, moderator_id, action_type, reason, duration_minutes,
            expires_at, new_value
          ) VALUES (
            user_id, auth.uid(), 'ban', reason, duration_minutes,
            CASE WHEN duration_minutes IS NOT NULL 
                 THEN now() + (duration_minutes || ' minutes')::INTERVAL 
                 ELSE NULL END,
            jsonb_build_object('banned', true)
          );
          
        WHEN 'bulk_unban' THEN
          -- Deactivate existing bans
          UPDATE public.user_moderation_detailed 
          SET is_active = false 
          WHERE user_id = user_id AND action_type = 'ban' AND is_active = true;
          
          INSERT INTO public.user_moderation_detailed (
            user_id, moderator_id, action_type, reason, new_value
          ) VALUES (
            user_id, auth.uid(), 'unban', reason,
            jsonb_build_object('banned', false)
          );
          
        WHEN 'bulk_mute' THEN
          INSERT INTO public.user_moderation_detailed (
            user_id, moderator_id, action_type, reason, duration_minutes,
            expires_at, new_value
          ) VALUES (
            user_id, auth.uid(), 'mute', reason, duration_minutes,
            CASE WHEN duration_minutes IS NOT NULL 
                 THEN now() + (duration_minutes || ' minutes')::INTERVAL 
                 ELSE NULL END,
            jsonb_build_object('muted', true)
          );
          
        ELSE
          RAISE EXCEPTION 'Unsupported bulk action type: %', action_type;
      END CASE;
      
      success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      fail_count := fail_count + 1;
    END;
  END LOOP;
  
  -- Update operation status
  UPDATE public.bulk_operations
  SET 
    status = CASE WHEN fail_count = 0 THEN 'completed' ELSE 'partial' END,
    completed_count = success_count,
    failed_count = fail_count,
    completed_at = now()
  WHERE id = operation_id;
  
  RETURN operation_id;
END;
$$;

-- Enable realtime for user management
ALTER TABLE public.user_moderation_detailed REPLICA IDENTITY FULL;
ALTER TABLE public.bulk_operations REPLICA IDENTITY FULL;