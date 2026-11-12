-- Public RSVP submission. Each submission locks its event row before it
-- counts bookings, serializing concurrent RSVPs with one another and with
-- host capacity updates that lock the same row.
CREATE OR REPLACE FUNCTION public.submit_public_rsvp(
  p_public_slug text,
  p_guest_name text,
  p_contact text,
  p_party_size integer
)
RETURNS TABLE (
  status text,
  spots_remaining integer
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_id uuid;
  v_capacity integer;
  v_event_date timestamptz;
  v_booked_guests bigint;
  v_spots_remaining integer;
  v_event_ended boolean;
  v_duplicate_contact boolean;
  v_capacity_status text;
  v_reason_count integer;
  v_status text;
BEGIN
  IF p_public_slug IS NULL OR p_public_slug !~ '^[0-9a-f]{64}$' THEN
    RETURN QUERY SELECT 'not_found'::text, NULL::integer;
    RETURN;
  END IF;

  IF p_guest_name IS NULL
    OR char_length(btrim(p_guest_name)) = 0
    OR p_contact IS NULL
    OR char_length(btrim(p_contact)) = 0
    OR p_party_size IS NULL
    OR p_party_size < 1
    OR p_party_size > 10
  THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::integer;
    RETURN;
  END IF;

  SELECT events.id, events.capacity, events.event_date
    INTO v_event_id, v_capacity, v_event_date
    FROM public.events AS events
   WHERE events.public_slug = p_public_slug
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'not_found'::text, NULL::integer;
    RETURN;
  END IF;

  SELECT coalesce(sum(rsvps.party_size), 0)
    INTO v_booked_guests
    FROM public.rsvps AS rsvps
   WHERE rsvps.event_id = v_event_id;

  v_spots_remaining := greatest(
    v_capacity::bigint - v_booked_guests,
    0
  )::integer;
  v_event_ended := v_event_date <= now();

  SELECT EXISTS (
    SELECT 1
      FROM public.rsvps AS rsvps
     WHERE rsvps.event_id = v_event_id
       AND lower(btrim(rsvps.contact)) = lower(btrim(p_contact))
  )
    INTO v_duplicate_contact;

  v_capacity_status := CASE
    WHEN v_spots_remaining = 0 THEN 'full'
    WHEN p_party_size > v_spots_remaining THEN 'too_large'
    ELSE NULL
  END;

  v_reason_count :=
    CASE WHEN v_event_ended THEN 1 ELSE 0 END
    + CASE WHEN v_duplicate_contact THEN 1 ELSE 0 END
    + CASE WHEN v_capacity_status IS NOT NULL THEN 1 ELSE 0 END;

  IF v_reason_count > 1 THEN
    v_status := 'multiple_reasons';
  ELSIF v_event_ended THEN
    v_status := 'event_ended';
  ELSIF v_duplicate_contact THEN
    v_status := 'duplicate';
  ELSE
    v_status := v_capacity_status;
  END IF;

  IF v_status IS NOT NULL THEN
    RETURN QUERY SELECT v_status, v_spots_remaining;
    RETURN;
  END IF;

  BEGIN
    INSERT INTO public.rsvps (
      event_id,
      guest_name,
      contact,
      party_size
    )
    VALUES (
      v_event_id,
      btrim(p_guest_name),
      btrim(p_contact),
      p_party_size
    );
  EXCEPTION
    WHEN unique_violation THEN
      RETURN QUERY SELECT 'duplicate'::text, v_spots_remaining;
      RETURN;
  END;

  RETURN QUERY SELECT
    'saved'::text,
    v_spots_remaining - p_party_size;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_rsvp(text, text, text, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_public_rsvp(text, text, text, integer)
  TO anon, authenticated;
