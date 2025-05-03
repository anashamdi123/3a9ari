/*
  # Simple Property Database Schema

  1. New Tables
    - `users`: Basic user information
    - `properties`: Essential property listing details
    - `favorites`: User's favorite properties

  2. Security
    - Enable RLS on all tables
    - Basic security policies for data access
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

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  location text NOT NULL,
  size numeric NOT NULL CHECK (size > 0),
  phone_number text,
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT properties_status_check CHECK (status IN ('pending', 'active', 'rejected'))
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  property_id uuid NOT NULL REFERENCES properties(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users policies
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

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (role = 'admin');

CREATE POLICY "Allow email uniqueness check"
  ON users
  FOR SELECT
  TO public
  USING (email IS NOT NULL);

-- Properties policies
CREATE POLICY "Anyone can view active properties"
  ON properties
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Users can create properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Favorites policies
CREATE POLICY "Users can manage their favorites"
  ON favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger function for new users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    CREATE FUNCTION handle_new_user()
    RETURNS trigger AS $trigger$
    BEGIN
      INSERT INTO public.users (id, email, full_name)
      VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
      RETURN new;
    END;
    $trigger$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END
$$;

-- Create trigger for auth user creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END
$$;