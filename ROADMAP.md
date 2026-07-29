# ChemPrep — Roadmap

> "You've already built the platform. Now build the learning experience."

This is the working plan. It is ordered by **impact ÷ effort**, and it deviates
from the phase numbering in the original feedback in two places — both noted
inline, both because a dependency was hiding in the ordering.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Where the project actually is today

Verified against the source, not from memory:

| Thing | State |
| --- | --- |
| Topic modules | 25 (`DEFS` in [main.ts](src/main.ts)), grouped into 8 domains |
| Quiz questions | ~590 across `questions1–7.ts` (25 per module) |
| Bank items | ~440 across `bankPart1/2/3`, `bankCCO`, `bankIntegrated`, `olympiadPaper1–5` |
| **User accounts** | **Already built** — Supabase auth (magic link + Google), RLS `solved` table, offline-first localStorage cache |
| Progress data | Binary "solved" set only. No attempt log, no timestamps, no correctness history |
| Routing | Real URLs, History API, deep-linkable topics |
| Equation rendering | KaTeX + mhchem everywhere |
| Accessibility | **0** `aria-*` or `role` attributes in `src/` |
| SEO / social | No meta description, no Open Graph tags, no favicon, no crawlable HTML |

Two corrections to the original phase plan follow from this table:

1. **Phase 4 is not "build user accounts."** Accounts, cloud sync, and RLS already
   ship. Phase 4 is really *"record richer progress data, then show it back."* That
   deletes roughly a week of planned work.
2. **Phases 4, 5, and 6 all depend on one refactor that isn't in the plan.**
   Quiz history, weak-topic tracking, recommendations, search, and competition
   modes every one of them needs questions to be *addressable entities with
   metadata*. Today a question is an anonymous object literal in one of 18 files,
   identified by a hash of its own prompt text. That refactor is Phase A below and
   it must come first.

---

## Phase 0 — This week's batch (~4 hrs total)

Small, unrelated, all worth doing before anyone else looks at the project.

### 0.1 Decide: public repo or private (5 min) — **do this first**

[CLAUDE.md](CLAUDE.md) currently contains a rule instructing that AI attribution
be kept out of commit messages. In a public repo that rule is itself the
disclosure — it simultaneously reveals that AI was used and that the trailers
were suppressed, which reads worse than either fact alone. Pick one:

- [ ] **Own it** — delete the rule, let the trailers land. Recommended: "built
      with AI assistance, here's my architecture doc" is a stronger story in 2026
      than a clean-looking log, and the `CLAUDE.md` architecture rules are
      genuinely good evidence of engineering judgment.
- [ ] **Private the repo** — keep the rule, ship the site publicly, keep the
      source closed until you decide otherwise.

Either is fine. Leaving it as-is is the only bad option.

### 0.2 Social + search metadata (20 min) — highest visibility per minute

[index.html](index.html) has a `<title>` and nothing else. Every shared link
unfurls blank, on every platform, which undercuts the one distribution channel
the project is built around (Phase 8 is entirely about sharing links).

- [ ] `<meta name="description">`
- [ ] `og:title` / `og:description` / `og:image` / `og:url` / `og:type`
- [ ] `twitter:card` = `summary_large_image`
- [ ] Favicon + apple-touch-icon in `public/` (reuse `TILE_HTML` mark from [home.ts](src/home.ts))
- [ ] A 1200×630 OG image — the flame-orange mark on the dark panel background

### 0.3 Accessibility pass (1–2 hrs)

Zero `aria` attributes today. Beyond being the right thing, it is a concrete
engineering-quality signal you can point at.

- [ ] `aria-label` on every icon-only button — `#brand`, quiz option buttons,
      sandbox controls
- [ ] `role="navigation"` + `aria-label` on `#sidenav`, `aria-current="page"` on
      the active nav item ([framework.ts](src/tabs/framework.ts) `initTabs`)
- [ ] `aria-hidden="true"` on decorative SVG; text alternatives for `<canvas>`
      figures (a `<figcaption>`-style summary of what the plot shows)
- [ ] Quiz: `role="radiogroup"` on `.quiz-opts`, `aria-live="polite"` on
      `.quiz-why` so screen readers announce the explanation
- [ ] Visible focus rings in [style.css](src/style.css) (check `:focus-visible`)
- [ ] Verify contrast on `--panel-text` against `--panel`

