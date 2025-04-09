/*
  # Add payment and metadata fields to parking tickets

  1. Changes to parking_tickets table
    - Add payment_status field (enum)
    - Add payment_date field
    - Add payment_method field
    - Add notes field for additional details
    - Add search_vector field for full-text search
  
  2. Security
    - Update RLS policies to include new fields
*/

-- Create enum for payment status
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to parking_tickets table
ALTER TABLE parking_tickets 
  ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_date timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(license_plate, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(violation_type, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'D')
  ) STORED;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS parking_tickets_search_idx ON parking_tickets USING gin(search_vector);

-- Update RLS policies
CREATE POLICY "Users can update payment status of own tickets"
  ON parking_tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);