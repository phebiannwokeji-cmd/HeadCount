# PRD: Headcount (v1, revised)

**Status:** Revised after a full review. Items marked "Decided in review" filled gaps in the original blueprint. The owner should confirm them before build. Items marked "Added in review" are small additions needed to meet the blueprint's own goals.

**Source:** The RSVP Hub worked example, adopted by the owner as the v1 product and renamed Headcount.

## 1. One-liner

Headcount helps event hosts collect RSVPs from a single link so that they know who is coming and who has arrived.

## 2. Business model

Free in v1. No payments. (Decided in review.)

## 3. Target users

**Host (primary user):** A person organising a birthday party, church programme or meetup for 50 to 150 guests. The host has an account. The host uses a phone or a laptop.

**Guest:** A person invited to the event who opens the shared invite link on a phone. Guests do not have accounts and do not log in.

## 4. Problem

Hosts struggle to know who is coming and who has arrived, because replies are scattered across calls and messages and the guest list lives on paper.

The owner adopted this example as v1. The problem is untested. Real pilot hosts will confirm it after the test phase (see Section 13).

## 5. Core action

A guest can RSVP to an event from a shared link in under 30 seconds.

**How it is measured:** from page load to the confirmation message, for a guest who has never seen the form. A rejected RSVP counts as a failed attempt, so every error message must be clear.

## 6. User flows

### Host flow

1. Sign up with an email and password, then log in.
2. Create an event with a title, date and time, venue and capacity.
3. Copy the public invite link and share it with guests.
4. Edit the event if details change. Capacity cannot go below the number of guests already booked. (Decided in review.)
5. Remove an RSVP that is wrong or a duplicate. (Decided in review.)
6. On the day, open the guest list, find a name and tick guests off as they arrive. Check-in is per RSVP, so one tick covers the whole party.
7. Delete an event if needed. The app asks for confirmation and deletes its RSVPs too. (Decided in review.)
8. Log out. (Added in review.)

### Guest flow

1. Open the invite link and read the event details.
2. Fill in name, contact and number of guests, then tap RSVP.
3. See a confirmation after the RSVP is saved, or one of these messages:
   - The event is full.
   - Your party is larger than the spots left. The message says how many spots remain.
   - You have already RSVPed with this contact. Ask the host to change it.
   - This event has ended.
   - This link was not found.
   - Your RSVP was not saved. Try again.

## 7. Screens

| Screen | Purpose | Key things on it |
| --- | --- | --- |
| Sign up / Log in | Create an account or enter the app | Email, password, switch between signup and login, log out option elsewhere in the app |
| My events | See my events and create a new one | Event list, Create event button, link to each guest list, a clear empty state for new hosts |
| Create or edit event | Set up or change the event details | Title, date and time, venue, capacity, description, delete event option |
| Guest list | See who has RSVPed and check guests in | Guest names, number of guests, check-in toggle, name filter (added in review), remove RSVP option, totals (see Section 9) |
| Public event page | Let guests view the event and RSVP, no login needed | Event details, RSVP form, notice that the host sees the name and contact, confirmation or error message |

The public event page shows event details only. It never shows other guests' names or contacts.

## 8. Access and privacy

- Hosts have accounts with email and password. Passwords are stored hashed. Never store a plain password.
- A host can open only their own events and guest lists. The server checks ownership on every host request.
- The public event page and RSVP form need no login.
- Guest name and contact are visible only to the host who owns the event.
- The contact field exists so the host can reach guests by hand. Headcount sends no messages in v1.
- The RSVP form tells the guest that the host will see their name and contact.
- Deleting an event deletes all its guest data.

## 9. Data to store

**User**

| Field | Type and rule |
| --- | --- |
| id | Unique ID |
| email | Text, unique |
| passwordHash | Text, hashed password |
| createdAt | Timestamp |

**Event**

