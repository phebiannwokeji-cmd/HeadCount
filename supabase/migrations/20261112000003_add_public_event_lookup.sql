-- Add non-sequential public invite identifiers with at least 128 bits of
-- randomness. Two UUID v4 values provide 244 random bits in a URL-safe hex slug.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS public_slug text;

UPDATE public.events
   SET public_slug = lower(
     replace(gen_random_uuid()::text, '-', '') ||
     replace(gen_random_uuid()::text, '-', '')
   )
 WHERE public_slug IS NULL;

ALTER TABLE public.events
  ALTER COLUMN public_slug SET DEFAULT lower(
    replace(gen_random_uuid()::text, '-', '') ||
    replace(gen_random_uuid()::text, '-', '')
  ),
  ALTER COLUMN public_slug SET NOT NULL;

ALTER TABLE public.events
  ADD CONSTRAINT events_public_slug_format_check
  CHECK (public_slug ~ '^[0-9a-f]{64}$');

CREATE UNIQUE INDEX IF NOT EXISTS events_public_slug_unique_idx
  ON public.events (public_slug);

-- Expose only the public invite fields. The slug is not granted for direct
-- anonymous table reads, which prevents listing invite identifiers.
CREATE OR REPLACE FUNCTION public.get_public_event_by_slug(p_public_slug text)
RETURNS TABLE (
  title text,
  event_date timestamptz,
  venue text,
  description text,
  capacity integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT events.title,
         events.event_date,
         events.venue,
         events.description,
         events.capacity
    FROM public.events AS events
   WHERE p_public_slug ~ '^[0-9a-f]{64}$'
     AND events.public_slug = p_public_slug;
$$;

REVOKE ALL ON FUNCTION public.get_public_event_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_event_by_slug(text)
  TO anon, authenticated;
