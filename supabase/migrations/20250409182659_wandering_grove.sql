/*
  # Create parking tickets schema

  1. New Tables
    - `parking_tickets`
      - `id` (uuid, primary key)
      - `license_plate` (text, required)
      - `violation_type` (text, required)
      - `location` (text, required)
      - `amount` (decimal, required)
      - `issued_at` (timestamp with time zone, defaults to now)
      - `paid` (boolean, defaults to false)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `parking_tickets` table
    - Add policies for authenticated users to:
      - Read their own tickets
      - Create new tickets
      - Update their own tickets
*/

CREATE TABLE IF NOT EXISTS parking_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate text NOT NULL,
  violation_type text NOT NULL,
  location text NOT NULL,
  amount decimal NOT NULL,
  issued_at timestamptz DEFAULT now(),
  paid boolean DEFAULT false,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parking_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets"
  ON parking_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON parking_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON parking_tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);