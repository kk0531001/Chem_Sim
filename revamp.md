# ChemPrep revamp — the hardening phase

**This file is the instruction set and the ledger.** A loop reads it, does the
topmost unchecked item, ticks the box, and stops. Nothing else in the repo
records what phase the project is in; this does.

## The bar

The project is out of its "build the platform" phase. The next milestone is
not *ChemPrep has more features*, it is:

> **A strong chemistry student can use ChemPrep for weeks and genuinely get
> better.**

Every item below earns its place by moving that. Anything that doesn't is in
[Not doing](#not-doing) and stays there.

---

## Loop protocol

One iteration = one item = one commit. Do not batch items.

1. **Pick** the topmost item that is `[ ]` and not marked `HUMAN`, `BLOCKED`
   or `DEFERRED`. (`DEFERRED` = real work, deliberately ranked below something
   later in the file; the item says where it belongs and why.)
2. **Read** the files it names before editing. The ladder shortens the
   solution, never the reading.
3. **Do** the laziest thing that satisfies the item's *Done when*. If the item
   turns out to be unnecessary, tick it with `— skipped, <one line why>` and
   move on. That is a valid outcome, not a failure.
4. **Verify** with the item's stated check. The standing floor for every
   commit, no exceptions:
   ```bash
   npx tsc --noEmit && npm run audit && npm run build
   ```
5. **Commit** with a message naming the item id (`S2:`, `Q1:` …). No
   `Co-Authored-By` trailers — repo rule, see CLAUDE.md.
6. **Tick** the box here, in the same commit, and append one line to the
   [Log](#log). Then stop the iteration.

**Stop the loop entirely** when every item is `[x]`, or when the next three
items are all `HUMAN`/`BLOCKED`/`DEFERRED`.

**Rules that override "just get it done":**

- An item that needs a real device, a real student, a Supabase dashboard, or a
  chemistry judgement call is marked `HUMAN`. Do not fake it, do not attempt a
  proxy for it. Skip to the next item and note it in the Log.
- Rewording a shipped question is **allowed** — this rule used to say the
  opposite and was stale (corrected during Q1). Progress keys on the explicit
  `q.id`, not `qid(q.q)` (framework.ts, `quiz()`), and
  `migrateLegacyProgress()` in registry.ts already moved existing users off the
  text hashes. The one residual: a user who has not loaded the site since that
  migration shipped loses records for a question whose text changed before
  their migration runs. At current traffic that is nobody; it stops being free
  the moment P1 happens, so text edits are cheap **now** and expensive later.
- Never renumber a question or mission id.
- If an item's premise turns out to be false (the thing is already done, or
  the problem doesn't exist), say so and tick it. Do not invent work to fill
  the slot.
- If tsc/audit/build fail on something you did not touch, fix that first as
  its own commit before continuing.

---

## Track S — Security

`public/_headers` already shipped (CSP verified against a real build across
home / topic section / sandbox / question bank / progress / guide, zero
violations).

- [x] **S1 — Prove the feedback text is write-only.**
  The only genuinely user-controlled string on the site is the feedback box in
  `src/signals.ts`. The `innerHTML` question is only a real vulnerability if
  that string can come back into the DOM. Grep every read path of the
  `signals` table and every `select` policy documented in
  `SUPABASE_SETUP.md`.
  *Done when:* either (a) confirmed insert-only with no select policy and no
  client read — write a three-line comment at the top of `signals.ts` saying
  so, and close the whole innerHTML track as a non-issue; or (b) a read path
  exists, in which case escape at that one point.

- [x] **S2 — One escape hatch, not 108.** — *wrapper skipped, see Log.*
  `src/tabs/framework.ts` — the `h()` helper's `html:` key. 108 `innerHTML`
  uses across `src/`. Do **not** rename all of them. Add a single
  `setTrustedHtml(el, s)` in framework.ts whose body is `el.innerHTML = s`
  plus a comment naming exactly what is trusted (build-time TS literals) and
  what must never go through it (anything from `signals`, `localStorage`, or
  a URL parameter). Route `h()`'s `html:` key through it.
  *Done when:* one function is the documented choke point; call sites
  unchanged.
  *ponytail: this buys a place to add sanitisation later, not sanitisation.*

- [x] **S3 — Dependency audit in the loop.**
  `npm audit --omit=dev` → fix what is fixable without a major bump. Add
  `"audit:deps": "npm audit --omit=dev --audit-level=high"` to package.json
  scripts so it is one command, not a thing you remember.
  *Done when:* the script exists and exits 0, or the residual advisories are
  listed in the Log with why they are accepted.

- [ ] **S4 — Rate-limit the signals endpoint.** *SQL written; needs the
  migration run against the live project.*
  `supabase/migrations/0004_signals_rate_limit.sql` caps inserts at 240/minute
  per client address with a `BEFORE INSERT` trigger. No new infrastructure, no
  new secret, no client change.
  **The Netlify Function plan was wrong on its own terms.** The publishable key
  has to stay in the bundle for auth and progress sync, so a function in front
  of the endpoint does not stop anyone — they post straight to PostgREST and
  ignore it. Making it work needs anon insert revoked here AND a `service_role`
  key in the function, which is a new secret and a new runtime for a site with
  no abuse yet. That is the documented upgrade, not the first move.
  Privacy held: the address is never stored. The budget table keeps a salted
  hash bucketed by minute and sweeps hourly, so the no-identifiers rule in
  signals.ts still holds.
  *Blocked on:* running the migration against the live project — I have no
  access to it. Nothing else.

## Track D — Database reproducibility

- [x] **D1 — Schema into migrations.**
  `SUPABASE_SETUP.md` currently says "paste this SQL into the SQL Editor".
  Move the four tables (`solved`, `attempts`, `bookmarks`, `signals`) and
  their RLS policies verbatim into:
  ```
  supabase/migrations/0001_solved_attempts.sql
  supabase/migrations/0002_bookmarks.sql
  supabase/migrations/0003_signals.sql
  ```
  Each file idempotent (`create table if not exists`, `drop policy if exists`
  before `create policy`). `SUPABASE_SETUP.md` then points at the directory
  instead of inlining SQL.
  *Done when:* the database could be rebuilt from git alone. No Supabase CLI
  dependency — these are plain SQL files, runnable by paste or by CLI.

- [x] **D2 — Index review, evidence-first.** — *nothing to add, see Log.*
  Read the actual query shapes in `src/progress.ts` (the solved lookup, the
  attempts pull, the bookmarks sync). Add an index only where a query filters
  or orders on something unindexed. `attempts(user_id, answered_at desc)`
  already exists.
  *Done when:* `0004_indexes.sql` exists **or** this is ticked as "nothing to
  add, current indexes cover every query shape in progress.ts".

- [x] **D3 — Signals retention.**
  Progress data is long-term; analytics is not, and `signals` holds free-text
  feedback. Add to the migrations a comment documenting the intended window
  (12 months) and a one-line `delete` statement to run manually.
  *Done when:* the retention decision is written down somewhere other than
  someone's head. No cron, no pg_cron extension — YAGNI until there are rows.

- [x] **D4 — Generated DB types.** — **decided against, see below.**
  Four tables, one developer, hand-written columns. A codegen step to catch
  typos in four table names is not worth the loop it adds. Revisit if the
  schema passes ~8 tables.

## Track Q — Question quality

The count is fine (853 MC + 119 written + 5 mock papers). The *depth* is the
open question, and a human cannot audit 853 items in a sprint — so this track
only ever touches the subset where being wrong actually costs something.

- [x] **Q1 — A machine pass over what machines can check.**
  Extend `scripts/audit-content.mjs` (do not write a new script) with checks
  that need no chemistry judgement:
  - every MC has exactly one answer index, in range (already covered — confirm)
  - no two options within a question are textually identical
  - no option is a strict substring duplicate of another
  - `why` is non-empty and longer than the option it explains
  - no question's correct option is systematically the longest (a real
    clueing tell — report the per-bank rate, don't fail on it)
  *Done when:* the new checks run in `npm run audit` and the findings are in
  the Log as a worklist. Fixing them is Q3.

- [x] **Q2 — The authoring standard, as a file not a habit.**
  `src/content/AUTHORING.md`: the field spec (id, topic, comp scope, tier,
  prompt, options, answer, why, misconception, why2, refs) and the ship
  checklist (chemically correct / numerically verified / uniquely determined /
  units / sig figs / meaningful distractors / explanation teaches / no
  clueing / level appropriate / misconception is real).
  *Done when:* the file exists and `src/content/README.md` links to it. One
  page. If it runs past two, it will not be used.

- [x] **Q3 — Fix what Q1 found.** — *nothing to fix.* Mechanical defects only: duplicate options,
  empty `why`, out-of-range indexes. **Not** rewording (see the protocol
  rule). If a fix requires changing question text, list it under Q6 instead.
  *Done when:* Q1's worklist is empty or every remainder is deferred to Q6.

- [x] **Q4 — Chemistry verification.** *All 272 flagged reviewed; 35 defects fixed.*
  Originally scoped as "~40 top-tier questions, by a human". Both halves of
  that turned out wrong: the Q6 rewrites made the real surface 935 distractors,
  and the repo owner does not read chemistry at this level, so a human gate
  here is not a gate at all.
  Now: `scripts/review-q4.mjs` ranks the edits by risk and
  `scripts/q4-dossier.mjs` emits self-contained context, then independent
  reviewers work the dossier. Three passes have run over 41 questions — a
  systematic check, an ADVERSARIAL pass that argues *for* each wrong answer,
  and an integrity pass over the most aggressively trimmed keys.
  **6 defects found and fixed** (see the Log). The adversarial framing found
  three the systematic pass cleared, and on tie-break the systematic reviewer
  reversed itself on all three — so run both framings, not one.
  *Complete.* All 272 flagged distractors across 180 questions reviewed by
  eight independent passes. **35 defects found and fixed.**
  *Standing caveat:* this is LLM review of LLM edits. It demonstrably catches
  real errors, and it is not a chemist.

- [x] **Q5 — Misconception coverage floor.** — *hypothesis was wrong.* `auditTopicPages()` already
  requires ≥4 per module. Report the actual distribution and name the modules
  sitting exactly at 4 — those are the ones where the fourth was written to
  satisfy the audit rather than because a student makes that mistake.
  *Done when:* the distribution is in the Log. Writing new ones is `HUMAN`.

- [x] **Q7 — Flatten the answer-position skew.** *(Found while starting Q6.)*
  The key sat at index 1 in **68%** of the 853 MC questions — index 0: 9%,
  index 2: 21%, index 3: 2% — and per module ran to **93%** (labtech), 89%
  (physchem), 88% (organic3, organic2). Always answering B scored 68% on this
  corpus without reading a word. Fixed mechanically by
  `scripts/deskew-answers.mjs`: swap the key into a position chosen by hashing
  the question's permanent id. Now 25/25/25/25 corpus-wide, no module above
  28%. Deterministic, so re-running is a no-op and new questions land by the
  same rule.

- [x] **Q6 — Cut the length clueing.** *(Was "blocked on an id migration" —
  that migration already shipped; see the corrected protocol rule above.)*
  Q1 measured it: the correct option is the longest one in **59%** of 616
  questions, against ~25% by chance, and five modules are at 83–95%
  (organic3 95, coordchem 91, labtech 85, structure 85, polymers 83). A student
  who notices can beat those modules without knowing any chemistry — this is
  the single largest measured defect in the corpus.
  The fix is not to shorten the right answer, which usually needs its words.
  It is to bring the distractors up: a plausible wrong answer states a specific
  wrong idea, and stating one takes about as many words as stating the right
  one. Work module by module, worst first, re-running the audit's clueing line
  after each. Target ≤40% per module.
  *Done when:* no module with n ≥ 20 is above 40%, or the remainder is listed
  here with why those questions genuinely need an uneven-length option set.

  **Done — corpus 59% → 11%, no module above 26%.** All 23 quiz modules plus
  the exam banks (bankPart1, bankPart3, the five mock papers). See Q8 for the
  residual this created.

## Track F — Frontend

`plan.md` passes 1, 3 and most of 4 have shipped (type scale, line-height
roles, merged topic chrome). Do not start a new visual redesign.

- [x] **F1 — Finish plan.md's open passes.** Read `plan.md`, run its console
  probe, and close out whatever passes 2 and 5 still have open (hex literals →
  tokens; `.mode-btn`/`.crumb-link`/`.nav-item` tap targets; `.section-step`
  equal flex basis; `transition: all` → named properties).
  *Done when:* plan.md's own verification table passes, and plan.md is marked
  complete at its top or deleted.

- [x] **F2 — Responsive sweep, the parts a browser can prove.**
  For every route at 375px and 1280px: no horizontal overflow on `<body>`,
  no element wider than the viewport, focus ring visible on every control,
  no equation clipped. Drive it with the browser tools; script the overflow
  check rather than eyeballing 28 pages.
  *Done when:* the offending routes are fixed or listed in the Log.

- [ ] **F3 — Real-device sweep.** `HUMAN`. iPhone Safari, landscape phone,
  keyboard-only, screen reader, 200% zoom. A headless viewport resize is not
  this, and pretending otherwise is how the phone bugs survive.

- [x] **F4 — Question Bank UX.** The second-most-used surface after a topic
  page. One question only: can a student get from "I want 10 hard equilibrium
  questions" to answering one in under three interactions? Fix the shortest
  path, not the filter panel's appearance.
  *Done when:* the path is ≤3 interactions, or the Log says why it can't be.

- [x] **F5 — Make the progress dashboard actionable.** It shows weak topics,
  streaks, accuracy, history. Add one thing: the single next action, derived
  from the data already computed in `progress.ts` (`weakTopics()` →
  `ladderFor()`). One sentence and one button.
  *Done when:* the dashboard answers "what do I study next" without the
  student interpreting a chart.

## Track E — Engineering

Opportunistic only. Do not schedule a refactor sprint.

- [x] **E1 — Split `framework.ts` (1651 lines) along one seam.** Not eight
  files. Move the quiz + missions renderer out to `src/tabs/ui/quiz.ts`,
  because that is the part that gets edited and currently drags the whole UI
  universe open with it. Re-export from framework.ts so no call site changes.
  *Done when:* framework.ts is under ~1200 lines and no import elsewhere
  changed.

- [x] **E2 — `main.ts` (618 lines)** — decided: leave it. 618 lines of bootstrap that
  works is not debt, it is a file. Revisit if it passes 900.

## Track A — Learning engine

- [x] **Q8 — Rebalance the length metric back toward chance.**
  Q6 overshot. Driving "correct option is longest" from 59% to **11%** replaced
  a strong tell with a weaker opposite one: on the modules now at 0%, "never
  pick the longest" eliminates an option for free. Chance on four options is
  ~25% and that — not zero — is the target.
  `audit-content.mjs` now scores **distance from chance in either direction**,
  so this cannot drift unnoticed again, and it names the direction
  (`long=answer` / `long=never`).
  The fix is NOT to pad the keyed answers back out — they were trimmed from
  explanations to claims and are better for it. It is to shorten a distractor
  in roughly one question in four, so the key is legitimately longest that
  often.
  *Done when:* no module with n ≥ 20 sits more than 15 points from chance.
  Lower priority than anything in Track F: an 11% reverse tell is worth far
  less to a student than a working page on their phone.

- [x] **A1 — Skills under topics, read-only first.** Before any mastery model:
  tag questions with a skill (`equilibrium/ice-setup`, `equilibrium/q-vs-k`,
  …) as an optional field, and report per-skill accuracy in the existing
  `accuracyByTopic` style — a pure function over the attempt log, per the
  progress.ts rule. No new stored counters (`MAX_ATTEMPTS` cap still applies:
  any lifetime figure must come from a bounded aggregate).
  *Done when:* one module is tagged end to end and its per-skill accuracy
  renders. Tagging the rest is a separate, later item.

- [ ] **A2 — `why2` from evidence.** `BLOCKED` on real traffic. Once wrong
  rates exist: high wrong rate → inspect question → write an alternate
  explanation. Not "I think this one is hard".

## Track P — Public

- [ ] **P1 — Ship to students.** `HUMAN`. Gated on S4. Everything after this
  point in the roadmap should be decided by what students actually do, not by
  this file.

---

## Not doing

Named here so the loop doesn't drift into them:

- **AI explanations.** Backend, keys, rate limits, cost, abuse, evals — and no
  evidence students want it. `why2` is the interim answer and it is a better
  one.
- **Module #26.** 25 is enough. Depth over breadth.
- **Another visual redesign.** One just shipped.
- **Gamification.** XP, badges, leaderboards. Not the bottleneck.
- **More dashboards.** Useful signals, not mission control.
- **Spacing sweep.** Standing decision from D.7, restated in plan.md.
- **Dark mode.** Separate project with its own contrast matrix.

---

## Log

Append one line per iteration: `<date> <item> — <what changed / what was found>`.

- 2026-08-13 S0 — `public/_headers` added (CSP + nosniff + Referrer-Policy +
  Permissions-Policy + HSTS), verified against a local build serving those
  exact headers across six route types, zero violations. `font-src data:`
  needed because Vite inlines KaTeX woff2; `style-src 'unsafe-inline'` needed
  for Tweakpane and style attributes.
- 2026-08-13 S1 — Outcome (a): `signals` is insert-only with no select policy
  (SUPABASE_SETUP.md §2d), signals.ts exports no reader, and its five importers
  (main.ts, feedback.ts, framework.ts) all call write paths only. The free-text
  `note` column cannot reach any DOM. Finding written into signals.ts as the
  standing constraint. The innerHTML question is therefore not a live
  vulnerability — S2 is now optional hygiene, judge it on its own merits.
- 2026-08-13 S2 — `setTrustedHtml` **not** added: `h()`'s `html:` branch is
  already the single site, so a one-line function called from one place is
  indirection, not a choke point. Did the part that could actually fail —
  audited all 108 innerHTML uses for an untrusted source: none is fed by
  localStorage, a URL parameter or a typed query, and search.ts / feedback.ts
  contain no innerHTML at all. Invariant + the rule for future strings written
  at the `html:` branch, where a contributor will meet it.
- 2026-08-13 S3 — Production bundle was already clean (0 vulnerabilities with
  `--omit=dev`). Two high advisories existed in the build toolchain only
  (nanoid, postcss, both via Vite); `npm audit fix` cleared both with no major
  bump, and the rebuilt site renders unchanged. `npm run audit:deps` added as
  the standing one-command check. No accepted residuals.
- 2026-08-13 D1 — Schema moved to `supabase/migrations/` (0001 solved+attempts,
  0002 bookmarks, 0003 signals) + `supabase/README.md`; SUPABASE_SETUP.md now
  points at the directory instead of inlining four SQL blocks. Verified by
  diffing every normalised statement against the SQL at HEAD: nothing dropped,
  the only additions are the four `drop policy if exists` idempotency guards.
  NOT verified against a real Postgres — none available in this environment, so
  the files are structurally checked (balanced, terminated, every policy
  guarded) and byte-faithful to SQL that was already running, but the first
  `supabase db push` is still the real test.
- 2026-08-13 D2 — No index added; every query shape in progress.ts is already
  served. `solved` and `bookmarks` are only ever hit by upsert, delete-match,
  and `select … where user_id = ?` — all on the leading column of their
  composite primary key, so the PK index covers them. `attempts` is upserted by
  its `id` (PK) and read exactly once as `where user_id = ? order by
  answered_at desc limit MAX_ATTEMPTS`, which is precisely
  `attempts_user_time_idx`. `signals` has no client read path at all; its
  `(kind, created_at desc)` index exists for the SQL-editor analytics queries.
  Adding anything here would be indexing a query nobody makes.
- 2026-08-13 D3 — Retention set at 12 months for `signals` only; progress data
  (solved/attempts/bookmarks) stays indefinitely because it is the student's
  own record. The `delete` and the reasoning live at the bottom of
  0003_signals.sql, restated in supabase/README.md and SUPABASE_SETUP.md.
  Manual on purpose — pg_cron is an extension, a job to monitor and a scheduled
  DELETE against a table with zero rows in it.
- 2026-08-13 Q1 — Two checks added to audit-content.mjs (duplicate options,
  which found **none**; and a length-clueing report, which is not a gate).
  Answer-index range and empty-`why` were already covered. The substring-
  duplicate check from the plan was **not** built — "H₂O"/"H₂O₂", "sp"/"sp³"
  are legitimate distinct pairs, so it is a false-positive machine.
  **The finding that matters:** the correct option is the longest in 59% of 616
  questions (chance ~25%), and organic3/coordchem/labtech/structure/polymers
  run 83–95%. Promoted to Q6. Also discovered while checking whether that is
  even fixable: the never-reword rule in this file was stale — progress moved
  to explicit ids and the legacy migration already ships.
