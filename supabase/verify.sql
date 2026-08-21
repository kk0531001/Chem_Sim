-- Post-migration verification — ONE query, so the SQL editor shows every check.
--
--   Supabase SQL editor → New query → paste → Run.
--   Read the `ok` column. Everything should say PASS.
--
-- Run it after `supabase db push`. Reads catalogues only, writes nothing, safe
-- to re-run.
--
-- Why this exists: `npm run audit` proves the CLIENT behaves. Nothing in it can
-- see whether the server actually has the table, the policy or the index the
-- client assumes — which is exactly how migration 0005 sat unapplied while
-- every local test passed.
--
-- It is deliberately a single UNION ALL rather than ten statements: the editor
-- only displays the result of the last statement in a script, so ten queries
-- means nine invisible answers.

with
tables_expected(name) as (
  values ('solved'),('attempts'),('bookmarks'),('progress_reset'),('signals'),('signal_budget')
),
funcs_expected(name) as (values ('signals_rate_limit'),('apply_retention')),
idx_expected(name)   as (values ('attempts_user_time_idx'),('signals_kind_time_idx'))

-- 1. every table exists
select 1 as ord, 'table' as check, t.name as detail,
       case when c.relname is null then 'FAIL — missing' else 'PASS' end as ok
from tables_expected t
left join pg_class c on c.relname = t.name
     and c.relnamespace = 'public'::regnamespace and c.relkind = 'r'

union all
-- 2. RLS is genuinely ENABLED. A policy on a table without RLS is decoration:
--    Postgres ignores it and the table is world-readable.
select 2, 'rls enabled', c.relname,
       case when c.relrowsecurity then 'PASS' else 'FAIL — RLS IS OFF' end
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
  and c.relname in (select name from tables_expected)

union all
-- 3. each user-owned table has its per-user policy
select 3, 'per-user policy', t.name,
       case when count(p.policyname) > 0 then 'PASS (' || count(p.policyname) || ')'
            else 'FAIL — no policy' end
from (values ('solved'),('attempts'),('bookmarks'),('progress_reset')) as t(name)
left join pg_policies p on p.schemaname = 'public' and p.tablename = t.name
group by t.name

union all
-- 4. no policy is unconditionally permissive on a user-owned table
select 4, 'no using(true)', tablename || '.' || policyname,
       case when qual = 'true' then 'FAIL — exposes every user''s rows' else 'PASS' end
from pg_policies
where schemaname = 'public'
  and tablename in ('solved','attempts','bookmarks','progress_reset')

union all
-- 5. signals must have NO readable policy — that absence is load-bearing, it
--    is what stops the free-text feedback column being read through the API
select 5, 'signals not readable', 'select/all policies on signals',
       case when count(*) = 0 then 'PASS — insert-only, as designed'
            else 'FAIL — feedback text is readable' end
from pg_policies
where schemaname = 'public' and tablename = 'signals' and cmd in ('SELECT','ALL')

union all
-- 6. indexes the client's queries depend on
select 6, 'index', i.name,
       case when x.indexname is null then 'FAIL — missing' else 'PASS' end
from idx_expected i
left join pg_indexes x on x.indexname = i.name and x.schemaname = 'public'

union all
-- 7. rate-limit trigger
select 7, 'trigger', 'signals_rate_limit_trg',
       case when count(*) = 1 then 'PASS' else 'FAIL — missing' end
from pg_trigger where tgname = 'signals_rate_limit_trg' and not tgisinternal

union all
-- 8. functions
select 8, 'function', f.name,
       case when p.proname is null then 'FAIL — missing' else 'PASS' end
from funcs_expected f
left join pg_proc p on p.proname = f.name and p.pronamespace = 'public'::regnamespace

union all
-- 9. apply_retention is security definer, so a stray grant would let any
--    signed-in student purge the analytics table
select 9, 'retention locked down', 'execute on apply_retention',
       case when count(*) = 0 then 'PASS — anon/authenticated cannot call it'
            else 'FAIL — granted to ' || string_agg(grantee, ', ') end
from information_schema.routine_privileges
where routine_schema = 'public' and routine_name = 'apply_retention'
  and grantee in ('anon','authenticated','PUBLIC')

union all
-- 10. deleting an account removes the student's data. This is also what makes
--     "attempts kept indefinitely" an acceptable retention policy.
select 10, 'cascade to auth.users', conrelid::regclass::text,
       case when confdeltype = 'c' then 'PASS' else 'FAIL — no ON DELETE CASCADE' end
from pg_constraint
where contype = 'f' and confrelid = 'auth.users'::regclass
  and connamespace = 'public'::regnamespace

union all
-- 11. the reproducibility check. Objects existing is NOT the same as the chain
--     being recorded: an empty history means the schema cannot be rebuilt from
--     git, however well the app happens to work.
select 11, 'migration history', 'recorded migrations',
       case when count(*) >= 6 then 'PASS — ' || count(*) || ' recorded'
            when count(*) = 0 then 'FAIL — EMPTY, schema is untracked'
            else 'FAIL — only ' || count(*) || ' of 6' end
from supabase_migrations.schema_migrations

order by ord, detail;
