"use server";

import { revalidatePath } from "next/cache";

import { requireHost } from "@/utils/supabase/require-host";
import { createClient } from "@/utils/supabase/server";

export type EventActionResult = {
  status: "success" | "error";
  message: string;
  eventId?: string;
};

export type HostEvent = {
  id: string;
  public_slug: string;
  title: string;
  event_date: string;
  venue: string;
  capacity: number;
};

export type HostEventSummary = HostEvent & {
  bookedGuests: number;
  spotsLeft: number;
};

export type MyEventsResult =
  | { status: "success"; events: HostEventSummary[] }
  | { status: "error"; message: string };

export type EventForEdit = Pick<
  HostEvent,
  "id" | "title" | "event_date" | "venue" | "capacity"
> & { description: string | null };

export type EventForEditResult =
  | { status: "success"; event: EventForEdit }
  | { status: "not-found" }
  | { status: "error"; message: string };

type EventInput = {
  id?: string;
  title: string;
  eventDate: string;
  venue: string;
  description: string | null;
  capacity: number;
};

type EventInputResult =
  | { valid: true; event: EventInput }
  | { valid: false; result: EventActionResult };

const POSTGRES_INTEGER_MAX = 2_147_483_647;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

function readEventInput(formData: FormData, includeId: boolean): EventInputResult {
  const idValue = formData.get("id");
  const titleValue = formData.get("title");
  const dateValue = formData.get("event_date");
  const venueValue = formData.get("venue");
  const descriptionValue = formData.get("description");
  const capacityValue = formData.get("capacity");

  if (
    includeId &&
    (typeof idValue !== "string" || !UUID_PATTERN.test(idValue))
  ) {
    return {
      valid: false,
      result: { status: "error", message: "This event could not be found." },
    };
  }

  if (typeof titleValue !== "string" || titleValue.trim() === "") {
    return {
      valid: false,
      result: { status: "error", message: "Enter an event title." },
    };
  }

  if (
    typeof dateValue !== "string" ||
    !EVENT_DATE_PATTERN.test(dateValue.trim())
  ) {
    return {
      valid: false,
      result: { status: "error", message: "Enter a valid event date." },
    };
  }

  const normalizedDateValue = dateValue.trim();
  const parsedDate = new Date(normalizedDateValue);
  const [year, month, day] = normalizedDateValue.slice(0, 10).split("-").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(parsedDate.getTime()) ||
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return {
      valid: false,
      result: { status: "error", message: "Enter a valid event date." },
    };
  }

  if (typeof venueValue !== "string" || venueValue.trim() === "") {
    return {
      valid: false,
      result: { status: "error", message: "Enter an event venue." },
    };
  }

  if (descriptionValue !== null && typeof descriptionValue !== "string") {
    return {
      valid: false,
      result: { status: "error", message: "Enter a valid description." },
    };
  }

  if (
    typeof capacityValue !== "string" ||
    !/^\d+$/.test(capacityValue.trim())
  ) {
    return {
      valid: false,
      result: { status: "error", message: "Enter a positive capacity." },
    };
  }

  const capacity = Number(capacityValue);
  if (
    !Number.isSafeInteger(capacity) ||
    capacity < 1 ||
    capacity > POSTGRES_INTEGER_MAX
  ) {
    return {
      valid: false,
      result: { status: "error", message: "Enter a positive capacity." },
    };
  }

  return {
    valid: true,
    event: {
      ...(includeId ? { id: idValue as string } : {}),
      title: titleValue.trim(),
      eventDate: parsedDate.toISOString(),
      venue: venueValue.trim(),
      description:
        typeof descriptionValue === "string" && descriptionValue.trim() !== ""
          ? descriptionValue.trim()
          : null,
      capacity,
    },
  };
}

function revalidateEventPages(eventId?: string) {
  revalidatePath("/events");
  if (eventId) {
    revalidatePath(`/events/${eventId}/edit`);
  }
}

function errorResult(
  message = "Unable to save this event. Try again.",
): EventActionResult {
  return { status: "error", message };
}

