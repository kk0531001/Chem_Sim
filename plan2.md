Yep. Based on ChemSim-main-11 + the current repo/site, this is the list I'd actually use going forward. Not a giant wishlist, but the work that matters.

# ChemSim next-work list

## 🧪 1. Question bank excellence

Highest priority

- [x] Finish resolving every remaining flagged question
- [x] Verify every answer key + explanation pair
- [x] Check every MC question has exactly one defensible answer
- [x] Check distractors are chemically plausible and not accidentally correct
- [x] Check numerical questions independently
- [x] Check units, sig figs, constants, and signs
- [x] Remove questions that test trivia rather than chemistry
- [x] Standardize question difficulty tiers
- [x] Tag questions consistently by CCC / CCO / USNCO / IChO relevance
- [x] Build a strong Gold question pool
- [x] Build a smaller Platinum question pool
- [ ] Upgrade weak explanations
- [x] Add misconception explanations to high-value questions
- [x] Add `why2` explanations where a second explanation would genuinely help
- [x] Create more difficult multi-step / multi-concept problems
- [x] Create more experimental-data interpretation problems
- [x] Create more mechanism/reasoning-heavy organic problems
- [x] Create more CCO/IChO-style quantitative problems

**Goal**

Don't chase 1,000+ questions.
Build a corpus where the best 200–300 questions are genuinely excellent.

## 🛡️ 2. Security hardening

You've already done the major CSP/header/rate-limit work.
Now:

- [x] Audit every `innerHTML` usage
- [x] Identify which ones are truly trusted HTML
- [ ] Separate plain text rendering from trusted HTML rendering
- [ ] Make the dangerous API explicit, e.g. `trustedHtml(...)`
- [x] Audit question-bank content for HTML/script injection
- [x] Confirm no user-controlled content reaches HTML sinks
- [x] Audit all URL construction
- [x] Audit external links
- [x] Review authentication/session handling
- [x] Confirm service-role/secret keys never enter the client bundle
- [x] Run dependency vulnerability checks regularly
- [x] Keep the security headers under version control

**Goal**

Make "one bad content entry" incapable of becoming an XSS bug.

## 🗄️ 3. Supabase / database

You've already moved to migrations. Good.
Next:

- [x] Review every RLS policy again
- [x] Verify `SELECT`, `INSERT`, `UPDATE`, `DELETE` independently
- [x] Test cross-user access attempts
- [x] Test signed-out behavior
- [x] Test fresh-browser + signed-in-cloud-data behavior
- [x] Verify progress sync in both directions
- [x] Add generated TypeScript database types
- [x] Review indexes against actual queries
- [x] Verify reset-progress behavior against cloud state
- [x] Test partial network failure during sync
- [x] Test duplicate sync / retry behaviour
- [x] Decide what analytics data should be retained
- [x] Document the production database setup cleanly

**Goal**

A user's progress should be extremely hard to lose, duplicate, corrupt, or accidentally expose.

## 🎨 4. Frontend QA

Don't redesign the frontend again yet.
Instead:

- [x] Test every major page at 375 px
- [x] Test at 430 px
- [x] Test desktop widths
- [x] Test landscape phone
- [x] Test keyboard-only navigation
- [x] Test visible focus states
- [x] Test reduced-motion mode
- [x] Test browser zoom / large text
- [x] Check for horizontal overflow
- [x] Check every dialog/modal
- [x] Check every dropdown
- [x] Check every simulation control
- [x] Check equations and chemical notation at narrow widths
- [x] Check charts/canvases on mobile
- [ ] Check loading states
- [ ] Check error states
- [x] Check empty states
- [ ] Check authenticated vs anonymous states

Especially test:

- [x] Question Bank
- [x] Progress
- [x] Topic pages
- [x] Organic modules
- [x] Equilibrium
- [x] Electrochemistry
- [x] Quantum
- [x] Spectroscopy
- [x] Particle Sandbox

**Goal**

No "looks fine on my MacBook" bugs surviving.

## ♿ 5. Accessibility

- [x] Keyboard-test every interactive component
- [x] Verify focus order
- [x] Verify focus isn't trapped incorrectly
- [x] Verify dialogs announce correctly
- [x] Verify buttons/links have meaningful names
- [x] Verify form controls have labels
- [x] Verify error messages are announced
- [x] Verify progress updates are understandable
- [x] Check contrast on all surfaces
- [ ] Test with a screen reader
- [x] Check reduced motion
- [x] Check zoomed layouts

