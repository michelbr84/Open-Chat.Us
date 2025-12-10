-- 1. Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Update is_admin function to use new user_roles table
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_uuid, 'admin')
$$;

-- 6. RLS policies for user_roles table (only admins can manage)
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 7. Migrate existing admins from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Drop and recreate admin table policies with proper checks

-- content_filters
DROP POLICY IF EXISTS "Admins can manage content filters" ON public.content_filters;
CREATE POLICY "Admins can manage content filters"
ON public.content_filters
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- flagged_content
DROP POLICY IF EXISTS "Admins can manage flagged content" ON public.flagged_content;
CREATE POLICY "Admins can manage flagged content"
ON public.flagged_content
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- moderation_actions
DROP POLICY IF EXISTS "Admins can manage moderation actions" ON public.moderation_actions;
CREATE POLICY "Admins can manage moderation actions"
ON public.moderation_actions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- message_reports (admin view/manage)
DROP POLICY IF EXISTS "Admins can manage reports" ON public.message_reports;
CREATE POLICY "Admins can manage reports"
ON public.message_reports
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- user_moderation_status
DROP POLICY IF EXISTS "Admins can manage user moderation status" ON public.user_moderation_status;
CREATE POLICY "Admins can manage user moderation status"
ON public.user_moderation_status
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- leaderboard (admin update)
DROP POLICY IF EXISTS "System can update leaderboard" ON public.leaderboard;
CREATE POLICY "Admins can update leaderboard"
ON public.leaderboard
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. Update profiles update policy to prevent role modification
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND role = 'user');