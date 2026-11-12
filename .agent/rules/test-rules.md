# HeadCount test rules

**Job:** Define the checks that show whether the MVP works and how to run them safely.
**Source:** PRD success check.
**Held elsewhere:** RSVP decisions are in capacity-rules.md; timing and user-visible messages are in product-rules.md.

## Test setup rules

- **Rule:** Use a disposable test project or database for database and concurrency checks. Never run fixture, destructive, or concurrency tests against production or real pilot data.
  **Why:** Test data and destructive actions must not affect real hosts or guests.
- **Rule:** The owner runs checks that require database credentials. The agent may create migration and test files but does not connect to the owner’s database.
  **Why:** The owner controls access to hosted data and secrets.
- **Rule:** For manual account checks, the owner uses inboxes they control and enters credentials locally. Do not put real email addresses, passwords, or contacts in committed fixtures.
  **Why:** Auth tests need usable inboxes without exposing personal data in the repository.
- **Rule:** If a manual test account is unavailable, mark only that account check as blocked and continue checks that do not depend on it.
  **Why:** Missing credentials should not stop unrelated build work.
- **Rule:** Use fictional names and synthetic guest contacts in fixtures. Reuse the exact synthetic contact only for the duplicate-contact test.
  **Why:** The tests should be repeatable without real guest data.

## Fictional hosts

| Host | Event | Capacity |
| --- | --- | --- |
| Amara Okafor | Birthday party | 60 |
| Daniel Mensah | Church programme | 120 |
| Zoe Carter | Small meetup | 8 |

## Fictional guests for the success check

| Guest | Event | Party size |
| --- | --- | --- |
| Tolu Adeyemi | Amara’s party | 2 |
| Ngozi Eze | Amara’s party | 1 |
| Samuel Bright | Amara’s party | 4 |
| Grace Lawson | Daniel’s programme | 3 |
| Peter Nwosu | Daniel’s programme | 1 |
| Halima Bello | Daniel’s programme | 2 |
| Ivy Chen | Zoe’s meetup | 2 |
| Marcus Reed | Zoe’s meetup | 3 |
| Lena Park | Zoe’s meetup | 2 |
| Omar Haddad | Zoe’s meetup | 1 |

All ten guests fit their assigned event. Their total party sizes do not exceed each event’s capacity.

## Separate capacity-edge-case fixture

Use a separate disposable event with capacity 6. It is not part of the ten-guest success check.

1. Ivy (2) and Marcus (3) book 5 of 6 spots.
2. Lena tries 2 and is refused with 1 spot remaining.
3. Lena retries with 1 and succeeds, filling the event.
4. Omar tries 1 and is refused because the event is full.

Expected outcome: three RSVP records succeed in this edge-case event; Lena’s first attempt and Omar’s attempt are refused.

## Pre-pilot checks

1. Each of the three host accounts creates one event.
2. All ten fictional guests successfully RSVP from phone-sized browser viewports without help from the builder.
3. The median time for first-time valid RSVPs is under 30 seconds as defined in product-rules.md. Record rejected-attempt durations separately.
4. The separate capacity fixture shows the too-large response and the full response with the correct remaining-space details.
5. A host checks in an RSVP, refreshes, and confirms the state persists. RSVP count, booked people, checked-in people, and spots left match the test event.
6. A second host account cannot open or change the first host’s events or guest list.
7. The public event page shows no guest names or contact details.
8. On a disposable event with capacity 10 and no RSVPs, send 20 simultaneous one-person RSVP requests. Exactly 10 succeed and 10 are refused.
9. Ngozi first RSVPs to Amara’s event using the synthetic contact ngozi-test@example.test. She retries with that exact contact and sees the duplicate response. This is guest contact test data, not a host login address.

## Real pilot check

- **Rule:** During the real pilot, each of the three hosts answers: “Did you stop using paper or calls for your guest list?” Record the answer separately from software checks.
  **Why:** A successful build does not prove the product solved the host’s original problem.

