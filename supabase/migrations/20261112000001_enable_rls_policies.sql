-- Migration: Enable RLS and configure policies on events and rsvps
-- Description:
--   1. Ensures rsvps table exists with necessary constraints and indexes.
--   2. Enables Row Level Security (RLS) on both events and rsvps tables.
--   3. Restricts public (anon) reading to only the event columns needed by an invite page.
--   4. Restricts authenticated hosts to reading and modifying only events they own.
--   5. Restricts hosts to reading and updating RSVPs only for events they own.
--   6. Prevents direct public inserts into rsvps (submission handled via server-side validation).

-- -----------------------------------------------------------------------------
-- 1. Ensure RSVPs Table Exists
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL CHECK (char_length(trim(guest_name)) > 0),
  contact TEXT NOT NULL CHECK (char_length(trim(contact)) > 0),
  party_size INTEGER NOT NULL CHECK (party_size >= 1 AND party_size <= 10),
  checked_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index event_id for fast lookup of an event's guest list (per data-rules.md)
CREATE INDEX IF NOT EXISTS rsvps_event_id_idx ON rsvps (event_id);

-- Enforce duplicate contact constraint per event (per capacity-rules.md)
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_event_contact_unique_idx ON rsvps (event_id, lower(trim(contact)));

-- -----------------------------------------------------------------------------
-- 2. Enable Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. Clean Up Any Existing Policies to Ensure Narrow Scope
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view events" ON events;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Hosts can create events" ON events;
DROP POLICY IF EXISTS "Hosts can update own events" ON events;
DROP POLICY IF EXISTS "Hosts can delete own events" ON events;
DROP POLICY IF EXISTS "Public can view event invite details" ON events;
DROP POLICY IF EXISTS "Hosts can view own events" ON events;
DROP POLICY IF EXISTS "Hosts can insert own events" ON events;

DROP POLICY IF EXISTS "Hosts can view RSVPs for own events" ON rsvps;
DROP POLICY IF EXISTS "Hosts can update RSVPs for own events" ON rsvps;
DROP POLICY IF EXISTS "Hosts can delete RSVPs for own events" ON rsvps;

-- -----------------------------------------------------------------------------
-- 4. Policies on Events Table
-- -----------------------------------------------------------------------------

-- Restrict public (anon) column privileges to only details needed by invite page (excludes owner_id)
REVOKE ALL ON events FROM anon;
GRANT SELECT (id, title, event_date, venue, description, capacity, created_at) ON events TO anon;

-- Public (anon) can read event invite details
CREATE POLICY "Public can view event invite details"
  ON events
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated hosts can read ONLY events they own
CREATE POLICY "Hosts can view own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- Authenticated hosts can insert ONLY events they own
CREATE POLICY "Hosts can insert own events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Authenticated hosts can update ONLY events they own
CREATE POLICY "Hosts can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Authenticated hosts can delete ONLY events they own
CREATE POLICY "Hosts can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Grant appropriate table privileges to authenticated users (RLS enforces row ownership)
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. Policies on RSVPs Table
-- -----------------------------------------------------------------------------

-- Authenticated hosts can read RSVPs ONLY for events they own
CREATE POLICY "Hosts can view RSVPs for own events"
  ON rsvps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
        AND events.owner_id = auth.uid()
    )
  );

-- Authenticated hosts can update RSVPs ONLY for events they own (e.g. check-in)
CREATE POLICY "Hosts can update RSVPs for own events"
  ON rsvps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
        AND events.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
        AND events.owner_id = auth.uid()
    )
  );

-- Authenticated hosts can delete RSVPs ONLY for events they own (e.g. remove RSVP)
CREATE POLICY "Hosts can delete RSVPs for own events"
  ON rsvps
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = rsvps.event_id
        AND events.owner_id = auth.uid()
    )
  );

-- Revoke direct public/anon access on rsvps (no public direct reads or inserts)
REVOKE ALL ON rsvps FROM anon;

-- Authenticated hosts receive SELECT, UPDATE, DELETE permissions governed by RLS
REVOKE INSERT ON rsvps FROM authenticated;
GRANT SELECT, UPDATE, DELETE ON rsvps TO authenticated;

