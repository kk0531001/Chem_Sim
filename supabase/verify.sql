-- Post-migration verification. Paste into the Supabase SQL editor after
-- `supabase db push` and read the `ok` column: every row should say PASS.
--
-- This is the check that the DATABASE matches what the app assumes. The app's
-- own gate (`npm run audit`) proves the client behaves; nothing in it can see
-- whether the server actually has the table, the policy or the index the
-- client is relying on. That gap is what let migration 0005 sit unapplied
-- while every local test passed.
--
-- Safe to run repeatedly: it reads catalogues and writes nothing.

-- 1. TABLES -----------------------------------------------------------------
select 'tables' as check,
       t.expected,
       case when c.relname is null then 'FAIL — missing' else 'PASS' end as ok
from (values ('solved'),('attempts'),('bookmarks'),('progress_reset'),
             ('signals'),('signal_budget')) as t(expected)
left join pg_class c
       on c.relname = t.expected
      and c.relnamespace = 'public'::regnamespace
      and c.relkind = 'r'
order by 2;

-- 2. ROW LEVEL SECURITY IS ON ------------------------------------------------
-- A policy on a table without RLS enabled is decoration: Postgres ignores it.
select 'rls enabled' as check,
       c.relname as table,
       case when c.relrowsecurity then 'PASS' else 'FAIL — RLS OFF' end as ok
from pg_class c
where c.relnamespace = 'public'::regnamespace
  and c.relkind = 'r'
  and c.relname in ('solved','attempts','bookmarks','progress_reset','signals','signal_budget')
order by 2;

-- 3. POLICIES ----------------------------------------------------------------
-- Expected: one per-user policy on each of the four progress tables, exactly
-- one INSERT-only policy on signals, and NONE on signal_budget.
select 'policies' as check,
       tablename as table,
       policyname,
       cmd,
       coalesce(qual, '(none)') as using_expr,
       coalesce(with_check, '(none)') as check_expr
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3b. the specific invariant: no policy may be unconditionally permissive on a
-- user-owned table. `using (true)` there would expose every student's rows.
select 'permissive check' as check,
       tablename, policyname,
       case when qual = 'true' then 'FAIL — using(true) on a user table' else 'PASS' end as ok
from pg_policies
where schemaname = 'public'
  and tablename in ('solved','attempts','bookmarks','progress_reset');

-- 3c. signals must have NO select policy — that absence is load-bearing, it is
-- what stops the free-text feedback column being readable through the API.
select 'signals select policy' as check,
       case when count(*) = 0 then 'PASS — no select policy, as designed'
            else 'FAIL — signals is readable through PostgREST' end as ok
from pg_policies
where schemaname = 'public' and tablename = 'signals'
  and cmd in ('SELECT','ALL');

-- 4. INDEXES -----------------------------------------------------------------
-- Every client query filters on user_id; attempts additionally orders by time.
select 'indexes' as check, i.expected,
       case when x.indexname is null then 'FAIL — missing' else 'PASS' end as ok
from (values ('attempts_user_time_idx'),('signals_kind_time_idx')) as i(expected)
left join pg_indexes x on x.indexname = i.expected and x.schemaname = 'public'
order by 2;

-- primary keys carry the rest: (user_id, question_id) on the three set tables.
select 'primary keys' as check, conrelid::regclass::text as table,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where contype = 'p'
  and connamespace = 'public'::regnamespace
  and conrelid::regclass::text in ('solved','attempts','bookmarks','progress_reset')
order by 2;

-- 5. TRIGGER + FUNCTIONS ------------------------------------------------------
select 'trigger' as check,
       case when count(*) = 1 then 'PASS' else 'FAIL — rate limit trigger missing' end as ok
from pg_trigger
where tgname = 'signals_rate_limit_trg' and not tgisinternal;

select 'functions' as check, f.expected,
       case when p.proname is null then 'FAIL — missing' else 'PASS' end as ok
from (values ('signals_rate_limit'),('apply_retention')) as f(expected)
left join pg_proc p on p.proname = f.expected and p.pronamespace = 'public'::regnamespace
order by 2;

-- 5b. apply_retention must NOT be callable by anon or authenticated. It is
-- security definer, so a stray grant would let any signed-in student purge the
-- analytics table.
select 'retention grants' as check,
       case when count(*) = 0 then 'PASS — not executable by anon/authenticated'
            else 'FAIL — ' || string_agg(grantee, ', ') end as ok
from information_schema.routine_privileges
where routine_schema = 'public' and routine_name = 'apply_retention'
  and grantee in ('anon','authenticated','PUBLIC');

-- 6. CASCADE ------------------------------------------------------------------
-- Deleting an account must remove the student's data. This is also what makes
-- "attempts kept indefinitely" an acceptable retention policy.
select 'cascade on auth.users' as check,
       conrelid::regclass::text as table,
       case when confdeltype = 'c' then 'PASS' else 'FAIL — no ON DELETE CASCADE' end as ok
from pg_constraint
where contype = 'f'
  and confrelid = 'auth.users'::regclass
  and connamespace = 'public'::regnamespace
order by 2;

-- 7. MIGRATION HISTORY --------------------------------------------------------
-- The reproducibility check: the objects existing is not the same as the chain
-- being recorded. An empty history here means the schema was applied by hand
-- and cannot be rebuilt from git.
select 'migration history' as check, version, name
from supabase_migrations.schema_migrations
order by version;
