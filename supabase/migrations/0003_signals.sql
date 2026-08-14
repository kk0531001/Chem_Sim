-- 0003 — signals
--
-- The four feedback loops in one append-only table: which explanations readers
-- flag as unhelpful, which topics get opened and abandoned, where in a quiz
-- people stop, and the free-text bug reports.
--
-- Unlike the three tables above, this one accepts rows from SIGNED-OUT
-- visitors — most readers never make an account, and their experience is
-- exactly the thing worth measuring. So: insert-only for `anon`, and
-- deliberately NO SELECT POLICY AT ALL. Nothing can read this table through
-- the API, including the person who submitted the row; read it in the SQL
-- editor.
--
-- That absence is load-bearing, not an oversight. `note` holds the one
-- genuinely user-authored string on the site, and the app's ~108 innerHTML
-- call sites are safe precisely because it can never come back out (see the
-- header comment in src/signals.ts). Adding a select policy here would turn a
-- documented invariant into a stored-XSS vector.

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

-- RETENTION: 12 months.
--
-- Progress data (solved, attempts, bookmarks) is a student's own record and is
-- kept indefinitely. This table is not that — it is analytics, it is keyed to a
-- throwaway per-tab id nobody can be identified from, and `note` holds free
-- text a reader typed. Keeping that forever has no upside: a bug report from
-- last year is either fixed or stale, and a dwell-time row from a version of
-- the page that no longer exists cannot inform anything.
--
-- Deliberately NOT automated. pg_cron is an extension to enable, a job to
-- monitor and a scheduled DELETE against a table that currently has no rows at
-- all. Run this by hand when reviewing the feedback inbox; automate it if the
-- table ever gets big enough that the manual step is the thing being skipped.
--
--   delete from public.signals where created_at < now() - interval '12 months';

alter table public.signals enable row level security;

drop policy if exists "anyone may add a signal" on public.signals;
create policy "anyone may add a signal"
  on public.signals for insert
  to anon, authenticated
  with check (true);
