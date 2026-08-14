-- 0002 — bookmarks
--
-- What the student flagged to come back to — questions *and* whole modules.
-- One store for both: a module id (`coordchem`) can never collide with a
-- question id (`coo-014`), and a second table would mean a second sync path
-- for what is a set of strings.

create table if not exists public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  created_at timestamptz not null default now(),
  -- One row per user per item, so the app can upsert without checking first.
  primary key (user_id, question_id)
);

alter table public.bookmarks enable row level security;

drop policy if exists "users manage their own bookmarks" on public.bookmarks;
create policy "users manage their own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
