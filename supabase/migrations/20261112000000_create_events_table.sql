-- Migration: Create events table
-- Description: Creates the events table with required field constraints, indexes, and Row Level Security (RLS).

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  event_date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL CHECK (char_length(trim(venue)) > 0),
  description TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index owner_id for efficient retrieval of events by host (per data-rules.md)
CREATE INDEX IF NOT EXISTS events_owner_id_idx ON events (owner_id);

-- Enable Row Level Security (per security-rules.md)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view events (guests view public event details without an account)
CREATE POLICY "Public can view events"
  ON events
  FOR SELECT
  USING (true);

-- RLS Policy: Authenticated hosts can insert their own events
CREATE POLICY "Hosts can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Authenticated hosts can update their own events
CREATE POLICY "Hosts can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Authenticated hosts can delete their own events
CREATE POLICY "Hosts can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

