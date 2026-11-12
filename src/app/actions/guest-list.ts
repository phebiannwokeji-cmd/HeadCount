"use server";

import { requireHost } from "@/utils/supabase/require-host";
import { createClient } from "@/utils/supabase/server";

export type GuestListRsvp = {
  id: string;
  guest_name: string;
  contact: string;
  party_size: number;
  checked_in: boolean;
};

export type GuestListTotals = {
  rsvpCount: number;
  totalGuests: number;
  checkedInGuests: number;
  spotsLeft: number;
};

export type GuestListResult =
  | {
      status: "success";
      rsvps: GuestListRsvp[];
      totals: GuestListTotals;
    }
  | { status: "not-found" }
  | { status: "error"; message: string };

export type CheckInUpdateResult =
  | {
      status: "success";
      rsvp: Pick<GuestListRsvp, "id" | "guest_name" | "party_size" | "checked_in">;
    }
  | { status: "not-found" }
  | { status: "error"; message: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function loadError(): GuestListResult {
  return {
    status: "error",
    message: "Unable to load this guest list right now.",
  };
}

export async function getEventGuestList(
  eventId: string,
): Promise<GuestListResult> {
  const user = await requireHost();

  if (typeof eventId !== "string" || !UUID_PATTERN.test(eventId)) {
    return { status: "not-found" };
  }

  try {
    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, capacity")
      .eq("id", eventId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (eventError) {
      return loadError();
    }

    if (!event) {
      return { status: "not-found" };
    }

    const { data, error } = await supabase
      .from("rsvps")
      .select("id, guest_name, contact, party_size, checked_in")
      .eq("event_id", eventId);

    if (error || !data) {
      return loadError();
    }

    const rsvps: GuestListRsvp[] = data.map((row) => ({
      id: row.id,
      guest_name: row.guest_name,
      contact: row.contact,
      party_size: row.party_size,
      checked_in: row.checked_in,
    }));

    const totalGuests = rsvps.reduce((total, rsvp) => total + rsvp.party_size, 0);
    const checkedInGuests = rsvps.reduce(
      (total, rsvp) => total + (rsvp.checked_in ? rsvp.party_size : 0),
      0,
    );

    return {
      status: "success",
      rsvps,
      totals: {
        rsvpCount: rsvps.length,
        totalGuests,
        checkedInGuests,
        spotsLeft: event.capacity - totalGuests,
      },
    };
  } catch {
    return loadError();
  }
}

export async function setRsvpCheckedIn(
  eventId: string,
  rsvpId: string,
  checkedIn: boolean,
): Promise<CheckInUpdateResult> {
  const user = await requireHost();

  if (
    typeof eventId !== "string" ||
    !UUID_PATTERN.test(eventId) ||
    typeof rsvpId !== "string" ||
    !UUID_PATTERN.test(rsvpId) ||
    typeof checkedIn !== "boolean"
  ) {
    return { status: "not-found" };
  }

  try {
    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (eventError) {
      return {
        status: "error",
        message: "Unable to update this RSVP right now.",
      };
    }

    if (!event) {
      return { status: "not-found" };
    }

    const { data: rsvp, error } = await supabase
      .from("rsvps")
      .update({ checked_in: checkedIn })
      .eq("id", rsvpId)
      .eq("event_id", eventId)
      .select("id, guest_name, party_size, checked_in")
      .maybeSingle();

    if (error) {
      return {
        status: "error",
        message: "Unable to update this RSVP right now.",
      };
    }

    if (!rsvp) {
      return { status: "not-found" };
    }

    return {
      status: "success",
      rsvp: {
        id: rsvp.id,
        guest_name: rsvp.guest_name,
        party_size: rsvp.party_size,
        checked_in: rsvp.checked_in,
      },
    };
  } catch {
    return {
      status: "error",
      message: "Unable to update this RSVP right now.",
    };
  }
}
