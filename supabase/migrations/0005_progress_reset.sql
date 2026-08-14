-- Reset tombstone.
--
-- resetAllProgress() deletes the account's solved/attempts/bookmarks rows and
-- clears the device it ran on. That was not enough: a SECOND signed-in device
-- still held the full local set, and its next sync pushed the lot straight back
-- up (syncWithRemote pushes every id the account is missing). The reset undid
-- itself, while the UI promised "this also deletes them from every other
-- device".
--
-- A deletion is not representable in a merge-by-union sync model — an absent
-- row and a row-never-uploaded look identical. So record the deletion itself:
-- one timestamp per user, which every device compares against its own
-- last-sync time. Newer marker than my last sync = the account was reset
-- somewhere else = drop my local copy instead of uploading it.

create table if not exists public.progress_reset (
  user_id  uuid primary key references auth.users on delete cascade,
  reset_at timestamptz not null default now()
);

alter table public.progress_reset enable row level security;

-- Same shape as solved/attempts/bookmarks: your own row, all four verbs, with
-- the write predicate as well as the read one so a forged user_id is rejected.
create policy "progress_reset is per-user"
  on public.progress_reset for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