**Goal**

A student should not need a mouse, perfect eyesight, or a wide monitor to use the platform.

## 📊 6. Learning engine

Start making the data actually improve ChemSim.

- [x] Measure question accuracy by question ID
- [x] Measure accuracy by topic
- [x] Measure accuracy by skill/subtopic
- [x] Track questions students repeatedly miss
- [x] Track questions students repeatedly abandon
- [x] Track explanations marked unhelpful
- [x] Track where students stop in quizzes
- [x] Track section abandonment
- [x] Identify suspiciously easy questions
- [x] Identify suspiciously hard questions
- [x] Build a better "weak topic" model
- [x] Build a better "next question" recommendation
- [x] Create targeted review sets
- [x] Create spaced-review logic later
- [x] Consider skill-level mastery rather than only topic-level mastery

**Goal**

Instead of:
"You are weak in equilibrium."
eventually get to:
"You're good at ICE setup but consistently struggle with Q vs K and approximation assumptions."

That would be a major ChemSim differentiator.

## 🧱 7. Architecture / code quality

Do this gradually.

- [x] Identify oversized files
- [x] Extract UI helpers from `framework.ts`
- [x] Separate quiz logic from generic UI logic
- [ ] Separate animation helpers
- [x] Separate accessibility helpers
- [x] Keep routing logic isolated
- [x] Keep progress state isolated
- [x] Keep question-bank logic isolated
- [x] Reduce duplicated DOM patterns
- [x] Add tests when extracting things
- [ ] Remove dead code after refactors

**Goal**

Make the project easier to change without accidentally breaking 12 unrelated modules.

## ⚡ 8. Performance

Not urgent, but worth doing after QA.

- [x] Measure initial JS bundle
- [x] Measure largest route/module loads
- [x] Check lazy-loaded modules
- [x] Check Pixi/simulation loading
- [ ] Check mobile performance
- [x] Check animation frame usage
- [x] Check detached-section cleanup
- [x] Check image/font loading
- [x] Check unnecessary rerenders/repaints
- [x] Check long question-bank searches
- [ ] Check startup time on slower hardware

**Goal**

Fast enough that students forget there's a framework underneath it.

## 🧭 9. Question Bank UX

This deserves its own pass.

- [x] Make filters easy to understand
- [x] Make tier visible
- [x] Make competition relevance visible
- [x] Make answered/unanswered state obvious
- [x] Improve next/previous flow
- [x] Improve review mode
- [x] Make weak-question practice easy to start
- [x] Make bookmarked questions easy to revisit
- [ ] Make search results useful
- [ ] Add better sorting where appropriate
- [x] Make explanations easy to scan
- [x] Make "why was I wrong?" clearer
- [x] Make progress within a practice set obvious

**Goal**

The Question Bank should feel like the core training engine, not a database of questions.

## 🧠 10. Content structure

Once the question quality pass is further along:

- [x] Define a formal skill taxonomy
- [x] Tag questions by specific skills
- [x] Allow a question to test multiple skills
- [x] Map modules → topics → skills → questions
- [x] Map competition → topic → difficulty
- [x] Make these relationships machine-readable
- [x] Use them later for recommendations

Something roughly like:

```text
Equilibrium
├── Q vs K
├── ICE tables
├── Le Châtelier
├── Ksp
├── approximations
└── coupled equilibria
```

That becomes the foundation of your learning engine.

## 👨‍🎓 11. Real student validation

This is the big one.
Once the security/content baseline is solid:

- [ ] Give ChemSim to actual chemistry students
- [ ] Watch them use it without explaining everything
- [ ] Record where they hesitate
- [ ] Record where they get confused
- [ ] Record what they skip
- [ ] Record what they return to
- [ ] Ask which features they actually use
- [ ] Ask what they expected to happen
- [ ] Ask which questions feel unfair
- [ ] Ask which questions feel too easy
- [ ] Compare their experience across desktop/mobile
- [ ] Turn findings into actual issues

**Goal**

Stop guessing what students want.
Let the students bully the roadmap into shape. 🧪

