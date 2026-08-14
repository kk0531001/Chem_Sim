-- 0001 — solved + attempts
--
-- The two tables progress.ts syncs. `solved` is the set of questions answered
-- correctly (one row per question, ever); `attempts` is the append-only log of
-- every answer, right or wrong, which is the only thing that can answer "which
-- topics am I weak at" — the wrong answers are the signal.
--
-- Replayable: every statement is idempotent, so running this file against a
-- database that already has these tables is a no-op. Postgres has no
-- `create policy if not exists`, hence the drop-then-create.

create table if not exists public.solved (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  solved_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.solved enable row level security;

drop policy if exists "users manage their own rows" on public.solved;
create policy "users manage their own rows"
  on public.solved for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

drop policy if exists "users manage their own attempts" on public.attempts;
create policy "users manage their own attempts"
  on public.attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
