# HeadCount

## Description

HeadCount helps event hosts collect RSVPs from a single link so that they know who is coming and who has arrived.
Hosts create events, share a public invite link and check guests in on the day.
Guests RSVP from that link without an account.

## Who uses it

- **Host:** A person organising a birthday party, church programme or meetup. Has an account with email and password. Uses a phone or a laptop.
- **Guest:** A person invited to an event. Opens the invite link on a phone. Has no account and does not log in.
- **Tiers:** The PRD defines no user tiers. HeadCount is free in v1 with no payments.
- **Testing:** The test phase uses the fictional hosts and guests in the PRD section "Success check". The pilot is the later trial with real hosts. Build nothing for the pilot.

## One thing that the agent must do well

Let a guest RSVP to an event from a shared link without logging in.
The time target and how it is measured are in the PRD section "Core action".

After an RSVP the guest sees one of these:

- Confirmation.
- Event full.
- Party larger than the spots left. The message says how many spots remain.
- Already RSVPed with this contact.
- Event ended.
- Link not found.
- RSVP not saved.

Hold these while doing it:

- The public event page never shows other guests' names or contacts.
- A host can open only their own events and guest lists.
- The server checks event ownership on every host request.
- The RSVP form tells the guest that the host will see their name and contact.
- Capacity is counted in total guests, not in number of RSVPs.
- Two guests taking the last spot at the same moment must never both succeed.
- The guest sees a confirmation only after the RSVP is saved.
- Deleting an event deletes all its guest data.
- Passwords are never stored in plain text.

## Defined Scope for the MVP

The MVP is v1 in the PRD. Build only what this list and the PRD sections require. Anything else is out of scope.

- Host signup, login and logout with email and password only.
- Create, edit and delete events. Capacity cannot go below the guests already booked. Deleting an event asks for confirmation and removes its RSVPs.
- Public invite link and RSVP form.
- Capacity limit counted in total guests.
- Guest list with name filter, remove RSVP, check-in and totals.

Guest list totals are the number of RSVPs, total guests, guests checked in and spots left. The name filter narrows the list by guest name.
There are five screens. Sign up and log in is one screen. Create or edit event is one screen. The others are my events, guest list and public event page.
HeadCount sends no email or SMS in v1. On-screen confirmation and error messages are required.
Done means the checks in the PRD section "Success check" pass. Checks marked real pilot wait for the real pilot.

## Not in scope items for the MVP

Do not build any of these. If a task needs one, stop and tell the human it is out of scope for v1.

- Paid tickets
- QR codes
- Email or SMS reminders
- Guest accounts
- Multiple hosts per event
- Custom domains
- Waitlist
- Guest edit or cancel of an RSVP
- Password reset
- Email verification
- AI features

## Stack

These four are fixed. Do not replace them.

- Next.js
- TypeScript
- Prisma
- PostgreSQL

Also stated in the PRD:

- App hosting: Vercel.
- Database host: Supabase Free PostgreSQL is the planned provider. The owner can change providers only by approving and updating this file and the PRD. Keep Prisma as the database access layer and use standard PostgreSQL features; this provider change does not add Supabase Auth or client SDK requirements.
- Render the public event page on the server.
- Show a clear message on every failure. Never show a blank page.
- Backups are done by the owner by hand. Do not build backup or export features.
- No paid outside services in v1.
- No AI features in v1.

## Folder map

- AGENTS.md: project root.
- HeadCount_PRD_R.md: the PRD, in the project root.
- Folders in the default Next.js project layout are allowed. Ask before creating any other folder.
- The rules files named below do not exist yet. Their folder is not defined yet.

## How to work in this codebase

1. Before every task, read the PRD sections the task touches. Take product facts only from the PRD and this file.
2. One change is one PRD requirement or one bug fix. Finish it and report it before you start another.
3. Ask before adding any package or dev dependency. The four stack items and their own default packages are allowed.
4. Never touch the database. Do not run any command or test that connects to it. Do not write migration files or seed scripts. Ask before editing the Prisma schema. Show the human the exact command to run.
5. Store only the three things in the PRD section "Data to store". Ask before adding any other table or field, including for the spam limit.
6. List every assumption at the end of every response. An assumption is any fact you used that is not in the PRD or this file. Assume only code style and file names. Write "Assumptions: none" if there are none.
7. Stop and ask when the PRD is silent on a product behavior, data rule, security rule or stack choice that the task needs.
8. Test email addresses and real pilot names are not supplied. Do not invent them and do not write seed scripts. Stop and ask the human.
9. The owner has confirmed the decisions in the PRD section "Decisions made in review". Build to them.

## Where the detailed rules live

These files will hold the detailed rules. They do not exist yet. Until they exist, read the PRD instead.

- HeadCount_PRD_R.md: the product source of truth.
- product-rules.md: maps to the PRD sections Core action, User flows and Screens.
- data-rules.md: maps to the PRD section Data to store.
- security-rules.md: maps to the PRD section Access and privacy.
- tech-rules.md: maps to the PRD section Technical requirements.
- test-rules.md: maps to the PRD section Success check.
- decisions.md: maps to the PRD section Decisions made in review.

## Definitions

- **HeadCount:** The product name. Write it as HeadCount everywhere, including user-facing text.
- **owner:** The person who owns the HeadCount project and approves decisions. It does not mean the host who owns an event.
- **host:** A person who creates events and manages the guest list.
- **guest:** A person who RSVPs to an event from the invite link.
- **event:** A gathering a host creates. It has a title, date and time, venue and time zone. It also has an optional description. RSVPs close when the event starts. After that the public page stays visible and shows "This event has ended."
- **RSVP:** A guest's reply to an event. It holds a name, a contact and a number of guests.
- **party size:** The number of guests on one RSVP, including the guest who RSVPs.
- **capacity:** The limit of an event, counted in total guests.
- **spots left:** Capacity minus the sum of party sizes across the event's RSVPs.
- **full:** Spots left is zero. If spots left is above zero but below the party size, the guest sees the party-too-large message.
- **contact:** One required text field. It holds a phone number or an email in any format the guest types. The app does not verify it.
- **duplicate:** One contact can RSVP once per event. Contacts are compared after trimming spaces and ignoring letter case.
- **check-in:** The host ticking an RSVP when guests arrive. One tick covers the whole party.
- **invite link:** The public link to an event. It uses a random identifier, never a sequential one.
- **test phase:** The first run, with the fictional hosts and guests in the PRD section "Success check".
- **pilot:** The later trial with real hosts.

