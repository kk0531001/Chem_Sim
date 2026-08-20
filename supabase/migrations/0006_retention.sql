-- Retention policy, written down (plan2 §3).
--
-- `signals` already carried a 12-month rule in a comment. `attempts` carried
-- none at all, which is the gap: it is the largest table, it grows without
-- bound, and it is the one holding a record of every answer a named student
-- ever gave. "We never decided" is not a policy, and it is the answer that ages
-- worst.
--
-- THE DECISION, and the reasoning, so it can be argued with later:
--
--   attempts — KEPT INDEFINITELY, per user, deleted with the account.
--     It is the student's own record and the thing every statistic is derived
--     from; trimming it would silently degrade their weak-topic model and
--     streaks. It is already bounded per user by how much chemistry a person
--     can do, and the FK to auth.users cascades, so deleting an account
--     deletes the history. The one thing that would change this is scale, and
--     scale is not a reason to guess now.
--
--   signals — 12 MONTHS. Analytics with free text in it, not a student record.
--     Nothing reads a year-old dwell time, and the feedback box is the only
--     place on the site where someone types prose that is stored at all.
--
--   signal_budget — 1 HOUR, already swept by 0004.
--
-- These are statements to RUN, not triggers. Supabase's scheduler (pg_cron) is
-- opt-in per project, and a migration that silently enables a background job
-- deleting rows is not something to bury in a schema file — if you want it
-- automated, schedule the function below yourself and you will know it exists.

create or replace function public.apply_retention()
returns table (deleted_signals bigint, deleted_budget bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  s bigint;
  b bigint;
begin
  delete from public.signals where created_at < now() - interval '12 months';
  get diagnostics s = row_count;

  delete from public.signal_budget where minute < now() - interval '1 hour';
  get diagnostics b = row_count;

  -- `attempts` is deliberately absent. See the note above: it is the student's
  -- own record, it is what the learning engine reads, and it is removed by the
  -- cascade when an account is deleted.
  return query select s, b;
end;
$$;

-- security definer + a pinned search_path, and EXECUTE granted to nobody: this
-- is for the SQL editor or a scheduled job you create knowingly, not something
-- the anon or authenticated roles may call. Without the revoke, `authenticated`
-- would inherit EXECUTE from PUBLIC and any signed-in user could purge the
-- analytics table.
revoke all on function public.apply_retention() from public;
revoke all on function public.apply_retention() from anon, authenticated;
