# Capacity and RSVP acceptance rules

**Job:** Define guest-count calculation and the conditions that accept or refuse an RSVP.
**Source:** PRD data requirements and approved capacity decisions.
**Held elsewhere:** Exact guest-facing messages are in product-rules.md. Field definitions are in data-rules.md.

## Counting

- **Rule:** Capacity is a whole number of at least 1 and counts people, not RSVP records.
  **Why:** One RSVP can include more than one guest.
- **Rule:** The v1 party-size limit is a whole number from 1 through 10. Keep the limit in one shared validation definition and enforce the same range in the server and database. Confirm this decision is in the PRD before implementation.
  **Why:** A single limit prevents the form, server, and database from accepting different values.
- **Rule:** Spots left equal event capacity minus the sum of party_size for all RSVPs on the event. Do not store a separate spots-left value.
  **Why:** A derived value stays correct when an RSVP is added or removed.

## Accept or refuse

- **Rule:** Accept the entire party only when party_size is no greater than the current spots left. Never partially accept a party.
  **Why:** The RSVP represents one group arriving together.
- **Rule:** If spots left are zero, refuse the RSVP as full.
  **Why:** No guests can be added after all spaces are booked.
- **Rule:** If spots left are positive but less than party_size, refuse the entire RSVP as too large and include the number of spots remaining in the response.
  **Why:** The party does not fit, and the remaining capacity helps the guest decide what to do.
- **Rule:** Close new RSVPs at the event’s starts_at time. Keep public event details available after that time.
  **Why:** An event that has started cannot take new RSVPs, but guests may still need its details.
- **Rule:** When multiple refusal states apply at once, use the precedence recorded by the owner in the PRD. Until that decision is recorded, pause only the conflicting message-selection behavior and its test; continue unrelated work.
  **Why:** The supplied product rules do not specify which message takes priority for an ended event that is also full or a duplicate.

## The last spot

- **Rule:** In one database transaction, lock the event row, recalculate spots left, and insert the RSVP only if the entire party fits.
  **Why:** Two simultaneous requests must not both claim the same last space.
- **Rule:** A host capacity update must lock the same event row, recalculate booked guests, and reject a capacity below the booked total in one transaction.
  **Why:** A capacity edit must not race with a guest RSVP and invalidate the capacity check.

## Duplicate contacts

- **Rule:** A contact is a duplicate for the same event when its trimmed, case-insensitive text exactly matches an existing contact for that event. Enforce this in the database with a unique index on event_id and lower(trim(contact)).
  **Why:** Application-only checks can be bypassed by simultaneous requests.
- **Rule:** Do not normalize phone punctuation or guess country codes. A formatted phone number that differs after trimming and case folding is treated as a different contact.
  **Why:** Contacts can use varied formats, and the PRD does not define safe phone-number normalization.

## Guest changes

- **Rule:** Guests cannot edit or cancel an RSVP. The host may remove an RSVP for an event they own.
  **Why:** Guests have no account in v1 to verify ownership of a change.

## Host edits

- **Rule:** Reject a host’s capacity change when the new capacity is below the sum of booked party sizes.
  **Why:** Existing guests must retain their booked places.
