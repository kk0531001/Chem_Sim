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

1. **Pick** the topmost item that is `[ ]` and not marked `HUMAN` or `BLOCKED`.
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
items are all `HUMAN`/`BLOCKED`.

**Rules that override "just get it done":**

- An item that needs a real device, a real student, a Supabase dashboard, or a
  chemistry judgement call is marked `HUMAN`. Do not fake it, do not attempt a
  proxy for it. Skip to the next item and note it in the Log.
- Never reword a shipped question. Editing text changes `qid()` and orphans a
  student's progress (CLAUDE.md, progress.ts). Fixing a *wrong answer* is the
  one exception and it goes in the Log explicitly.
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

- [ ] **S4 — Rate-limit the signals endpoint.** `HUMAN` (needs a Netlify
  Functions decision and a deploy).
  Today: browser → Supabase PostgREST with the publishable key. Anyone can
  spam rows. The target is browser → Netlify Function → validate + rate-limit
  → Supabase. Not urgent at zero traffic; **required before any public push**
  (see D1). Leave this unchecked as a standing gate.

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

- [ ] **D2 — Index review, evidence-first.**
  Read the actual query shapes in `src/progress.ts` (the solved lookup, the
  attempts pull, the bookmarks sync). Add an index only where a query filters
  or orders on something unindexed. `attempts(user_id, answered_at desc)`
  already exists.
  *Done when:* `0004_indexes.sql` exists **or** this is ticked as "nothing to
  add, current indexes cover every query shape in progress.ts".

- [ ] **D3 — Signals retention.**
  Progress data is long-term; analytics is not, and `signals` holds free-text
  feedback. Add to the migrations a comment documenting the intended window
  (12 months) and a one-line `delete` statement to run manually.
  *Done when:* the retention decision is written down somewhere other than
  someone's head. No cron, no pg_cron extension — YAGNI until there are rows.

- [ ] **D4 — Generated DB types.** — **deliberately skipped.**
  Four tables, one developer, hand-written columns. A codegen step to catch
  typos in four table names is not worth the loop it adds. Revisit if the
  schema passes ~8 tables.

## Track Q — Question quality

The count is fine (853 MC + 119 written + 5 mock papers). The *depth* is the
open question, and a human cannot audit 853 items in a sprint — so this track
only ever touches the subset where being wrong actually costs something.

- [ ] **Q1 — A machine pass over what machines can check.**
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

- [ ] **Q2 — The authoring standard, as a file not a habit.**
  `src/content/AUTHORING.md`: the field spec (id, topic, comp scope, tier,
  prompt, options, answer, why, misconception, why2, refs) and the ship
  checklist (chemically correct / numerically verified / uniquely determined /
  units / sig figs / meaningful distractors / explanation teaches / no
  clueing / level appropriate / misconception is real).
  *Done when:* the file exists and `src/content/README.md` links to it. One
  page. If it runs past two, it will not be used.

- [ ] **Q3 — Fix what Q1 found.** Mechanical defects only: duplicate options,
  empty `why`, out-of-range indexes. **Not** rewording (see the protocol
  rule). If a fix requires changing question text, list it under Q6 instead.
  *Done when:* Q1's worklist is empty or every remainder is deferred to Q6.

- [ ] **Q4 — Gold/Platinum depth pass.** `HUMAN` (chemistry judgement).
  Take ~40 questions at the top two tiers and check keyed answer, units, sig
  figs and the explanation against a textbook. Not 853. The rest waits for
  wrong-rate data — the same argument the roadmap already makes for `why2`,
  applied one level up.

- [ ] **Q5 — Misconception coverage floor.** `auditTopicPages()` already
  requires ≥4 per module. Report the actual distribution and name the modules
  sitting exactly at 4 — those are the ones where the fourth was written to
  satisfy the audit rather than because a student makes that mistake.
  *Done when:* the distribution is in the Log. Writing new ones is `HUMAN`.

- [ ] **Q6 — Text corrections requiring an id migration.** `BLOCKED` on the
  `remapProgressIds()` path being exercised at least once. Collect items here;
  do not edit shipped text until this is unblocked.

## Track F — Frontend

`plan.md` passes 1, 3 and most of 4 have shipped (type scale, line-height
roles, merged topic chrome). Do not start a new visual redesign.

- [ ] **F1 — Finish plan.md's open passes.** Read `plan.md`, run its console
  probe, and close out whatever passes 2 and 5 still have open (hex literals →
  tokens; `.mode-btn`/`.crumb-link`/`.nav-item` tap targets; `.section-step`
  equal flex basis; `transition: all` → named properties).
  *Done when:* plan.md's own verification table passes, and plan.md is marked
  complete at its top or deleted.

- [ ] **F2 — Responsive sweep, the parts a browser can prove.**
  For every route at 375px and 1280px: no horizontal overflow on `<body>`,
  no element wider than the viewport, focus ring visible on every control,
  no equation clipped. Drive it with the browser tools; script the overflow
  check rather than eyeballing 28 pages.
  *Done when:* the offending routes are fixed or listed in the Log.

- [ ] **F3 — Real-device sweep.** `HUMAN`. iPhone Safari, landscape phone,
  keyboard-only, screen reader, 200% zoom. A headless viewport resize is not
  this, and pretending otherwise is how the phone bugs survive.

- [ ] **F4 — Question Bank UX.** The second-most-used surface after a topic
  page. One question only: can a student get from "I want 10 hard equilibrium
  questions" to answering one in under three interactions? Fix the shortest
  path, not the filter panel's appearance.
  *Done when:* the path is ≤3 interactions, or the Log says why it can't be.

- [ ] **F5 — Make the progress dashboard actionable.** It shows weak topics,
  streaks, accuracy, history. Add one thing: the single next action, derived
  from the data already computed in `progress.ts` (`weakTopics()` →
  `ladderFor()`). One sentence and one button.
  *Done when:* the dashboard answers "what do I study next" without the
  student interpreting a chart.

## Track E — Engineering

Opportunistic only. Do not schedule a refactor sprint.

- [ ] **E1 — Split `framework.ts` (1651 lines) along one seam.** Not eight
  files. Move the quiz + missions renderer out to `src/tabs/ui/quiz.ts`,
  because that is the part that gets edited and currently drags the whole UI
  universe open with it. Re-export from framework.ts so no call site changes.
  *Done when:* framework.ts is under ~1200 lines and no import elsewhere
  changed.

- [ ] **E2 — `main.ts` (618 lines)** — leave it. 618 lines of bootstrap that
  works is not debt, it is a file. Revisit if it passes 900.

## Track A — Learning engine

- [ ] **A1 — Skills under topics, read-only first.** Before any mastery model:
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
