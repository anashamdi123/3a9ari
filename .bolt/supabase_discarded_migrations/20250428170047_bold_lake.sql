/*
  # Initial Schema Setup

  1. Tables
    - users: Store user profiles
      - id: Primary key, linked to auth.users
      - email: User's email address
      - full_name: User's full name
      - created_at: Account creation timestamp
    
    - properties: Store property listings
      - id: Primary key
      - owner_id: Reference to users table
      - title: Property title
      - description: Detailed description
      - price: Property price
      - location: Property location
      - size: Property size in square meters
      - phone_number: Contact number
      - images: Array of image URLs
      - status: Property status (pending/approved/rejected)
      - created_at: Listing creation timestamp
    
    - favorites: Track user favorite properties
      - id: Primary key
      - user_id: Reference to users table
      - property_id: Reference to properties table
      - created_at: Favorite creation timestamp
    
  2. Security
    - Enable RLS on all tables
    - Set up appropriate policies for each table
    - Add trigger for automatic user profile creation
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.properties;
DROP TABLE IF EXISTS public.users;

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create properties table
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  location text NOT NULL,
  size numeric NOT NULL CHECK (size > 0),
  phone_number text,
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create favorites table
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users policies
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

-- Properties policies
CREATE POLICY "Anyone can view approved properties"
  ON public.properties
  FOR SELECT
  TO public
  USING (status = 'approved' OR auth.uid() = owner_id);

CREATE POLICY "Users can create properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Favorites policies
CREATE POLICY "Users can view their favorites"
  ON public.favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorites"
  ON public.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON public.favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN new;
EXCEPTION WHEN others THEN
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;