| Field | Type and rule |
| --- | --- |
| id | Unique ID |
| owner | Link to one User |
| title | Text, required |
| startsAt | Timestamp stored in UTC |
| timeZone | Text, the time zone name chosen when the event is created |
| venue | Text, required |
| description | Text, optional |
| capacity | Whole number, 1 or more, counted in total guests |
| publicSlug | Random text of 10 or more characters, unique. Never sequential. |
| createdAt | Timestamp |

**RSVP**

| Field | Type and rule |
| --- | --- |
| id | Unique ID |
| event | Link to one Event. Deleted when the event is deleted. |
| guestName | Text, required |
| contact | Text, required, phone number or email, any format the guest types |
| partySize | Whole number from 1 to 10, including the guest (Decided in review) |
| checkedIn | True or false, default false |
| createdAt | Timestamp |

**Rules**

- One contact can RSVP once per event. Compare contacts after trimming spaces and ignoring letter case. The database enforces this rule.
- Spots left equal capacity minus the sum of partySize across the event's RSVPs.
- Index the owner on Event and the event on RSVP.

**Guest list totals:** number of RSVPs, total guests, guests checked in, spots left.

## 10. Technical requirements

**Stack:** Next.js, TypeScript, Prisma and PostgreSQL.

- **Capacity:** Count spots inside a database transaction that locks the event row. Accept an RSVP only if the party fits the spots left. Two guests taking the last spot at the same moment must never both succeed.
- **Confirmation:** Show the confirmation only after the RSVP is saved.
- **Spam control:** Limit RSVP submissions per IP address, per event. Start at 30 per 10 minutes and adjust after the pilot. Guests at one venue often share an IP address, so a low limit would block real guests. (Starting value, decided in review.)
- **Link safety:** The invite link uses the random publicSlug.
- **Performance:** Render the public page on the server. Keep it light. Test the RSVP flow with network throttling in the browser tools.
- **Failure handling:** Show a clear message on every failure. Never show a blank page.
- **Hosting:** Host the app on Vercel. The pilot can use the free Hobby plan because v1 is free and non-commercial. Move to the Pro plan before any charging or other commercial use. (Decided by the owner.)
- **Backups:** Supabase Free does not include automatic database backups. The owner exports the database by hand every week using the Supabase CLI and stores the export off-site. The owner tests restoring an export to a disposable project before the pilot. Recheck current plan and backup details before launch. (Decided by the owner.) [Supabase backup guide](https://supabase.com/docs/guides/platform/backups)
- **Database availability:** Supabase Free projects may be paused after a week of low activity. Test the project-resume path and measure its effect on the guest RSVP flow before the pilot. Recheck current pause behavior before launch. [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- **Cost:** Run v1 on free or low-cost tiers. Use no paid outside services.
- **AI:** No AI features in v1.

## 11. v1 scope

**In v1:**

- Host signup, login and logout
- Create, edit and delete events
- Public invite link and RSVP form
- Capacity limit counted in total guests
- Guest list with name filter, remove RSVP, check-in and totals

## 12. Not in v1

The following are out of scope for v1:

- Paid tickets
- QR codes
- Email or SMS reminders
- Guest accounts
- Multiple hosts per event
- Custom domains
- Waitlist (added in review)
- Guest edit or cancel of an RSVP (added in review)
- Password reset (added in review)
- Email verification (added in review)
- AI features (added in review)

**Known risk:** Without password reset, a host who forgets a password loses access to their events. This is accepted for the three-host pilot.

## 13. Success check

**Test phase:** The first run uses the fictional hosts and guests below. The owner supplies real test email addresses for them. This phase tests the build. It does not prove that real hosts have the problem in Section 4. Check 9 and the real-event part of check 5 wait for a real pilot.

**Fictional hosts**

| Host | Event | Capacity | Test email |
| --- | --- | --- | --- |
| Amara Okafor | Birthday party | 60 | To be supplied by the owner |
| Daniel Mensah | Church programme | 120 | To be supplied by the owner |
| Zoe Carter | Small meetup, capacity kept low on purpose to test the "full" message | 6 | To be supplied by the owner |

**Fictional guests**

| Guest | Event | Party size | Test email |
| --- | --- | --- | --- |
| Tolu Adeyemi | Amara's party | 2 | To be supplied by the owner |
| Ngozi Eze | Amara's party | 1 | To be supplied by the owner |
| Samuel Bright | Amara's party | 4 | To be supplied by the owner |
| Grace Lawson | Daniel's programme | 3 | To be supplied by the owner |
| Peter Nwosu | Daniel's programme | 1 | To be supplied by the owner |
| Halima Bello | Daniel's programme | 2 | To be supplied by the owner |
| Ivy Chen | Zoe's meetup | 2 | To be supplied by the owner |
| Marcus Reed | Zoe's meetup | 3 | To be supplied by the owner |
| Lena Park | Zoe's meetup | 2, then retries with 1 | To be supplied by the owner |
| Omar Haddad | Zoe's meetup | 1 | To be supplied by the owner |

**Test script for Zoe's meetup:** Ivy (2) and Marcus (3) fill 5 of 6 spots. Lena tries 2 and sees "your party is larger than the spots left" with 1 spot remaining. Lena retries with 1 and succeeds. Omar then sees "the event is full."

The check passes when all of these are true:

1. Each of the 3 fictional hosts creates an event.
2. The 10 fictional guests RSVP using phone browsers. The tester follows the script without asking the builder a question.
3. The median time from page load to confirmation is under 30 seconds.
4. Zoe's meetup shows both the "party too large" message and the "full" message, as scripted above.
5. One host completes check-in in a dry run, and the totals match. (Repeat at a real event during the real pilot.)
6. A second host account cannot open the first host's guest list.
7. The public event page shows no guest names or contacts.
8. A test sends 20 simultaneous RSVPs of one guest each for 10 open spots. Exactly 10 succeed.
9. Real pilot only: each real host answers yes or no, "Did you stop using paper or calls for your guest list?"
10. Ngozi tries to RSVP to Amara's party a second time with the same contact and sees the duplicate message.

## 14. Assumptions

1. Guests own a phone with a web browser.
2. Hosts will share the invite link themselves.
3. Hosts and guests will type contact details correctly. The app does not verify them.
4. The problem in Section 4 is real. Real pilot hosts will confirm it.

## 15. Decisions made in review

Confirm or change these before build.

| Question | Decision |
| --- | --- |
| How is capacity counted? | In total guests. Reject a party that does not fit and say how many spots remain. |
| What is "contact"? | One text field. A phone number or an email. |
| Duplicate RSVPs? | Rejected by contact on the same event. Guests cannot edit or cancel. The host can remove an RSVP. |
| Can hosts edit or delete? | Yes. Capacity cannot drop below booked guests. Delete asks for confirmation and removes RSVPs. |
| Check-in granularity? | Per RSVP, so one tick covers the whole party. This is a known limit. |
| What does the total count show? | RSVPs, total guests, guests checked in and spots left. |
| Password reset? | Not in v1. Risk named in Section 12. |
| Date and time? | Date and time, stored in UTC with a time zone. |
| After the event? | RSVPs close when the event starts. The page stays visible and shows "This event has ended." |
| Maximum party size? | 10. Confirmed in review. |
| Where is the app hosted? | Vercel. (Decided by the owner.) |
| Which database and backup plan? | Supabase Free PostgreSQL is the planned choice. The owner can swap providers only by approving and updating this PRD and AGENTS.md. The owner exports weekly with the Supabase CLI and stores the export off-site. (Decided by the owner.) |
| Who tests first? | Fictional hosts and guests, with real test email addresses from the owner. (Decided by the owner.) |

## 16. Still open

1. Test email addresses for the 3 fictional hosts and 10 fictional guests (13 in total).
2. The names of real pilot hosts and guests, needed before the real pilot starts.

