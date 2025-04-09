/*
  # Add user roles and authentication setup

  1. Changes
    - Add admin flag to auth.users
    - Add RLS policies for admin access
    - Update existing policies for user roles
*/

-- Add admin column to auth.users if not exists
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update RLS policies to handle admin access
CREATE POLICY "Admins can read all tickets"
  ON parking_tickets
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'is_admin' = 'true'
    OR auth.uid() = user_id
  );

CREATE POLICY "Admins can update all tickets"
  ON parking_tickets
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'is_admin' = 'true'
    OR auth.uid() = user_id
  )
  WITH CHECK (
    auth.jwt() ->> 'is_admin' = 'true'
    OR auth.uid() = user_id
  );