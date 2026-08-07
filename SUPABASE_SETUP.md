# Cloud sync setup (Supabase)

Progress tracking works **out of the box on this device** using the browser's
local storage — no setup needed. To sync solved questions **across devices**,
connect a free Supabase project by following these one-time steps.

The app already contains all the code; you only need to (1) create the project,
(2) run one SQL snippet, and (3) paste two keys into your `.env` and Netlify.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> and sign up (free).
2. **New project** → give it a name (e.g. `chemprep`), set a database password
   (you won't need it again for this), pick a region near you, **Create**.
3. Wait ~1 minute for it to provision.

## 2. Create the `solved` table (run the SQL)

In the project, open **SQL Editor → New query**, paste this, and click **Run**:

```sql
create table if not exists public.solved (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  solved_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.solved enable row level security;

create policy "users manage their own rows"
  on public.solved for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

This gives every signed-in user a private set of solved questions;
row-level security means no one can read anyone else's rows.

## 2b. Create the `attempts` table (run the SQL)

`solved` records only successes. `attempts` records every answer, right or
wrong — it's what quiz history, weak-topic tracking, streaks and personalised
review are computed from. Same SQL Editor, same procedure:

```sql
create table if not exists public.attempts (
  -- Client-generated uuid, NOT a serial: the app upserts on this key so a
  -- retried or re-synced push can never duplicate an attempt.
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  topic text,
  correct boolean not null,
  chosen smallint,
  answered_at timestamptz not null default now()
);

-- The app always reads "this user's most recent attempts", so index for it.
create index if not exists attempts_user_time_idx
  on public.attempts (user_id, answered_at desc);

alter table public.attempts enable row level security;

create policy "users manage their own attempts"
  on public.attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Unlike `solved` (one row per question), this table is append-only and grows
with use, so expect many rows per question. That's intentional: an attempt log
is the only thing that can answer "which topics am I weak at", because the
wrong answers are the signal.

This table is optional in the same way the rest of cloud sync is — without it
(or without the env vars) the app still tracks attempts in localStorage and
just doesn't sync them.

## 2c. Create the `bookmarks` table (run the SQL)

What the student has flagged to come back to — questions *and* whole modules.
One store for both: a module id (`coordchem`) can never collide with a question
id (`coo-014`), and a second table would mean a second sync path for a set of
strings.

```sql
create table if not exists public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  created_at timestamptz not null default now(),
  -- One row per user per item, so the app can upsert without checking first.
  primary key (user_id, question_id)
);

alter table public.bookmarks enable row level security;

create policy "users manage their own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Optional like the rest: without it, bookmarks live in localStorage and simply
don't follow the user to another device.

## 2d. Create the `signals` table (run the SQL)

The feedback loops (ROADMAP I.2): which explanations readers flag as unhelpful,
which topics get opened and abandoned, where in a quiz people stop, and the
free-text bug reports. One table for all four, because it is one append-only
stream that the app only ever writes.

Unlike the three tables above, **this one accepts rows from signed-out
visitors** — most readers never make an account, and their experience is
exactly the thing worth measuring. So the policy is insert-only for `anon`, and
there is deliberately **no select policy at all**: nothing can read this table
through the API, including the person who submitted the row. Read it in the SQL
editor.

```sql
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  -- view: ref = topic id, n = seconds spent on it
  -- quiz: ref = question id stopped on, n = questions answered
  -- explain: ref = question id, note = 'yes' | 'no'
  -- feedback: ref = page path, note = what the reader typed
  kind text not null check (kind in ('view', 'quiz', 'explain', 'feedback')),
  ref text not null check (length(ref) <= 200),
  n integer,
  -- Bounded in the database as well as in the client: the client-side limit is
  -- a courtesy, and this column is reachable by anyone with the anon key.
  note text check (note is null or length(note) <= 2000),
  -- A random per-TAB id from sessionStorage, so one visit's rows can be read
  -- as one visit. Not a user id, not a cookie, and gone when the tab closes.
  session text not null check (length(session) <= 64),
  created_at timestamptz not null default now()
);

create index if not exists signals_kind_time_idx
  on public.signals (kind, created_at desc);

