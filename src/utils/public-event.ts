import { createClient } from "@/utils/supabase/server";

const PUBLIC_SLUG_PATTERN = /^[0-9a-f]{64}$/;

export type PublicEvent = {
  title: string;
  date: string;
  venue: string;
  description: string | null;
  capacity: number;
};

export type PublicEventLookupResult =
  | { status: "found"; event: PublicEvent }
  | { status: "not-found" }
  | { status: "error"; message: string };

export async function getPublicEventBySlug(
  identifier: string,
): Promise<PublicEventLookupResult> {
  if (!PUBLIC_SLUG_PATTERN.test(identifier)) {
    return { status: "not-found" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_event_by_slug", {
      p_public_slug: identifier,
    });

    if (error) {
      return {
        status: "error",
        message: "Unable to load this event right now.",
      };
    }

    const row = data?.[0];
    if (!row) {
      return { status: "not-found" };
    }

    return {
      status: "found",
      event: {
        title: row.title,
        date: row.event_date,
        venue: row.venue,
        description: row.description,
        capacity: row.capacity,
      },
    };
  } catch {
    return {
      status: "error",
      message: "Unable to load this event right now.",
    };
  }
}