### 0.4 Correctness fixes (~1 hr, batch in one sitting)

These are chemistry errors in a chemistry teaching tool, which makes them worse
than ordinary bugs.

- [ ] **`|ψ|²` mislabel** — [quantum.ts:157](src/tabs/quantum.ts) titles the card
      `Hydrogen orbital viewer |ψ|² (blue = ψ>0, red = ψ<0)`. Those two halves
      contradict each other: a squared quantity has no sign. The renderer plots
      signed ψ. Retitle to `Hydrogen orbital viewer — ψ (signed amplitude)` and
      keep the colour key.
- [ ] **`3d_{x²−y²}` is drawn wrong** — [quantum.ts:19](src/tabs/quantum.ts) uses
      `psi: (x, z) => x*x*exp(-r/3)`. That is strictly non-negative, so it shows
      no nodal planes and no sign change — the exact features the orbital exists
      to teach. The real angular part is `x² − y²`, invisible in the x–z slice.
      Either render the x–y plane for this one orbital, or label it honestly as
      an out-of-plane slice.
- [ ] **Ksp common-ion blows up at low concentration** —
      [equilibrium.ts:127](src/tabs/equilibrium.ts) computes
      `sCommon = (Ksp / C^n)^(1/m) / m`, which ignores the salt's own
      contribution. For PbCl₂ (Ksp 1.7×10⁻⁵) with [Cl⁻] = 10⁻⁴ M it reports
      s ≈ 1700 M, against a true value near the pure-water 1.6×10⁻² M. Fix by
      solving the full polynomial, or clamp to `min(s_pure, s_common)` and warn
      when `C ≲ s_pure` that the approximation has left its valid regime. A
      teaching tool that silently prints 1700 M teaches the wrong instinct.
- [ ] **Magic `* 12`** — [movement.ts:37–58](src/movement.ts) has an unexplained
      factor of 12 in four force accumulations. Name it (`const FORCE_SCALE = 12`)
      with a one-line comment on where it came from.

### 0.5 Note the `innerHTML` policy (0 min now, saves you later)

103 `innerHTML` assignments across `src/`. Every one is author-written content
today, so there is no live vulnerability. The moment Phase 8 adds a feedback
form, a comment, or any user-supplied string that reaches the DOM, it becomes
one. Write the rule into `CLAUDE.md` now while it costs nothing:

> Author content may use `innerHTML`. Anything originating from a user — form
> input, Supabase row, URL parameter — uses `textContent` or is sanitized.

---

## Phase A — The content model (3–5 days) · **prerequisite for Phases 4, 5, and 6**

This is the keystone. Everything downstream is cheap once it exists and
expensive-to-impossible without it.

### A.1 The problem

`QuizQ` is `{ q, opts, a, why }` ([framework.ts:119](src/tabs/framework.ts)).
It carries no id, no topic, no difficulty, and no exam tag. Progress is keyed by
`qid(q.q)` — an FNV-1a hash of the prompt text ([progress.ts:33](src/progress.ts)).

Three consequences:

- **Editing a typo silently erases progress.** Change one character of a question
  and its hash changes; every user's "solved" record for it is orphaned, locally
  and in Supabase, with no error and no way to recover it.
- **Nothing can be queried.** "Show me hard equilibrium questions I got wrong" is
  unanswerable — there is no topic field on quiz questions, no difficulty field
  anywhere, and no record of wrong answers at all.
- **Nothing can be counted.** Weak-topic tracking, streaks, recommended-next, and
  competition filtering are all aggregations over data that isn't being recorded.

### A.2 The change

- [ ] Extend the type:
      ```ts
      interface QuizQ {
        id: string;        // explicit, stable, never derived from text
        q: string; opts: string[]; a: number; why: string;
        topic: TopicId;    // 'equilibrium' | 'organic' | …
        tier: 1|2|3|4;     // bronze → platinum (see Phase C)
        comps?: Comp[];    // ['ccc','usnco','cco','icho'] — Phase 6
        misconception?: string;  // Phase B.2
      }
      ```
      Make `id`/`topic`/`tier` required, `comps`/`misconception` optional, so
      `tsc --noEmit` enumerates every question still needing backfill.
- [ ] Backfill ids by script — `eq-001`, `org-047`. Deterministic, one-time,
      committed. Never regenerated.
