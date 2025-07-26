-- Fix security issues for moderation tables
-- Update RLS policies to be more restrictive

-- Update user moderation status policies to be more restrictive
DROP POLICY IF EXISTS "Admins can view all moderation statuses" ON public.user_moderation_status;
DROP POLICY IF EXISTS "Admins can manage moderation statuses" ON public.user_moderation_status;

CREATE POLICY "Admins can view all moderation statuses"
ON public.user_moderation_status FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can manage moderation statuses"
ON public.user_moderation_status FOR ALL
TO authenticated
USING (is_admin());

-- Update moderation actions policies
DROP POLICY IF EXISTS "Admins can view all moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Admins can create moderation actions" ON public.moderation_actions;

CREATE POLICY "Admins can view all moderation actions"
ON public.moderation_actions FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can create moderation actions"
ON public.moderation_actions FOR INSERT
TO authenticated
WITH CHECK (is_admin() AND moderator_id = auth.uid());

-- Update user warnings policies
DROP POLICY IF EXISTS "Admins can view all warnings" ON public.user_warnings;
DROP POLICY IF EXISTS "Admins can issue warnings" ON public.user_warnings;

CREATE POLICY "Admins can view all warnings"
ON public.user_warnings FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can issue warnings"
ON public.user_warnings FOR INSERT
TO authenticated
WITH CHECK (is_admin() AND issued_by = auth.uid());

-- Update flagged content policies
DROP POLICY IF EXISTS "Admins can view all flagged content" ON public.flagged_content;
DROP POLICY IF EXISTS "Users can flag content" ON public.flagged_content;
DROP POLICY IF EXISTS "Admins can manage flagged content" ON public.flagged_content;

CREATE POLICY "Admins can view all flagged content"
ON public.flagged_content FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Users can flag content"
ON public.flagged_content FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage flagged content"
ON public.flagged_content FOR UPDATE
TO authenticated
USING (is_admin());

-- Update content filters policies
DROP POLICY IF EXISTS "Admins can manage content filters" ON public.content_filters;

CREATE POLICY "Admins can manage content filters"
ON public.content_filters FOR ALL
TO authenticated
USING (is_admin());