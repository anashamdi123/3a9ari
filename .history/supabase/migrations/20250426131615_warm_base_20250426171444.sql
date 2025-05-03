/*
  # Fix User Registration Schema

  1. Changes
    - Drop existing policies if they exist
    - Ensure proper table constraints and relationships
    - Re-create policies with proper checks
    - Set up proper permissions

  2. Security
    - Enable RLS
    - Add policies for user management
    - Set up proper authentication checks
*/

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
END $$;

-- Ensure table exists with proper constraints
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT users_email_key UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Re-create policies
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;