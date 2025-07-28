-- Check if the profiles table exists and fix the handle_new_user function
DO $$ 
BEGIN
    -- Check if user_profiles table exists (since it's referenced in the functions)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Update the existing function to handle potential conflicts
        DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
        
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = ''
        AS $function$
        BEGIN
          INSERT INTO public.user_profiles (id, email, full_name, role, is_paper_trading)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
            'user'::user_role,
            true  -- Default to paper trading for safety
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
            updated_at = now();
          RETURN NEW;
        END;
        $function$;
        
        -- Recreate the trigger
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;