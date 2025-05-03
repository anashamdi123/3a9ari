-- Migrate existing users to profiles if they exist
DO $$
BEGIN
    -- Check if the old users table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        -- Migrate data from users to profiles
        INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
        SELECT 
            id,
            email,
            full_name,
            created_at,
            COALESCE(updated_at, NOW()) as updated_at
        FROM public.users
        ON CONFLICT (id) DO NOTHING;

        -- Drop the old users table
        DROP TABLE IF EXISTS public.users;
    END IF;
END $$; 