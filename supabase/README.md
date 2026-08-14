# Database schema

`migrations/` is the source of truth for the four tables the app syncs to.
The database can be rebuilt from this directory alone — that is the point of
it existing, and the reason the SQL is no longer inlined in
`SUPABASE_SETUP.md`.

Run them **in filename order**, either way:

```bash
supabase db push          # if you use the Supabase CLI
```

or paste each file into **SQL Editor → New query → Run**, oldest first. No CLI
is required; these are plain SQL files on purpose.

Every file is **idempotent** — re-running one against a database that already
has the table is a no-op. `create table if not exists`, `create index if not
exists`, and `drop policy if exists` before each `create policy` (Postgres has
no `create policy if not exists`). So when in doubt, re-run them all.

| File | Tables | Who may write |
| --- | --- | --- |
| `0001_solved_attempts.sql` | `solved`, `attempts` | the owning user only (RLS) |
| `0002_bookmarks.sql` | `bookmarks` | the owning user only (RLS) |
| `0003_signals.sql` | `signals` | anyone, insert-only, **no select policy** |

**Retention.** `solved`, `attempts` and `bookmarks` are the student's own
record and are kept indefinitely. `signals` is analytics containing free text
and is kept **12 months**; the `delete` to run is written at the bottom of
`0003_signals.sql`. It is a manual step on purpose — see the comment there.

Adding a migration: next number, never edit a file that has been run against a
real database — write a new one that alters. The whole value here is that
replaying the directory in order reproduces the schema.

All of this is optional. Without the tables (or without the env vars in
`SUPABASE_SETUP.md`) the app degrades to local-only storage and must never
crash — that is a standing rule, not a nice-to-have.
