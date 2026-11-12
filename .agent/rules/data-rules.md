# Data model rules

**Job:** Define database fields, their meaning, and how derived values are calculated.
**Source:** PRD data requirements.
**Held elsewhere:** Capacity limits are in capacity-rules.md. Access control is in security-rules.md. Provider and language conventions are in AGENTS.md.

Database columns use snake_case. Application properties may use camelCase when mapped from database rows.

## Identity

Authentication records belong to the selected authentication provider; do not create an app-owned password table.

| Field | Type and rule | Purpose |
| --- | --- | --- |
| provider_user_id | UUID or provider-defined unique identifier | Links an event to its owner without storing another password or credential record |

## Event

| Field | Type and rule | Purpose |
| --- | --- | --- |
| id | UUID primary key | Identifies the event internally |
| owner_id | Required foreign key to the selected auth provider’s user ID | Establishes the host who owns the event |
| title | Required text | Names the event |
| starts_at | Required timestamp stored as an absolute time | Determines when the event begins |
| time_zone | Required IANA time-zone name | Displays the event time in the host-selected zone |
| venue | Required text | Tells guests where the event is held |
| description | Optional text | Provides additional event details |
| capacity | Positive whole number; accepted range is defined in capacity-rules.md | Limits total booked people |
| public_slug | Unique, non-sequential URL-safe text with at least 128 bits of cryptographically secure randomness | Provides a hard-to-guess public invite link |
| created_at | Timestamp | Records when the event was created |

## RSVP

| Field | Type and rule | Purpose |
| --- | --- | --- |
| id | UUID primary key | Identifies the RSVP internally |
| event_id | Required foreign key to Event; deleting the event deletes its RSVPs | Associates guest details with one event and removes them with that event |
| guest_name | Required text | Identifies the guest to the host |
| contact | Required text; accepts the guest’s format and is not verified in v1 | Gives the host a way to contact the guest by hand |
| party_size | Positive whole number including the person submitting; maximum is defined in capacity-rules.md | Records how many people the RSVP reserves |
| checked_in | Boolean, default false | Tracks whether the host has checked in the RSVP’s entire party |
| created_at | Timestamp | Records when the RSVP was submitted |

## Data behavior

- **Rule:** Store starts_at as an absolute timestamp and store the host-selected IANA time-zone name. Display the event in that time zone.
  **Why:** The same event time must display consistently for host and guests.
- **Rule:** Generate public_slug with a cryptographically secure random source, enforce uniqueness, and never use sequential IDs as public links.
  **Why:** Predictable links make it easier to discover other events.
- **Rule:** Enforce duplicate contact matching per event using the trimmed, case-insensitive contact text defined in capacity-rules.md.
  **Why:** The database must enforce the same duplicate rule as the RSVP flow.
- **Rule:** Index owner_id on Event and event_id on RSVP.
  **Why:** Hosts commonly list their events and open one event’s guest list.
- **Rule:** Calculate guest-list totals from RSVP rows: RSVP count is the number of rows; booked people are the sum of party_size; checked-in people are the sum of party_size where checked_in is true; spots left are capacity minus booked people.
  **Why:** Separating RSVP records from people prevents totals from being confused.
- **Rule:** Do not store spots left as a separate field.
  **Why:** A stored copy could become stale after an RSVP is added, removed, or checked in.
- **Rule:** checked_in starts false for each new RSVP and applies to the whole party.
  **Why:** No party has arrived when it first RSVPs, and v1 does not support partial party check-in.
