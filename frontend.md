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

## Deferred

Sticky Learn/Practice/Prove rail · generic "Show me" tween on every sim ·
misconception clustering · full `/today` dashboard · degraded mobile sandbox ·
inline landing-page onboarding question · token retrofit across `style.css` ·
micro-interactions and success animations.
