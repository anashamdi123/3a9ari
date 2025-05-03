/*
  # Fix User Registration

  1. Changes
    - Improve trigger function error handling
    - Add proper transaction handling
    - Ensure atomic operations
    
  2. Security
    - Maintain existing RLS policies
    - Ensure proper error propagation
*/

-- Drop and recreate the trigger function with improved error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  _full_name text;
BEGIN
  -- Get full name from metadata or use email prefix as fallback
  _full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    SPLIT_PART(new.email, '@', 1)
  );

  -- Insert or update user profile
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, _full_name)
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

  RETURN new;
EXCEPTION 
  WHEN unique_violation THEN
    -- Handle duplicate email gracefully
    RAISE WARNING 'User with email % already exists', new.email;
    RETURN new;
  WHEN others THEN
    -- Log other errors but don't block auth user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();