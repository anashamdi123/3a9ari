/*
  # Initial Schema Setup for 3a9ari Real Estate Platform

  1. New Tables
    - `users`
      - Basic user information and authentication
      - Includes role management and account status
    
    - `properties`
      - Property listings with essential details
      - Includes moderation status and owner relationship
    
    - `favorites`
      - User's favorite properties
      - Links users to their saved properties

  2. Security
    - Enable RLS on all tables
    - Set up appropriate access policies
    - Ensure data privacy and security
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin')),
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
  property_type text NOT NULL,
  listing_type text NOT NULL,
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL CHECK (bathrooms >= 0),
  living_rooms integer CHECK (living_rooms IS NULL OR living_rooms >= 0),
  floors integer CHECK (floors IS NULL OR floors >= 0),
  phone_number text CHECK (phone_number ~ '^\+216[0-9]{8}$' OR phone_number = '+216'),
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  size numeric NOT NULL CHECK (size > 0),
  CONSTRAINT properties_listing_type_check CHECK (listing_type IN ('rent', 'buy')),
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

-- Create trigger function for new users if it doesn't exist
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

-- Create trigger for auth user creation if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END
$$;