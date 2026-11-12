import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

const PUBLIC_SLUG_PATTERN = /^[0-9a-f]{64}$/;
const MAX_PARTY_SIZE = 10;

type RequestPayload = Record<string, unknown>;

function isRequestPayload(value: unknown): value is RequestPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(
  status: number,
  body: { status: string; message: string; spotsRemaining?: number },
) {
  return NextResponse.json(body, { status });
}

function invalidInput() {
  return jsonResponse(400, {
    status: "invalid_input",
    message: "Enter your name, contact, and a party size from 1 to 10.",
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return invalidInput();
  }

  if (!isRequestPayload(payload)) {
    return invalidInput();
  }

  const publicSlug =
    typeof payload.publicSlug === "string"
      ? payload.publicSlug.trim().toLowerCase()
      : "";
  const guestName =
    typeof payload.guestName === "string" ? payload.guestName.trim() : "";
  const contact =
    typeof payload.contact === "string" ? payload.contact.trim() : "";
  const partySize = payload.partySize;

  if (!publicSlug || !guestName || !contact) {
    return invalidInput();
  }

  if (!PUBLIC_SLUG_PATTERN.test(publicSlug)) {
    return jsonResponse(404, {
      status: "not_found",
      message: "This link was not found.",
    });
  }

  if (
    typeof partySize !== "number" ||
    !Number.isSafeInteger(partySize) ||
    partySize < 1 ||
    partySize > MAX_PARTY_SIZE
  ) {
    return invalidInput();
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_public_rsvp", {
      p_public_slug: publicSlug,
      p_guest_name: guestName,
      p_contact: contact,
      p_party_size: partySize,
    });

    if (error || !data || data.length !== 1) {
      return jsonResponse(503, {
        status: "error",
        message: "Your RSVP was not saved. Try again.",
      });
    }

    const result = data[0];
    switch (result.status) {
      case "saved":
        return jsonResponse(201, {
          status: "success",
          message: "Your RSVP was saved.",
        });

      case "full":
        return jsonResponse(409, {
          status: "event_full",
          message: "The event is full.",
          spotsRemaining: 0,
        });

      case "too_large": {
        const spotsRemaining = result.spots_remaining;
        if (
          typeof spotsRemaining !== "number" ||
          !Number.isSafeInteger(spotsRemaining) ||
          spotsRemaining < 1
        ) {
          break;
        }

        const spotsMessage =
          spotsRemaining === 1
            ? "There is 1 spot remaining."
            : `There are ${spotsRemaining} spots remaining.`;

        return jsonResponse(409, {
          status: "party_too_large",
          message: `Your party is larger than the spots left. ${spotsMessage}`,
          spotsRemaining,
        });
      }

      case "invalid":
        return invalidInput();

      case "not_found":
        return jsonResponse(404, {
          status: "not_found",
          message: "This link was not found.",
        });

      case "event_ended":
        return jsonResponse(410, {
          status: "event_ended",
          message: "This event has ended.",
        });

      case "duplicate":
        return jsonResponse(409, {
          status: "duplicate",
          message:
            "You have already RSVPed with this contact. Ask the host to change it.",
        });

      case "multiple_reasons":
        return jsonResponse(409, {
          status: "conflict",
          message: "We could not accept this RSVP. Check the details and try again.",
        });
    }

    return jsonResponse(503, {
      status: "error",
      message: "Your RSVP was not saved. Try again.",
    });
  } catch {
    return jsonResponse(503, {
      status: "error",
      message: "Your RSVP was not saved. Try again.",
    });
  }
}
