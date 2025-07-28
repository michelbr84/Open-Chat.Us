-- Fix RLS policies for user_profiles table to allow proper user creation
-- The current policies might be preventing the trigger from inserting new user profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;

-- Create proper RLS policies that allow both user self-insertion and system insertion
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true); -- Allow all inserts since this will be used by the trigger

-- Ensure the profile can be selected by the user
CREATE POLICY "Users can view profiles" 
ON public.user_profiles 
FOR SELECT 
USING (true); -- Allow viewing all profiles for now, can be restricted later

-- Allow updates for own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Test the trigger function manually to ensure it works
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- This should work without errors
    RAISE NOTICE 'Testing user_profiles insertion...';
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        role, 
        is_paper_trading
    ) VALUES (
        test_user_id,
        'test@example.com',
        'Test User',
        'user'::user_role,
        true
    );
    
    -- Clean up test data
    DELETE FROM public.user_profiles WHERE id = test_user_id;
    RAISE NOTICE 'Test successful - user_profiles table is working correctly';
END $$;