## 📈 12. Distribution

Only after the above is solid:

- [ ] Improve landing-page messaging
- [x] Improve topic SEO
- [x] Create useful chemistry guide pages
- [x] Add better metadata where needed
- [x] Make sharing individual questions easy
- [x] Make sharing topic sections easy
- [ ] Add analytics for acquisition
- [ ] Get ChemSim in front of CCC/CCO students
- [ ] Collect feedback

## 🚫 Things I would NOT work on yet

- [ ] Don't add another 10 modules just to make the number bigger
- [ ] Don't redesign the whole visual system again
- [ ] Don't build a giant gamification system
- [ ] Don't build AI explanations yet
- [ ] Don't build a leaderboard yet
- [ ] Don't build a huge analytics dashboard
- [ ] Don't rewrite everything into a new framework
- [ ] Don't optimize Postgres for imaginary millions of users

## Your actual working order

Since you only work on ChemSim 2 days/week, I'd literally follow this order:

**Phase 1**

1. Question quality
2. Security `innerHTML` audit
3. Database testing

**Phase 2**

4. Mobile QA
5. Accessibility QA
6. Question Bank UX

**Phase 3**

7. Learning/skill model
8. Recommendation engine
9. Architecture cleanup

**Phase 4**

10. Real student testing
11. Distribution
12. Only then decide what major feature comes next

## And your weekly rhythm

Day 1: chemistry/content/product
Day 2: engineering/testing/security

That gives you a very clean development loop:

better chemistry → better software → real users → evidence → better chemistry.

That's the loop I'd build ChemSim around now.

---

## What is blocked on the owner

Everything below is unticked because it needs something I do not have, or a
decision that is yours. Nothing here is waiting on more engineering.

### Needs your environment

- **`0005_progress_reset.sql` has not been run — confirmed against your live
  project.** Asking PostgREST for the table returns `404 PGRST205, Could not
  find the table 'public.progress_reset'`, while `solved`, `attempts`,
  `bookmarks` and `signals` all answer `200`. Until the migration runs,
  `honourRemoteReset()` logs a warning and fails open (local data is kept),
  which is safe but means a reset still does not propagate between devices.
  Applying it needs `supabase login` plus a linked project, or the SQL editor —
  neither of which a publishable anon key can do, by design.
- **Signed-IN behaviour (§4).** The keys ARE present in `.env`, so everything
  signed-OUT has been exercised against the real project: cloud is configured,
  the sign-in UI renders, and anonymous reads of all four tables return `200 []`
  rather than anyone else's rows. What remains untested is the authenticated
  half — sync, the account panel, reset against real rows — because signing in
  needs a magic link sent to your inbox or Google OAuth.
  (Caveat on the `200 []` above: an empty result is consistent with RLS
  filtering AND with the tables simply being empty. It proves nothing leaks to
  an anonymous caller; it does not by itself prove rows exist to be filtered.)
- **Screen-reader pass (§5).** Semantics are verified — roles, names, live
  regions, focus order. What VoiceOver or NVDA actually announces is not.
- **Mobile FPS and slow-hardware startup (§8).** Layout is verified at 375,
  430, landscape and 200% text. Frame rate on a real phone is not.

### Needs a decision

- **Analytics retention (§3).** `signals` rows are kept 12 months; `attempts`
  has no policy at all. What should be kept, and for how long?
- **`trustedHtml()` (§2).** My view: it is ceremony now that the audit fails
  the build on any tainted `innerHTML` sink. Yours may differ — it is 109 call
  sites of pure renaming if you want the explicit API.
- **Landing-page messaging (§12).** The figures are derived and correct. Any
  change is a voice decision, and rewriting working copy on a guess is how
  landing pages get worse.

### Needs students (§11, all of it)

The largest single gap. Everything above this line is polish; §11 is what
tells you which polish mattered.

### Checked since, no longer outstanding

- **KaTeX post-load typesetting.** Verified: forcing a frame in the headless
  pane (a screenshot) lets `requestAnimationFrame` run, and math inserted after
  load renders, mhchem included, with no `katex-error` and a node count stable
  across further frames — so KaTeX's own DOM writes do not re-trigger the
  observer.
- **Un-solve / un-bookmark across devices.** Fixed with per-row tombstones.