- [ ] **Migration shim so no existing user loses progress:** keep `qid()`, build a
      one-time `legacyHash → newId` map at startup, rewrite matching localStorage
      and Supabase rows, then retire the shim after a release or two. Do this in
      the same commit as the id backfill or the window opens.
- [ ] `src/content/registry.ts` — imports every bank, exports one flat
      `ALL_QUESTIONS` array plus `byTopic()` / `byTier()` / `byComp()` indexes.
      Single source of truth, same discipline `topics.ts` already uses for modules.
- [ ] Guard against duplicate ids and out-of-range `a` at module load (a cheap
      assert catches a whole class of content bugs).

### A.3 Attempt tracking

Replace the binary solved-set with an attempt log. Everything in Phase 4 is a
read of this table.

- [ ] `attempts` table: `(user_id, question_id, correct, answered_at, chosen)`,
      same RLS pattern as `solved`. Keep `solved` as a derived view for now.
- [ ] Same offline-first shape as [progress.ts](src/progress.ts): localStorage is
      the always-on cache, Supabase syncs when signed in, absent env vars degrade
      cleanly and never crash. That contract is already right — extend it, don't
      redesign it.
- [ ] Record attempts from the click handler in `quiz()`
      ([framework.ts:152](src/tabs/framework.ts)) — one call site.
- [ ] Derived selectors, all pure functions over the log:
      `accuracyByTopic()`, `weakTopics()`, `streakDays()`, `recentHistory()`.

**Ship gate:** `tsc --noEmit` clean, and a signed-in test account's existing
progress survives the migration intact.

---

## Phase B — Make the simulations teach (2 weeks)

> "Not 'make prettier graphics.' Make them teach better."

Right now every simulation is *sliders with no goal*. A student moves a control,
watches something change, and learns nothing unless they already knew what to
look for. Missions invert that: state the goal, let them hunt for it.

### B.1 A shared mission framework (2–3 days)

Per the `CLAUDE.md` rule that shared behaviour lives in `framework.ts`, this is
one helper, not 12 bespoke implementations.

- [ ] `mission({ prompt, check, hints, onSolve })` in
      [framework.ts](src/tabs/framework.ts):
      - `prompt` — the goal, in words
      - `check(state) => boolean` — polled on the tab's existing animation tick
      - `hints` — a ladder, revealed one at a time on request (never automatically)
      - success state writes through to the same progress system as quizzes, so
        missions count toward completion
- [ ] Missions render as a strip above the sim controls, one active at a time,
      with the goal always visible while the student experiments.

### B.2 Misconception boxes (1 day)

There is already a `class="trap"` convention in the theory blocks, so this is a
content-and-CSS extension of a pattern that exists, not new infrastructure.

- [ ] `.misconception` block in [style.css](src/style.css) — visually distinct
      from `.trap` (a trap is an exam gotcha; a misconception is a *wrong mental
      model*). Per house style: inline SVG warning mark, **no emoji**.
- [ ] Optional `misconception` field on `QuizQ`, surfaced after a wrong answer.
- [ ] Write the canonical set. Starting list:
      - Pressure shifts equilibrium **position**, it does not change **K**
      - A catalyst does not change yield, only the time to reach it
      - `ΔG°` is not `ΔG` — the sign of `ΔG°` does not decide spontaneity under
        arbitrary conditions
      - Electronegativity ≠ electron affinity
      - Rate law exponents come from experiment, not stoichiometry
      - Strong ≠ concentrated
      - Entropy is not "disorder"
      - Le Chatelier's "add inert gas at constant V" → nothing happens

### B.3 Missions per simulation (1 week)

2–4 each. Concrete, checkable, chemically meaningful.

- [ ] **Gases** — "Raise T until pressure doubles at fixed V." · "Find where the
      ideal-gas line and the real-gas curve separate by 10%."
- [ ] **Equilibrium** — "Build a buffer at pH 5.0 ± 0.1." · "Shift toward
      products without touching temperature." · "Add inert gas at constant V and
      explain why nothing moved."
- [ ] **Thermo** — "Find conditions where ΔG goes negative." · "Find the
      crossover T for this ΔH/ΔS pair."
- [ ] **Kinetics / AEK** — "Determine the order from the concentration traces
      alone." · "Halve the half-life."
- [ ] **Sandbox** — "Get >80% H₂O." · "Dissociate the sample without adding
      reactants." (temperature only)
