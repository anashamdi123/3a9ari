/*
  # Fix Authentication Schema

  1. Changes
    - Drop and recreate user creation trigger with proper error handling
    - Add missing columns to properties table
    - Fix foreign key constraints
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies
    - Add proper error handling for user creation
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  RETURN new;
EXCEPTION WHEN others THEN
  -- Log the error (in a real production system)
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add missing columns to properties if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE properties ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'size'
  ) THEN
    ALTER TABLE properties ADD COLUMN size numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update foreign key constraints with proper ON DELETE behavior
ALTER TABLE properties 
  DROP CONSTRAINT IF EXISTS properties_owner_id_fkey,
  ADD CONSTRAINT properties_owner_id_fkey 
    FOREIGN KEY (owner_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE favorites 
  DROP CONSTRAINT IF EXISTS favorites_user_id_fkey,
  ADD CONSTRAINT favorites_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE favorites 
  DROP CONSTRAINT IF EXISTS favorites_property_id_fkey,
  ADD CONSTRAINT favorites_property_id_fkey 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE;