CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the users table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    -- Create the users table
    CREATE TABLE public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Create updated_at trigger
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION moddatetime();

    -- Set up Row Level Security (RLS)
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own profile"
      ON public.users
      FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
      ON public.users
      FOR UPDATE
      USING (auth.uid() = id);

    -- Grant access to authenticated users
    GRANT SELECT, UPDATE ON public.users TO authenticated;
    GRANT USAGE ON SEQUENCE users_id_seq TO authenticated;
  END IF;
END;
$$; 