- [ ] **Quantum** — "Find every radial node in 3s." (after the 0.4 fixes land)

---

## Phase C — Question depth over question count (2–3 weeks)

> "I'd rather have 300 amazing questions than 2,000 average questions."

Important reframe: **you already have ~1,000 items.** This phase is a *curation
and upgrade* pass, not a writing sprint. The output is a smaller, better,
tiered bank — deletion is a legitimate result.

### C.1 Tier every question (uses `tier` from Phase A)

| Tier | Meaning | Example |
| --- | --- | --- |
| **Bronze** | Single concept, direct application | "Calculate the pH of 0.1 M HCl" |
| **Silver** | Two concepts combined | "pH at the half-equivalence point of a weak acid" |
| **Gold** | Three concepts, multi-step | "Given a titration curve, identify the acid and its Ka" |
| **Platinum** | Full olympiad problem | "Unknown acid + titration curve + IR — identify it and justify" |

- [ ] Tag all ~1,000 existing items
- [ ] Expect a lopsided result — most existing questions are Bronze/Silver. That
      distribution *is* the finding: the gap is Gold/Platinum.
- [ ] Delete or merge weak duplicates. Target ~300–400 excellent items.

### C.2 Write the Gold/Platinum layer

The distinguishing move: olympiads give you **evidence** and ask you to
**reason**, where most sites give you numbers and ask you to compute.

- [ ] Data-first stems — a titration curve, an IR trace, a kinetics table,
      a cooling curve, and a question about what it *means*
- [ ] Reuse `miniPlot()` from [framework.ts](src/tabs/framework.ts) for embedded
      SVG figures (the FRQ browser sets `innerHTML` and cannot run canvas `plot()`)
- [ ] Experimental-design prompts — "design a procedure to determine X"
- [ ] "Explain what's happening" prompts with rubric-style model answers
- [ ] Keep the standing rule: **all original**. Match format and difficulty of
      real CCC/CCO/USNCO papers, never reproduce them; link only.

### C.3 Challenge mode (1–2 days — nearly free once C.1 is done)

- [ ] End-of-lesson ladder: Bronze → Silver → Gold → **Olympiad Challenge**,
      pulling from the registry filtered by `topic` + `tier`
- [ ] Unlock progressively; the Platinum item is the payoff, framed as such

---

## Phase D — Progress, visible (1 week) · *originally "Phase 4"*

Accounts already exist. This is the **display layer** over Phase A's attempt log —
which is why it must come after A, and why it's one week rather than three.

- [ ] Dashboard route (`/progress`) — topics covered, accuracy, attempt count
- [ ] Per-topic mastery bars in the sidebar and on topic cards
- [ ] **Weak topics** — `accuracyByTopic()` sorted ascending, top 3 surfaced
- [ ] **Quiz history** — recent attempts, filterable, with the ability to retry
      exactly the ones you got wrong
- [ ] **Streak** — consecutive days with ≥1 attempt, from `answered_at`
- [ ] **Bookmarks** — `bookmarks` table, same RLS pattern; bookmark button on
      topics and individual questions
- [ ] Completed-lesson marking (explicit, plus auto when the quiz is finished)

---

## Phase E — Smarter learning (1–2 weeks) · *originally "Phase 5"*

Every item here is a query against the Phase A registry.

- [ ] **Search** — client-side index over `TOPICS` + `ALL_QUESTIONS` titles and
      prompt text. Keyboard-first (`/` to focus, arrows, enter). No dependency
      needed at this size; a scored substring match is enough.
