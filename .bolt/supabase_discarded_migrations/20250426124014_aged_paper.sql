/*
  # Add status column to properties table

  1. Changes
    - Add `status` column to `properties` table with type TEXT
    - Set default value to 'pending'
    - Add check constraint to ensure valid status values
    - Update existing rows to have 'approved' status for backward compatibility
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add status column with check constraint
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing properties to 'approved' status for backward compatibility
UPDATE properties SET status = 'approved' WHERE status = 'pending';