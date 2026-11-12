# HeadCount

HeadCount helps event hosts collect RSVPs from a single link so that they know who is coming and who has arrived.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```
*(On Windows Command Prompt: `copy .env.example .env.local`)*

Fill in the required values in `.env.local`:
- `DATABASE_URL`: Secret PostgreSQL connection string used server-side. Never expose to the browser or prefix with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase project URL (safe for browser exposure).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Public publishable API key (safe for browser exposure).

> **Security Note:** Never commit `.env.local` or any files containing actual secrets to version control.

### 3. Database Migrations (Supabase Dashboard)

To set up the database schema on a fresh Supabase project:

1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **SQL Editor** in the left sidebar, then click **New query**.
3. Apply the migration files under `supabase/migrations/` in sequential order:
   - **1. Create Events Table:** Copy and run [`supabase/migrations/20261112000000_create_events_table.sql`](supabase/migrations/20261112000000_create_events_table.sql) (creates the `events` table and index).
   - **2. Enable RLS and Create RSVPs:** Copy and run [`supabase/migrations/20261112000001_enable_rls_policies.sql`](supabase/migrations/20261112000001_enable_rls_policies.sql) (creates the `rsvps` table referencing `events`, enables RLS on both tables, and applies scoped access policies).

### 4. Development and Build Commands

- **Development server:**
  ```bash
  npm run dev
  ```
  Starts the local development server at `http://localhost:3000`.

- **Build for production:**
  ```bash
  npm run build
  ```

- **Run production build:**
  ```bash
  npm run start
  ```

- **Run linter:**
  ```bash
  npm run lint
  ```
