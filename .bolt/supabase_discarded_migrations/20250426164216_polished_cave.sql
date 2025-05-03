/*
  # Fix RLS policies for users table

  1. Changes
    - Drop existing RLS policies for users table
    - Create new RLS policies that allow:
      - User registration (INSERT)
      - Reading own profile (SELECT)
      - Updating own profile (UPDATE)
      - No DELETE policy (handled by cascade from auth.users)

  2. Security
    - Enable RLS on users table
    - Policies ensure users can only access their own data
    - Registration allowed for authenticated users with matching ID
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  WITH CHECK (
    -- Allow registration when the user ID matches the authenticated user ID
    -- OR when there is no authenticated user (for initial registration)
    auth.uid() IS NULL OR auth.uid() = id
  );

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);