export async function getMyEvents(): Promise<MyEventsResult> {
  const user = await requireHost();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("id, public_slug, title, event_date, venue, capacity")
      .eq("owner_id", user.id)
      .order("event_date", { ascending: true });

    if (error || !data) {
      return {
        status: "error",
        message: "Unable to load your events right now. Refresh to try again.",
      };
    }

    if (data.length === 0) {
      return { status: "success", events: [] };
    }

    const eventIds = data.map((event) => event.id);
    const pageSize = 1000;
    let pageFrom = 0;
    const rsvpRows: { event_id: string; party_size: number }[] = [];

    while (true) {
      const { data: page, error: rsvpError } = await supabase
        .from("rsvps")
        .select("id, event_id, party_size")
        .in("event_id", eventIds)
        .order("event_id", { ascending: true })
        .order("id", { ascending: true })
        .range(pageFrom, pageFrom + pageSize - 1);

      if (rsvpError || !page) {
        return {
          status: "error",
          message: "Unable to load your events right now. Refresh to try again.",
        };
      }

      rsvpRows.push(...page);
      if (page.length < pageSize) {
        break;
      }

      pageFrom += page.length;
    }

    const guestTotals = new Map<string, number>();
    for (const rsvp of rsvpRows) {
      guestTotals.set(
        rsvp.event_id,
        (guestTotals.get(rsvp.event_id) ?? 0) + rsvp.party_size,
      );
    }

    return {
      status: "success",
      events: data.map((event) => {
        const bookedGuests = guestTotals.get(event.id) ?? 0;

        return {
          id: event.id,
          public_slug: event.public_slug,
          title: event.title,
          event_date: event.event_date,
          venue: event.venue,
          capacity: event.capacity,
          bookedGuests,
          spotsLeft: Math.max(event.capacity - bookedGuests, 0),
        };
      }),
    };
  } catch {
    return {
      status: "error",
      message: "Unable to load your events right now. Refresh to try again.",
    };
  }
}

export async function getHostEventForEdit(
  eventId: string,
): Promise<EventForEditResult> {
  const user = await requireHost();

  if (typeof eventId !== "string" || !UUID_PATTERN.test(eventId)) {
    return { status: "not-found" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_date, venue, description, capacity")
      .eq("id", eventId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (error) {
      return {
        status: "error",
        message: "Unable to load this event right now. Refresh to try again.",
      };
    }

    if (!data) {
      return { status: "not-found" };
    }

    return {
      status: "success",
      event: {
        id: data.id,
        title: data.title,
        event_date: data.event_date,
        venue: data.venue,
        description: data.description,
        capacity: data.capacity,
      },
    };
  } catch {
    return {
      status: "error",
      message: "Unable to load this event right now. Refresh to try again.",
    };
  }
}

export async function createEvent(
  formData: FormData,
): Promise<EventActionResult> {
  const user = await requireHost();
  const parsed = readEventInput(formData, false);

  if (!parsed.valid) {
    return parsed.result;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .insert({
        owner_id: user.id,
        title: parsed.event.title,
        event_date: parsed.event.eventDate,
        venue: parsed.event.venue,
        description: parsed.event.description,
        capacity: parsed.event.capacity,
      })
      .select("id")
      .single();

    if (error || !data) {
      return errorResult();
    }

    revalidatePath("/events/new");
    revalidateEventPages(data.id);
    return {
      status: "success",
      message: "Event created.",
      eventId: data.id,
    };
  } catch {
    return errorResult("Unable to create this event right now. Try again later.");
  }
}

export async function editEvent(
  formData: FormData,
): Promise<EventActionResult> {
  await requireHost();
  const parsed = readEventInput(formData, true);

  if (!parsed.valid) {
    return parsed.result;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("update_owned_event", {
      p_event_id: parsed.event.id!,
      p_title: parsed.event.title,
      p_event_date: parsed.event.eventDate,
      p_venue: parsed.event.venue,
      p_description: parsed.event.description,
      p_capacity: parsed.event.capacity,
    });

    if (error) {
      return errorResult();
    }

    if (data === "not_found") {
      return errorResult("This event could not be found.");
    }

    if (data === "capacity_too_low") {
      return errorResult("Capacity cannot be lower than the guests already booked.");
    }

    if (data !== "updated") {
      return errorResult();
    }

    revalidateEventPages(parsed.event.id);
    return {
      status: "success",
      message: "Event updated.",
      eventId: parsed.event.id,
    };
  } catch {
    return errorResult("Unable to update this event right now. Try again later.");
  }
}

export async function deleteEvent(
  formData: FormData,
): Promise<EventActionResult> {
  const user = await requireHost();
  const idValue = formData.get("id");

  if (typeof idValue !== "string" || !UUID_PATTERN.test(idValue)) {
    return errorResult("This event could not be found.");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", idValue)
      .eq("owner_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return errorResult("Unable to delete this event. Try again.");
    }

    if (!data) {
      return errorResult("This event could not be found.");
    }

    revalidateEventPages(idValue);
    return { status: "success", message: "Event deleted.", eventId: idValue };
  } catch {
    return errorResult("Unable to delete this event right now. Try again later.");
  }
}
