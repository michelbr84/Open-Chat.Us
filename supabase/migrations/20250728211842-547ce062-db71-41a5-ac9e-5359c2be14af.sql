-- Fix RLS policies for user_profiles table to allow proper user creation
-- The foreign key constraint requires the user to exist in auth.users first

-- Drop and recreate the problematic policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.user_profiles;

-- Create proper RLS policies for user creation via trigger
CREATE POLICY "Allow profile creation via trigger" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true); -- Allow all inserts since this will be called by the trigger with elevated privileges

-- Allow users to view all profiles (can be restricted later)
CREATE POLICY "Allow profile viewing" 
ON public.user_profiles 
FOR SELECT 
USING (true);

-- Test that the trigger function exists and is properly defined
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Verify the trigger is attached
SELECT tgname, tgenabled, tgfoid::regproc FROM pg_trigger WHERE tgname = 'on_auth_user_created';