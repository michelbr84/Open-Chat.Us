-- Create the missing user_role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Create or update the profiles table structure if needed
DO $$ 
BEGIN
    -- Check if profiles table exists and has proper structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID NOT NULL PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            role user_role NOT NULL DEFAULT 'user',
            is_paper_trading BOOLEAN DEFAULT true,
            reputation_score INTEGER DEFAULT 100,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Ensure the role column exists and has the right type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Create or replace the handle_new_user function to work with the profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_paper_trading)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'user'::user_role,
    true  -- Default to paper trading for safety
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate insertions
  RETURN NEW;
END;
$function$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();