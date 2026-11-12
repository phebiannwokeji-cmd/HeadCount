-- Update event details atomically while preserving booked guest capacity.
-- RSVP transactions must lock the same events row before changing bookings.
CREATE OR REPLACE FUNCTION public.update_owned_event(
  p_event_id uuid,
  p_title text,
  p_event_date timestamptz,
  p_venue text,
  p_description text,
  p_capacity integer
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_event_id uuid;
  v_booked_guests bigint;
BEGIN
  IF auth.uid() IS NULL
    OR p_event_id IS NULL
    OR p_title IS NULL
    OR char_length(btrim(p_title)) = 0
    OR p_event_date IS NULL
    OR p_venue IS NULL
    OR char_length(btrim(p_venue)) = 0
    OR p_capacity IS NULL
    OR p_capacity < 1
  THEN
    RETURN 'invalid';
  END IF;

  SELECT events.id
    INTO v_event_id
    FROM public.events AS events
   WHERE events.id = p_event_id
     AND events.owner_id = auth.uid()
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  SELECT coalesce(sum(rsvps.party_size), 0)
    INTO v_booked_guests
    FROM public.rsvps AS rsvps
   WHERE rsvps.event_id = p_event_id;

  IF p_capacity < v_booked_guests THEN
    RETURN 'capacity_too_low';
  END IF;

  UPDATE public.events
     SET title = btrim(p_title),
         event_date = p_event_date,
         venue = btrim(p_venue),
         description = nullif(btrim(p_description), ''),
         capacity = p_capacity
   WHERE id = p_event_id
     AND owner_id = auth.uid();

  RETURN 'updated';
END;
$$;

REVOKE ALL ON FUNCTION public.update_owned_event(uuid, text, timestamptz, text, text, integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_owned_event(uuid, text, timestamptz, text, text, integer)
  TO authenticated;
