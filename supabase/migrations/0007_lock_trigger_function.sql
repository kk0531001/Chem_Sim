-- Lock down the rate-limit trigger function.
--
-- Found by the Supabase security advisor: `signals_rate_limit()` is SECURITY
-- DEFINER and lives in the exposed `public` schema, so PostgREST advertised it
-- at /rest/v1/rpc/signals_rate_limit and both `anon` and `authenticated` had
-- EXECUTE on it — inherited from PUBLIC, which is the default for every new
-- function.
--
-- Exploitability is low: it returns `trigger`, and Postgres refuses to run a
-- trigger function outside a trigger context. But "low" is not "none", it is
-- SECURITY DEFINER so it runs as the owner, and a function nothing should ever
-- call directly has no business being in the API surface at all.
--
-- 0006 got this right for apply_retention() and 0004 never did it for this one.
-- Same treatment, so a database rebuilt from this chain is not missing it.

revoke all on function public.signals_rate_limit() from public;
revoke all on function public.signals_rate_limit() from anon, authenticated;
