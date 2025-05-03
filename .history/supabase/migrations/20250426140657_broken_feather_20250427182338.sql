/*
  # Simple Schema Setup
  Basic tables for users, properties, and favorites
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.properties;
DROP TABLE IF EXISTS public.users;

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.users(id),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  location text NOT NULL,
  size numeric NOT NULL,
  images text DEFAULT '[]',
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  property_id uuid REFERENCES public.properties(id),
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Public read access"
  ON public.properties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Owner access"
  ON public.properties
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "User favorites access"
  ON public.favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Basic user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Basic permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.properties TO authenticated;
GRANT ALL ON public.favorites TO authenticated;