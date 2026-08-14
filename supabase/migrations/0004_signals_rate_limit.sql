-- 0004 — rate-limit the signals endpoint (revamp.md S4)
--
-- THE PROBLEM. `signals` accepts inserts from `anon` so that signed-out
-- readers can be measured at all (0003). The publishable key is in the JS
-- bundle, so anyone who opens devtools can POST rows in a loop: junk analytics
-- and a burned row quota. Nothing is *readable* — there is still no select
-- policy — so this is a spam problem, not a disclosure one.
--
-- WHY THIS AND NOT A NETLIFY FUNCTION. The function was the plan of record,
-- but on its own it fixes nothing: the anon key has to stay in the bundle for
-- auth and progress sync, so the attacker just keeps posting straight to
-- PostgREST and ignores the function. Making it work means ALSO revoking anon
-- insert here and giving the function a service_role key — a new secret, a new
-- runtime, and a client rewrite, for a site with no abuse yet. This caps the
-- damage today with no new moving parts. If real abuse arrives, the function
-- goes in front and this stays underneath it.
--
-- PRIVACY. signals deliberately carries no user id, no cookie and no
-- fingerprint (see the header of src/signals.ts), and an IP address would
-- break that. So the IP never lands in `signals` and is never stored in the
-- clear anywhere: the budget table below holds a SALTED HASH bucketed by the
-- minute, and rows older than an hour are swept on write. It is a counter, not
-- a log — you cannot ask it what any address did.

create table if not exists public.signal_budget (
  -- sha256(ip || salt), never the address itself
  ip_hash text not null,
  minute  timestamptz not null,
  n       integer not null default 0,
  primary key (ip_hash, minute)
);

alter table public.signal_budget enable row level security;
-- No policy at all: the trigger below is SECURITY DEFINER and bypasses RLS,
-- and nothing else should ever touch this table through the API.

/**
 * Per-IP insert budget, enforced before the row lands.
 *
 * The limit is deliberately generous. A real reader generates a handful of
 * rows per page — a `view` on leaving a topic, a `quiz` row per bank, the
 * occasional `explain` — and signals.ts BATCHES them, so even fast clicking
 * through a module is a few requests carrying a few rows each. 240 rows/minute
 * is far above any human and far below a useful flood.
 *
 * `x-forwarded-for` is the client address as Supabase's edge saw it; the first
 * entry is the original client. It is trivially spoofable in principle, but
 * spoofing it is indistinguishable from having many addresses, which no
 * cheap mechanism stops anyway. The point is to make casual abuse cost
 * something, not to be unbeatable.
 *
 * ponytail: fixed salt in the function body rather than a secret store. It is
 * server-side only and never leaves Postgres; if the DB is dumped the salt
 * goes with it, but so does the budget table, which holds nothing but counts.
 */
create or replace function public.signals_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  addr    text;
  bucket  timestamptz := date_trunc('minute', now());
  hashed  text;
  used    integer;
  limit_n constant integer := 240;
begin
  addr := coalesce(
    nullif(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1), ''),
    'unknown');
  -- md5, not pgcrypto's digest(). Supabase installs pgcrypto into the
  -- `extensions` schema, so `digest()` does not resolve under this function's
  -- pinned search_path and the trigger would throw on EVERY insert — silently,
  -- because signals.ts swallows failures. md5 is core Postgres with no
  -- extension and no search_path footgun. It buys nothing less here either:
  -- whoever can read signal_budget can read this salt too, and IPv4 is
  -- enumerable against any hash. The hash exists so the table is not a log of
  -- addresses, not to withstand an attacker who already has the database.
  hashed := md5(addr || 'chemprep-signal-budget-v1');

  insert into public.signal_budget (ip_hash, minute, n)
       values (hashed, bucket, 1)
  on conflict (ip_hash, minute)
    do update set n = public.signal_budget.n + 1
    returning n into used;

  if used > limit_n then
    -- 'PT429' is PostgREST's escape hatch: SQLSTATE PTxyz sets the HTTP status
    -- to xyz, so this surfaces as a real 429 rather than a 500. Verified: with
    -- 53400 the live endpoint returned 500, which would read as breakage in
    -- the Supabase logs rather than as a limit doing its job.
    -- signals.ts swallows every failure regardless, so a throttled reader sees
    -- nothing — instrumentation must never surface an error mid-question.
    raise exception 'signal rate limit exceeded' using errcode = 'PT429';
  end if;

  -- Opportunistic sweep, ~1 insert in 500. The budget table is a counter with
  -- an hour of usefulness; a scheduled job for this would be more machinery
  -- than the thing it maintains.
  if random() < 0.002 then
    delete from public.signal_budget where minute < now() - interval '1 hour';
  end if;

  return new;
end;
$$;

drop trigger if exists signals_rate_limit_trg on public.signals;
create trigger signals_rate_limit_trg
  before insert on public.signals
  for each row execute function public.signals_rate_limit();

-- Manual sweep, if the opportunistic one ever falls behind:
--   delete from public.signal_budget where minute < now() - interval '1 hour';
--
-- The only DROP here is `drop trigger if exists` on the line above, which
-- exists so this file can be re-run. It removes nothing but its own trigger.
