# Cloud sync setup (Supabase)

Progress tracking works **out of the box on this device** using the browser's
local storage — no setup needed. To sync solved questions **across devices**,
connect a free Supabase project by following these one-time steps.

The app already contains all the code; you only need to (1) create the project,
(2) run the migrations in `supabase/migrations/`, and (3) paste two keys into
your `.env` and Netlify.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> and sign up (free).
2. **New project** → give it a name (e.g. `chemprep`), set a database password
   (you won't need it again for this), pick a region near you, **Create**.
3. Wait ~1 minute for it to provision.

## 2. Create the tables (run the migrations)

The schema lives in [`supabase/migrations/`](supabase/migrations/), not in this
document — so the database can be rebuilt from git rather than from a page
someone has to keep in sync by hand. See [`supabase/README.md`](supabase/README.md).

Run the files **in filename order**, either with the Supabase CLI:

```bash
supabase db push
```

or by pasting each one into **SQL Editor → New query → Run**, oldest first:

| File | What it creates |
| --- | --- |
| `0001_solved_attempts.sql` | `solved` (one row per question answered correctly) and `attempts` (the append-only log of every answer, right or wrong — what weak-topic tracking, streaks and review are computed from) |
| `0002_bookmarks.sql` | `bookmarks` — questions *and* modules the student flagged |
| `0003_signals.sql` | `signals` — the four feedback loops in one append-only table |
| `0004_signals_rate_limit.sql` | a per-address insert budget for `signals` (see below) |
| `0005_progress_reset.sql` | `progress_reset` — one timestamp per user, recording that they erased their progress |
| `0006_retention.sql` | `apply_retention()` — the data-retention policy, written down and runnable |

Every file is idempotent — `create table if not exists`, `drop policy if
exists` before each `create policy`, `drop trigger if exists` before the
trigger, `create or replace` for functions — so re-running the chain against a
database that already has some of it is safe. That property is what makes
`db push` usable on a project whose schema was applied by hand.

**After pushing, run [`supabase/verify.sql`](supabase/verify.sql):** SQL editor
→ New query → paste the whole file → Run, then read the `ok` column. It is
deliberately ONE query rather than ten, because the editor only shows the
result of the last statement in a script — ten statements would mean nine
invisible answers. It checks tables, RLS actually being enabled (a policy on a table
without RLS is decoration), every policy and its predicates, the two named
indexes, the primary keys, the rate-limit trigger, both functions, that
`apply_retention` is NOT executable by `anon`/`authenticated`, the
`on delete cascade` to `auth.users`, and the migration history itself. Every
row should read PASS.

The last check is the one that matters most for reproducibility: **objects
existing is not the same as the chain being recorded.** An empty
`supabase_migrations.schema_migrations` means the schema was applied by hand
and cannot be rebuilt from git, even though the app works.

`progress_reset` exists because a deletion cannot be represented in a
merge-by-union sync: an absent row and a row that was never uploaded look
identical, so a second signed-in device used to push a just-erased set straight
back up. The marker is what tells those two cases apart — a device whose last
sync predates the marker drops its local copy instead of uploading it. See
`honourRemoteReset()` in `src/progress.ts`, and `scripts/test-sync.mjs`, which
gates the behaviour.

Row-level security is enabled on all five. The first three are private to the
owning user. `signals` is the exception and deliberately so: it accepts inserts
from signed-out visitors (most readers never make an account, and their
experience is the thing worth measuring) and has **no select policy at all**,
so nothing can read it back through the API — read it in the SQL editor. That
absence is load-bearing; see the comment at the top of the migration.

Open insert with a publishable key means anyone who reads the bundle can post
rows. `0004` caps that at **240 rows per minute per client address** with a
`BEFORE INSERT` trigger — enough for any reader, far below a useful flood. The
address itself is never stored: the budget table keeps a salted hash bucketed
by the minute and sweeps itself hourly, so the no-identifiers rule still holds.

A Netlify Function in front of the endpoint is the heavier upgrade if real
abuse ever appears. On its own it would not help — the publishable key has to
stay in the bundle for auth and progress sync, so an attacker would simply keep
posting directly to PostgREST. Doing it properly means revoking anon insert
here as well and giving the function a `service_role` key.

Retention is decided in `0006_retention.sql`: `attempts` is kept indefinitely
(it is the student's own record, it is what every statistic derives from, and
the cascade from `auth.users` removes it with the account), `signals` for 12
months, `signal_budget` for an hour. Run `select * from public.apply_retention();`
in the SQL editor when you go through the feedback inbox — it is deliberately
not a scheduled trigger, because a migration that quietly installs a job
deleting rows is not something to discover later.

`signals` rows are kept for **12 months** — it is analytics with free text in
it, not a student's record. The `delete` statement is at the bottom of its
migration; run it when you go through the feedback inbox.

Each table is optional in the same way the rest of cloud sync is. Without them
— or without the keys below — the app keeps everything in localStorage and
nothing breaks.

### The queries `signals` exists to answer

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

### The queries `attempts` exists to answer

Per-question difficulty is the one measurement the app itself cannot make. A
single student answers a question once or twice, so their own log says nothing
about whether the question is hard — only the pooled table does. These are the
plan2 §6 "suspiciously easy / suspiciously hard" checks; run them when you have
enough rows for the `having` thresholds to mean something.

```sql
-- Questions almost nobody gets right. Either genuinely hard, or broken —
-- check the ones near 0% against their answer key before assuming difficulty.
select question_id, count(*) as answers,
       round(100.0 * count(*) filter (where correct) / count(*)) as pct_correct
from public.attempts
group by question_id having count(*) >= 20
order by pct_correct asc limit 30;

-- Questions almost everybody gets right: the distractors are not working, so
-- the question is costing a student time without testing anything.
select question_id, count(*) as answers,
       round(100.0 * count(*) filter (where correct) / count(*)) as pct_correct
from public.attempts
group by question_id having count(*) >= 20
order by pct_correct desc limit 30;

-- Questions students come back to and STILL miss — the ones worth rewriting
-- rather than re-tiering.
select question_id, count(*) as attempts_total,
       count(distinct user_id) as students,
       count(*) filter (where not correct) as wrong
from public.attempts
group by question_id
having count(*) filter (where not correct) >= 3
order by wrong desc limit 30;

-- Accuracy by topic across everyone, to sanity-check the per-student view.
select topic, count(*) as answers,
       round(100.0 * count(*) filter (where correct) / count(*)) as pct_correct
from public.attempts where topic is not null
group by topic order by pct_correct asc;
```

Two caveats before acting on any of it. `attempts` rows arrive only from
SIGNED-IN students, so the sample is whoever made an account. And a question
that is skipped rather than answered leaves no row at all — abandonment is the
`quiz` signal above, not an absence here.

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
- **Signing out** clears this browser's local copy. It has to: the sync pushes
  "ids this account does not have" under the *current* user, so leaving one
  person's set in the browser would write it into the next person's account on
  a shared machine. Cloud rows are untouched — signing back in restores them.
- **Reset all progress** deletes the account's rows, clears this device, and
  records the reset. Other signed-in devices drop their copies on their next
  load rather than re-uploading them.
- **Offline and partial failures:** a push that fails leaves the row queued and
  retried on the next sync; a fetch that fails leaves local data alone rather
  than being read as "the account is empty".
- **Un-solving and un-bookmarking now propagate.** The merge is a union, so an
  id merely absent locally is indistinguishable from one never uploaded — the
  fix is a per-row tombstone, kept in localStorage until the server confirms
  the delete. Tombstoned ids are also excluded from the merge, which is the
  half that matters when the delete itself failed: without it an offline
  un-solve is undone on every sync until the network returns.
- The anon key being public is by design; RLS is what protects your data.

> Supabase's free tier includes a built-in email sender with modest rate limits
> — plenty for one person. If you ever hit limits, you can plug in your own SMTP
> under Authentication → Email.
