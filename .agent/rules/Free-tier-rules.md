# Free-tier and operating-cost rules

**Job:** Define the pilot’s hosting, database, backup, and operating-cost limits.
**Source:** PRD technical requirements and approved provider decisions.
**Held elsewhere:** Stack changes are recorded in AGENTS.md. Repeatable test steps are in test-rules.md.

## Cost

- **Rule:** The v1 pilot must not require a paid service or incur paid-plan charges. Do not enable paid usage or change a plan without the owner’s approval.
  **Why:** The pilot is intended to run without service fees.

## App hosting

- **Rule:** Use the Vercel Hobby plan for the non-commercial pilot. Before launch and before any commercial use, check Vercel’s current plan terms and confirm the selected plan is allowed.
  **Why:** Vercel’s current Hobby terms restrict use to personal or non-commercial projects; provider terms can change.
- **Rule:** Do not move the app to a paid plan automatically. Present the required plan, current cost, and reason to the owner for approval.
  **Why:** The owner controls spending.

## Database

- **Rule:** Use Supabase Free PostgreSQL for the pilot unless the owner approves a provider change recorded in AGENTS.md and the PRD.
  **Why:** Supabase is the selected pilot database provider.
- **Rule:** The owner exports the database weekly with the Supabase CLI and stores the export off-site. Before the pilot, restore an export to a disposable project and confirm the records can be read.
  **Why:** Supabase Free does not include automatic database backups, so the off-site export is the recovery copy.
- **Rule:** Do not build or schedule backup automation unless AGENTS.md explicitly authorizes it.
  **Why:** Backup tooling is an owner decision, not an inferred v1 feature.

## Availability

- **Rule:** Before the pilot, verify the Supabase project remains active and test the resume path for a project paused after low activity. Recheck current pause behavior before launch.
  **Why:** Supabase Free projects may pause after a week of low activity, which could delay the guest RSVP flow.

## When this file changes

- **Rule:** Review this file before launch, before commercial use, and whenever a provider changes its terms or pricing. Ask the owner to approve any paid plan or provider change.
  **Why:** Plan limits, eligibility, and costs can change over time.
