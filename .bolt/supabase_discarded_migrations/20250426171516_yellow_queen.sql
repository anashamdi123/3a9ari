/*
  # Update user registration flow to disable email verification

  1. Changes
    - Update RLS policies to allow registration without email verification
    - Modify trigger function to handle unverified emails
    - Add policy for public registration
    
  2. Security
    - Maintain existing RLS policies
    - Update user creation flow
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Update or create policies with proper checks
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow registration for new users
    auth.uid() IS NULL OR auth.uid() = id
  );

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO public
  USING (
    -- Allow users to read their own profile
    auth.uid() = id
  );

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update trigger function to handle unverified emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
EXCEPTION 
  WHEN unique_violation THEN
    -- Handle duplicate email gracefully
    RAISE WARNING 'User with email % already exists', NEW.email;
    RETURN NEW;
  WHEN others THEN
    -- Log other errors but don't block auth user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();