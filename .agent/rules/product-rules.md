# Product behavior rules

**Job:** Define what hosts and guests see and do, including exact user-facing messages.
**Source:** PRD core action, user flows, and screens.
**Held elsewhere:** Capacity decision logic is in capacity-rules.md. Access-control implementation is in security-rules.md.

## Core action

- **Rule:** The median time for first-time guests with valid RSVPs must be under 30 seconds, measured from page load to confirmation.
  **Why:** This is the core action that demonstrates the product works without letting one slow attempt distort the result.
- **Rule:** Report rejected attempts separately from successful RSVPs. A rejected attempt is a failed attempt, not a successful RSVP.
  **Why:** A rejected request still needs a clear recovery path but must not be counted as a completed RSVP.
- **Rule:** Use the repeatable measurement conditions in test-rules.md and include any wait after database idle in the measured duration.
  **Why:** The timing result should reflect what guests actually experience.

## Guest flow

1. Open the invite link and read the event details.
2. Enter name, contact, and number of guests, then submit the RSVP.
3. See confirmation after the RSVP is saved, or the exact message for the refusal reason.

| Case | Exact message | Condition source |
| --- | --- | --- |
| Event full | The event is full. | capacity-rules.md |
| Party too large | Your party is larger than the spots left. | capacity-rules.md |
| Duplicate | You have already RSVPed with this contact. Ask the host to change it. | capacity-rules.md |
| Event ended | This event has ended. | capacity-rules.md |
| Link not found | This link was not found. | This file |
| Not saved | Your RSVP was not saved. Try again. | This file |

- **Rule:** For a too-large party, state the remaining spots. Use “There is 1 spot remaining” for one spot and “There are N spots remaining” for more than one. Select the message based on capacity-rules.md; if two conditions conflict, use the owner-recorded precedence decision.
  **Why:** Guests need the correct next step and should not see contradictory or grammatically incorrect responses.
- **Rule:** Before submission, show this notice: “Your name and contact details will be shared with this event’s host.”
  **Why:** Guests should know who receives their details before they submit.
- **Rule:** Do not show guest names or contact details on the public event page.
  **Why:** Guests should not see other guests’ personal information.

## Host flow

1. Sign up with an email and password, then log in.
2. Create an event with a title, date and time, venue, capacity, and optional description.
3. Copy the public invite link and share it with guests.
4. Edit event details if they change.
5. Remove an RSVP that is wrong or duplicated.
6. On the event day, open the guest list and check guests in.
7. Delete an event if needed.
8. Log out.

- **Rule:** Check-in is per RSVP; one check-in covers the entire party.
  **Why:** v1 does not track members of a party individually.
- **Rule:** Ask the host to confirm before deleting an event.
  **Why:** Deleting an event also deletes its RSVP records.
- **Rule:** The host uses contact details to reach guests by hand; v1 sends no messages.
  **Why:** Automated messaging is outside the v1 flow.
- **Rule:** Password reset is not included in v1 unless the PRD changes. Tell the owner that a host who loses account access may be unable to recover their events.
  **Why:** The current v1 scope excludes account recovery, so this limitation must be explicit.

## Screens

| Screen | Purpose | Key things on it |
| --- | --- | --- |
| Sign up and log in | Create an account or enter the app | Email, password, switch between sign-up and login, clear errors |
| My events | See owned events and create a new one | Event list, create event button, guest-list links, empty state |
| Create or edit event | Set up or change the event | Title, date and time, venue, capacity, description, delete option |
| Guest list | See RSVPs and check guests in | Guest names, party sizes, check-in control, name filter, remove RSVP option, totals |
| Public event page | Let guests view the event and RSVP without login | Event details, RSVP form, privacy notice, confirmation or error message |

- **Rule:** Put the log-out option on a signed-in host screen, not the sign-up and login screen.
  **Why:** Signed-out visitors have no session to end.
- **Rule:** Show a clear empty state on My Events when the host has no events.
  **Why:** A new host needs a visible first action.