- [ ] **Learning paths** — ordered topic sequences ("CCC in 6 weeks", "Organic
      from scratch"). Data, not code: a new array in `topics.ts`.
- [ ] **Recommended next lesson** — currently strictly linear via `TOPICS` order
      in [main.ts](src/main.ts). Upgrade to consider prereqs met, weak topics,
      and completion.
- [ ] **Personalized review** — auto-built set from wrong answers, oldest-first.
      This is the highest-value item in the phase; it is what turns the attempt
      log into actual learning.
- [ ] **Topic filtering** on the menu page — by group, difficulty, and completion

---

## Phase F — Competition modes (1 week) · *originally "Phase 6"*

> "Support multiple Olympiads without duplicating lessons."

Correct instinct, and the `comps` field from Phase A is exactly how you avoid the
duplication. A mode is a **filter over shared content**, never a second copy.

- [ ] Mode selector: CCC · USNCO · CCO · IChO, persisted per user
- [ ] Mode filters: which questions appear, which tier is emphasized, which
      topics are in scope (IChO covers material CCC does not), and which
      recommendations surface
- [ ] Progress tracked per mode — "72% CCC-ready" is a far better motivator than
      a raw solved count
- [ ] Mode-specific exam simulation: correct question count, correct time limit,
      correct part structure. `bankOlympiad.ts` already has the shape for this.

---

## Phase G — Explanations (1 week, gated) · *originally "Phase 7"*

Run the phases in the order given; **do not skip to the AI step.**

- [ ] **G.1 — Handwritten alternate explanations.** A second `why2` on the
      questions students most often miss (Phase A's attempt log tells you which
      ones — that data does not exist until then, which is the whole argument for
      writing this by hand first).
- [ ] **G.2 — Misconception explanations.** Already covered in B.2.
- [ ] **G.3 — "Explain differently" button.** Gate on a real, observed request
      rate from G.1 usage.

**Engineering note:** this is the only phase that adds a backend and a recurring
cost. An API key cannot ship in a Vite client bundle — it would be extracted
within a day of the repo or the deployed JS being read. It needs a Netlify
Function proxying the request, plus rate limiting per user, or the first person
who finds it runs up your bill. That is a real week of work and a real monthly
cost, for a feature whose demand is currently unmeasured. **Everything in Phases
B and C beats it on impact per hour.** Revisit after users exist.

---

## Phase H — Discoverability and users (ongoing) · *originally "Phase 8"*

### H.1 Make the site crawlable (half day)

`#app` starts `hidden` and every page is JS-constructed, so a crawler or a
no-JS visitor sees an empty document. Phase 0.2's OG tags fix link *unfurling*;
this fixes *search*. They are different problems and both are worth solving.

- [ ] Build-time prerender: emit a static HTML shell per `/topic/:id` from the
      `TOPICS` metadata (title, blurb, group, difficulty) — a small Vite build
      script, no framework change, no SSR runtime
- [ ] Per-route `<title>` and `og:*` (a shared link to *one topic* should unfurl
      as that topic)
- [ ] `<noscript>` summary with the topic list
- [ ] `sitemap.xml` + `robots.txt` generated from `TOPICS`

### H.2 Feedback loops — build before recruiting users

There is no point getting 50 users if nothing captures what they hit.

- [ ] Helpful / Not helpful on every explanation (one table, question id + verdict)
- [ ] Feedback form and bug report — **`textContent` only, per 0.5**
- [ ] Lightweight, privacy-respecting analytics: which topics get opened, which
      get abandoned, which questions get skipped

### H.3 Reach (after H.1 and H.2 are live)

- [ ] Chemistry teachers, olympiad Discords, relevant subreddits, school clubs
- [ ] "CCC Study Guide" / "USNCO Study Guide" landing pages — real search demand,
      and they are assembled from content you already have
- [ ] Short explainer videos if the earlier items show real traffic

---

## Suggested six months

Adjusted for what already exists and for the Phase A dependency.

| Month | Focus |
| --- | --- |
| **1** | Phase 0 (week 1) → Phase A. Unglamorous; unblocks everything after it. |
| **2** | Phase B — missions and misconceptions. Biggest jump in *felt* quality. |
| **3** | Phase C — tier, cut, and write Gold/Platinum. Plus challenge mode. |
| **4** | Phase D + H.1/H.2, then recruit the first 25–50 users. |
| **5** | Fix what they complain about. Phase E if the feedback points there. |
| **6** | Phase F, then ChemPrep 2.0. |

Phase G stays parked unless month 4–5 feedback demands it.

---

## The filter

> Before adding any feature, ask: **"Will this help an Olympiad student
> understand chemistry better, or solve harder problems?"**
> If yes, build it. If not, spend the time on something with greater
> educational impact.

Two things this filter should be pointed at first, because they are the ones
most likely to eat time without returning any:

- **Phase G's AI explanations** — real backend, real cost, unmeasured demand.
- **Any new topic module.** Coverage is close to complete at 25. Depth in the
  25 that exist beats a 26th.

The one measurement that matters more than anything else on this page: **get it
in front of 25 real students.** Twenty hours building the wrong feature is a
worse outcome than one hour reading feedback that redirects you.
