/*
  # Create users table and authentication schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text) - Can be 'user', 'admin', or 'moderator'
      - `created_at` (timestamp)
      - `last_login` (timestamp)
      - `email_verified` (boolean)
      - `reset_token` (text)
      - `reset_token_expires_at` (timestamp)
      - `verification_token` (text)
      - `verification_token_expires_at` (timestamp)
      - `status` (text) - Can be 'active' or 'suspended'
      - `failed_login_attempts` (integer)
      - `last_failed_login` (timestamp)

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Admins can read all users
      - Users can read their own profile
      - Users can update their own profile
      - Admins can update any user
      - Allow email uniqueness check
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  email_verified boolean DEFAULT false,
  reset_token text,
  reset_token_expires_at timestamptz,
  verification_token text,
  verification_token_expires_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  failed_login_attempts integer DEFAULT 0,
  last_failed_login timestamptz,
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'moderator')),
  CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended'))
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (role = 'admin');

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (role = 'admin');

CREATE POLICY "Allow email uniqueness check"
  ON users
  FOR SELECT
  TO public
  USING (email IS NOT NULL);

-- Create trigger functions for auth events
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_auth_event()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Update last_login on successful sign in
    IF old.last_sign_in_at IS DISTINCT FROM new.last_sign_in_at THEN
      UPDATE public.users
      SET last_login = new.last_sign_in_at
      WHERE id = new.id;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_event();