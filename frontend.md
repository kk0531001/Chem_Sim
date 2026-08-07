# Frontend UX plan — Weeks 1–2

Ordered, executable checklist. Implement top to bottom; item 5 depends on item 2
(`.btn-quiet`), and items 7–9 depend on item 6 (persisted last topic).

## Week 1

- [x] **1. Theory auto-open when short**
  - Files: `src/tabs/framework.ts` (`theory()`, ~line 1006)
  - Accept: blocks under ~700 chars render expanded, longer ones stay collapsed, no call site changes.
  - Effort: XS

- [x] **2. Add `.btn-quiet` + run the primary-action audit**
  - Files: `src/style.css` (near `.btn`, ~line 1333), `src/tabs/page.ts` (`addReset` ~line 100, bookmark ~line 145), `src/tabs/framework.ts`, `src/tabs/qbank.ts`
  - Accept: every screen shows exactly one filled accent button; Reset, Save for later, bookmark and reference links are quiet.
  - Effort: S

- [x] **3. Visible search input in the sidebar**
  - Files: `src/main.ts` (~line 436, `searchLinkEl`), `src/style.css`, `src/icons.ts`
  - Accept: an input-shaped button reading `Search 850+ questions ⌘K` opens the existing overlay; `initSearch()` untouched.
  - Effort: XS

- [x] **4. Sim task lines**
  - Files: `src/tabs/framework.ts` (`cardWithMissions` ~line 968), `src/tabs/page.ts` (DEV contract check ~line 182), all 25 files in `src/tabs/`, `src/style.css`
  - Accept: every sim card shows one imperative sentence between title and first control, and a card missing one logs a `[page contract]` error in dev.
  - Effort: M

- [x] **5. Quiz end-screen next action**
  - Files: `src/tabs/framework.ts` (~lines 559–566), reads `weakTopics()` from `src/progress.ts`, falls back to `recommendNext()` from `src/recommend.ts`
  - Accept: finishing a quiz shows the score, the weakest topic, and a primary button into it, with `Restart quiz` demoted to quiet.
  - Effort: S

## Week 2

- [x] **6. Persist last topic**
  - Files: `src/main.ts` (~line 409), `src/progress.ts`
  - Accept: after a reload the app knows the last topic id and the position reached in it.
  - Effort: XS

- [x] **7. Continue / Recommended block on the homepage**
  - Files: `src/home.ts` (under the hero CTA, ~line 285), `src/style.css`
  - Accept: a returning student sees a `Continue — <topic>` primary button above the fold; a first-time visitor sees the block omitted entirely, not an empty state.
  - Effort: S

- [x] **8. `/today` route**
  - Files: `src/router.ts`, `src/main.ts`, `public/_redirects`, router tests
  - Accept: `/today` renders the block from item 7 in a centered column plus three secondary links, and nothing else.
  - Effort: S

- [x] **9. Mastery strip in the sidebar footer**
  - Files: `src/main.ts` (sidebar footer), `src/style.css`, reads `streakDays()` / `solvedCount()` / `weakTopics()` and subscribes via `onProgressChange` in `src/progress.ts`
  - Accept: the sidebar permanently shows `N-day streak · N solved · Weakest: <topic> N%` with the topic clickable, and drops the weakest item when there is too little data.
  - Effort: S

## Week 3

- [x] **0. Thin the bottom bar (`#topic-footer`)**
  - Files: `src/style.css` (`#topic-footer` ~line 995, `.next-lesson-*` ~line 1018, `.next-lesson-why` ~line 2325)
  - Accept: at 1600×900 the footer is ≤ 65 px (was 208); around 1000 px it may wrap to ~80 px; no horizontal scroll and no content removed — the reason line and time/tier badges still render, inline. On a phone the footer drops to title + arrow (74 px measured at 390 px).
  - Effort: XS

- [x] **1. Learn / Practice / Prove section headers**
  - Files: `src/tabs/page.ts` (`sectionHead()`, `topicPage`), `src/style.css` (`.section-head`)
  - Accept: every topic page shows three plain headings — Learn above the theory block, Practice above the `.cards` sims, Prove above the quiz card — with the block order unchanged and no sticky rail, scroll-spy or completion rings. Learn is omitted by the `pills()` modules, whose theory sits inside the panels.
  - Effort: XS

- [x] **2. Collapse secondary sim cards**
  - Files: `src/tabs/page.ts` (`makeCollapsible()` + the sim loop in `topicPage`), `src/tabs/framework.ts` (`playPause()`), `src/style.css` (`.card.collapsed`, `.card-toggle`)
  - Accept: the first sim card is open and the rest show title + task line only, one Show/Hide click to expand; a collapsed card runs no animation loop — `playPause().playing()` reports false inside `.card.collapsed`, which is the gate equilibrium/gases already read. Verified on `gases`: the box canvas changes between paints while open and is byte-identical across a paint cycle once collapsed. Skipped for `pills()` layouts, where the cards are already one at a time.
  - Effort: M

- [x] **3. Mobile canvas responsiveness**
  - Files: `src/tabs/framework.ts` (`plotResize` + `plot()`), `src/style.css` (`.card canvas, .card svg` in the 900 px block)
  - Accept: at 390 px every canvas fills its card and the page does not scroll sideways (`documentElement.scrollWidth === 390`); a `plot()` canvas RE-RENDERS at the new width (460 → 260 backing store measured on `gases`) so tick labels stay 10 px instead of being scaled down with the bitmap. Hand-drawn canvases scale with the CSS box, keeping their authored aspect.
  - Effort: M

- [x] **4. Mobile quiz ergonomics**
  - Files: `src/style.css` (`.quiz-opt`, `.quiz-opts` in the 900 px block)
  - Accept: at 390 px each `.quiz-opt` is a full-width row exactly 48 px tall at 15 px type (measured), Check/Next stretch to the same height, and nothing scrolls sideways.
  - Effort: S

- [x] **5. Sandbox honesty on mobile**
  - Files: `src/main.ts` (the `sandbox` entry in `LAZY`), new `src/tabs/sandboxSmall.ts`
  - Accept: below 900 px the sandbox tab shows a static SVG figure plus "Best on a larger screen — save it for later", and neither pixi.js nor tweakpane is fetched — the resource list holds `sandboxSmall.ts` and no `sim`/`render`/`ui` module. The switch lives in the LOADER because `sandbox.ts` pulls pixi in through `sim.ts` at import time, so an early return inside `mount()` would still have paid for it. At ≥ 900 px the real sandbox is unchanged.
  - Effort: S

## Deferred

Sticky Learn/Practice/Prove rail · generic "Show me" tween on every sim ·
misconception clustering · full `/today` dashboard ·
inline landing-page onboarding question · token retrofit across `style.css` ·
micro-interactions and success animations.