alter table public.signals enable row level security;

create policy "anyone may add a signal"
  on public.signals for insert
  to anon, authenticated
  with check (true);
```

Open insert with the publishable key means anyone who reads the bundle can post
rows to it. That is the price of measuring signed-out readers, and the exposure
is bounded by the length checks above — but if it is ever abused, the fix is a
Netlify Function in front of it, not a stricter policy here (a policy that can
tell a student from a script would need an account, which defeats the purpose).

The queries this exists to answer:

```sql
-- Explanations readers are telling you are bad. Start rewriting at the top.
select ref, count(*) filter (where note = 'no') as unhelpful,
             count(*) filter (where note = 'yes') as helpful
from public.signals where kind = 'explain'
group by ref having count(*) filter (where note = 'no') > 0
order by unhelpful desc;

-- Topics opened and abandoned: a low median means the page is not landing.
select ref as topic, count(*) as opens,
       percentile_cont(0.5) within group (order by n) as median_seconds
from public.signals where kind = 'view'
group by ref order by median_seconds;

-- Where quizzes are abandoned — the question people stop on.
select ref as stopped_on, count(*) as times, round(avg(n)) as avg_answered
from public.signals where kind = 'quiz'
group by ref order by times desc limit 20;

-- The inbox.
select created_at, ref as page, note from public.signals
where kind = 'feedback' order by created_at desc;
```

Optional like the rest: without the table (or without the keys) the app posts
nothing, the buttons still acknowledge, and nothing breaks.

## 3. Get your two keys

**Settings → API** (or **Project Settings → API**):

- **Project URL** — looks like `https://abcdxyz.supabase.co`
- **anon / public** key — a long `eyJ…` string. This is the *publishable* key,
  safe to ship in the client. **Do NOT use the `service_role` key.**

## 4. Add the keys locally

Copy `.env.example` to `.env` in the project root and fill in your values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://abcdxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
```

`.env` is gitignored, so your keys never get committed. Restart `npm run dev`.

## 5. Add the keys to Netlify

In your Netlify site: **Site configuration → Environment variables → Add a
variable** (add both, exactly these names):

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | your Project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon public key |

Then **Deploys → Trigger deploy → Deploy site** so the build picks them up.

## 6. (Optional) Enable "Continue with Google"

The app already has a Google sign-in button everywhere email sign-in appears
(homepage popover + app sidebar). To make it work:

1. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project (or use an existing one) → **APIs & Services → Credentials →
   Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Before this step, open Supabase → **Authentication → Providers → Google**
     and copy the **Callback URL (for OAuth)** it shows you — it looks like
     `https://ucxosbxfrbhvytxqqoif.supabase.co/auth/v1/callback`.
   - Paste that exact URL into Google's **Authorized redirect URIs**.
2. Google gives you a **Client ID** and **Client Secret** — copy both.
3. Back in Supabase → **Authentication → Providers → Google**: toggle it
   **on**, paste the Client ID and Client Secret, **Save**.

That's it — no code changes needed. If you skip this step, the Google button
will show an error ("provider is not enabled") but email magic-link still
works fine on its own.

## 7. Allow the magic-link redirect

In Supabase, **Authentication → URL Configuration**:

- **Site URL:** your Netlify URL (e.g. `https://your-site.netlify.app`)
- **Redirect URLs:** add both your Netlify URL and `http://localhost:5174`
  (so sign-in works in local dev too).

Email/magic-link sign-in is enabled by default on new projects — nothing else
to toggle.

---

## How it behaves

- **Signed out / no keys:** progress is saved locally in the browser. The
  sidebar panel shows the solved count and a note.
- **Signed in:** the sidebar shows an email box → **Send magic link**. Open the
  emailed link on any device to sign in. Your solved set then merges with the
  cloud and stays in sync everywhere — including questions you solved while
  signed out (they get pushed up on first sign-in).
- The anon key being public is by design; RLS is what protects your data.

> Supabase's free tier includes a built-in email sender with modest rate limits
> — plenty for one person. If you ever hit limits, you can plug in your own SMTP
> under Authentication → Email.
