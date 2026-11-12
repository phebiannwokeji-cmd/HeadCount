# HeadCount

HeadCount helps event hosts collect RSVPs from one link and manage guest arrivals.

## What the app includes

- Host sign-up and login with email and password, plus sign-out.
- Supabase email-confirmation handling, including a resend confirmation action and a server callback for PKCE codes and token hashes.
- A host-only My Events page with event links, guest totals, capacity usage, and remaining spots.
- Create and edit event forms. Event changes are restricted to the signed-in owner.
- A public event page and RSVP form. Guests do not need an account.
- A capacity-safe RSVP database function that serializes submissions for an event, rejects duplicate contacts, and handles full, oversized, invalid, missing, and ended event cases.
- A host-only guest list showing guest names, contact details, party sizes, check-in controls, total guests, and a case-insensitive name search.
- A green H favicon and page-specific browser titles.

Host access is checked on the server. Row Level Security limits hosts to their own events and RSVPs. Public event details are read through a restricted database function; guest records are not exposed on public event pages.

## Technology

- Next.js App Router, TypeScript, React, and CSS Modules.
- Supabase Auth and PostgreSQL, accessed by the app through `@supabase/ssr` and `@supabase/supabase-js`.

The project instructions describe Prisma as the planned database layer, but the current app code uses Supabase clients directly and does not read `DATABASE_URL` at runtime. Do not add a database connection string to Vercel unless Prisma/database code is introduced and needs it.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the Supabase values:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
APP_URL=http://localhost:3000
```

`APP_URL` is the app origin used to build email confirmation callback links. It defaults to `http://localhost:3000` in development. Set it to the production origin when deploying.

Never commit `.env.local`, database passwords, or other private secrets. The Supabase URL and publishable key are intended for app configuration; never put a Supabase secret or service-role key in browser code.

### 3. Apply Supabase migrations

For a new Supabase project, open **SQL Editor → New query** and run the files below in order. Paste each file's full contents and run it before moving to the next one.

1. [`20261112000000_create_events_table.sql`](supabase/migrations/20261112000000_create_events_table.sql) — creates the events table and initial policies.
2. [`20261112000001_enable_rls_policies.sql`](supabase/migrations/20261112000001_enable_rls_policies.sql) — creates RSVPs, indexes, and host-scoped RLS policies.
3. [`20261112000002_update_event_atomic.sql`](supabase/migrations/20261112000002_update_event_atomic.sql) — adds the ownership-checked, capacity-safe event update function.
4. [`20261112000003_add_public_event_lookup.sql`](supabase/migrations/20261112000003_add_public_event_lookup.sql) — adds random public slugs and the restricted public event lookup function.
5. [`20261112000004_public_rsvp_submission.sql`](supabase/migrations/20261112000004_public_rsvp_submission.sql) — adds the atomic public RSVP submission function.

These migrations are not applied to Supabase just because they exist in this repository. Confirm that all five have run in the Supabase project used by the app. “Success. No rows returned” is normal for function and policy migrations.

### 4. Configure Supabase Auth URLs

In Supabase, open **Authentication → URL Configuration**:

- Set **Site URL** to `http://localhost:3000` for local development.
- Add `http://localhost:3000/auth/confirm` to the allowed Redirect URLs.

The app handles Supabase's default PKCE confirmation code and token-hash callback. The confirmation flow respects the project's email-confirmation setting.

### 5. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`. The root route currently redirects to `/login`.

Available scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Test the invite on a phone on your Wi-Fi

An invite copied while browsing `localhost` only works on that same computer. To test from a phone on the same Wi-Fi:

1. Stop the development server with **Ctrl+C**.
2. Start it so other devices on the network can reach it:

   ```bash
   npm run dev -- --hostname 0.0.0.0
   ```

3. Find the computer's Wi-Fi IPv4 address in Windows Network settings.
4. On the computer, open `http://<computer-ip>:3000/events`, sign in if needed, and copy the event invite link again.
5. Open that link on the phone while it is connected to the same Wi-Fi.

This local-network link will not work for guests outside that Wi-Fi. Deploy the app to share a link over the internet.

## Production deployment on Vercel

1. Commit and push the project to a Git provider such as GitHub. Make sure `.env.local` is ignored and not included in the repository.
2. In Vercel, import the repository as a Next.js project and deploy it.
3. In **Project Settings → Environment Variables**, add these values for **Production**:

   - `NEXT_PUBLIC_SUPABASE_URL` — the Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the Supabase publishable key.
   - `APP_URL` — the production origin, for example `https://your-app.vercel.app` (no path).

4. In Supabase **Authentication → URL Configuration**, set **Site URL** to the production origin and allow the exact callback URL `https://your-app.vercel.app/auth/confirm`. Keep the localhost callback too if you still use local development.
5. Confirm all five database migrations have been run against the Supabase project configured for production.
6. Redeploy after changing Vercel environment variables. Verify sign-up/confirmation, login, event creation, invite sharing, RSVP submission, guest-list search, and check-in on the deployed domain.

The Vercel Hobby plan is for personal, non-commercial use. Check Vercel's current plan terms before using HeadCount commercially.

## Metadata status

Browser titles vary by page, and `src/app/icon.svg` supplies the green H favicon. Homepage-only SEO metadata has not been added yet: the root route currently redirects to login, and the marketing-homepage/SEO decision is still pending. No site-wide meta description is configured.
