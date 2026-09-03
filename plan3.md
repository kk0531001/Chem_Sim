# ChemPrep — plan 3: lower the floor, add air, speak plainly

**Status:** live plan, being executed (ticks below are the ledger). Written 2026‑09‑02 after a
full read of the repo, a run of `tsc` + `npm run audit`, and a look at the live
site at 1440 px and 375 px.

The three complaints from your friends are correct and they share one root:
**the whole product is tuned for a student who is already an olympiad
candidate.** The copy says so ("Built for olympiad preparation"), the entry
point says so (the first module is *Quantum & Atomic Structure*), the theory
says so (compressed reference lists), and the layout says so (information
density a coach wants, not a 16‑year‑old). Fixing "cramped" and "jargony"
without fixing the audience would be polishing the wrong product, so the plan
below treats the three as one job with three faces.

---

## 1. What I found

### Health (good)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run audit` (content, router, spine, sections, recommend, sync, plot) | all green |
| `npm audit --omit=dev` | 1 moderate advisory: `@xmldom/xmldom` ≤ 0.8.14 (transitive, in the prod tree) |
| Corpus | 627 module quiz questions, 254 with `misconception`, 26 with `why2`, 0 with a hint field |
| Plans | ROADMAP.md (2538 lines), plan.md, plan2.md, revamp.md, frontend.md — five overlapping ledgers |

The engineering is in good shape. The content model, progress tracking, routing,
prerender, security headers and audits are done and tested. **This plan adds no
new module and no new subsystem.** Everything below is copy, CSS, and questions
inside structures that already exist.

### Measured, at 1440 × 900

| Thing | Measured | Target |
| --- | --- | --- |
| Theory text line length | **152 characters** (theory box is `max-width: 1480px`, body 15 px) | 60–75 ch |
| Body type | 15 px; UI default 13 px; labels 11–12 px | 16 / 14 / 13 |
| Line height in theory lists | 24 px on 15 px (1.6) — fine | keep |
| Card padding | 26 px, cards wrap at 400 px basis, 22 px gap | fine; the problem is *inside* the card |
| Sidebar | 232 px holding: search, 5 mode pills, All Topics, Your Progress, 8 groups, streak, Google button, email field, magic-link button, 3 footer links | one job |
| Section chip row | horizontal overflow, last chip clipped ("Referen…"), no scroll affordance; on mobile the first chip is clipped on the left ("rview") | wrap, or scroll with a fade |
| Homepage hero | invisible for ~3 s on first paint (the `.hero-in` reveal), then fades in | visible immediately |
| Menu page on mobile | 17 filter pills (Level / Progress / Area) before the first topic card | one row |
| Sim card | task line + mission box + hint/check buttons + select + 2 sliders + 3 bars + dark result + caption, all in one card | progressive disclosure |

### The content floor

| Fact | Consequence |
| --- | --- |
| Every module's lowest `difficulty` is `CCC` (8 modules) or higher (17 modules) | there is no content below "national olympiad qualifier" |
| `tierOf()` floors every non‑warm‑up question at Silver | a CCC module has exactly **5** Bronze questions out of 25–35 |
| Intros average ~100 words; 17 references to olympiad/CCC/CCO/PS4 across the 25 intros | the first paragraph a beginner reads tells them the site is not for them |
| Theory blocks are 1.3–2.8 k chars of bulleted reference ("The mole highway", "AX₄E₂", "OS up", "MO theory's signature win") | reads as a cheat‑sheet for someone who already learned it elsewhere |
| `why` is one sentence that names the rule | fine for revision, useless for first contact |
| No glossary, no definitions, no worked example before a formula, no "what you need to know first" | every term is assumed |
| Homepage CTA → `quantum`; module titles: "Quantum & Atomic Structure", "Bonding, VSEPR & MO Theory", "Acids · Redox · Kinetics" | the most intimidating door is the front door |
| Level filter labels: CCC · USNCO · CCO · IChO | meaningless to a non‑olympiad student |

### Smaller engineering debts (not the friends' complaints, but found)

- 111 `innerHTML` sites; plan2's `trustedHtml()` item is still open.
- README.md still says "12 topic tabs, 300 questions".
- `CORPUS_COUNTS` and `MODULE_QUIZ_SIZE` are hand‑maintained (audited, so safe, but a chore).
- Five planning documents. Whoever picks this up next has to read 4,000 lines to know the state.

---

## 2. Diagnosis → decision

**Do not add a new competition tier or new modules.** The CCC set *is* the
Canadian grade 11–12 high‑school syllabus, so the module‑level scope for a
beginner already exists (CCC mode). What's missing is the **within‑module
floor**: plain‑language theory, Bronze questions, and copy that doesn't assume
an olympiad reader. The machinery for all three exists today:

- `tier: 1` (Bronze) is a real field with a real filter and a challenge‑ladder rung. It just has almost no content.
- `theory()` accepts multiple blocks per page; a "Basics" block can sit above the existing one.
- `TopicMeta.intro` and `title` are one file (topics.ts).
- The style tokens (`--f-*`, `--s-*`, `--lh-*`) exist; the values are just tuned too tight.

So the plan is: **retune the tokens, rewrite the words, fill Bronze.** In that
order, because CSS is a day, words are a week, and questions are the long pole.

Three defaults I chose so the prompts can be concrete. Override any of them
before running the prompts.

1. **Audience statement:** "High‑school chemistry, from first principles up to olympiad level." Not "olympiad trainer".
2. **Reading measure:** 68 ch for all prose (intro, theory, `why`, misconception, FRQ solutions). Sims and plots keep their full width.
3. **Bronze target:** 10 Bronze questions per Foundations/CCC module (8 modules → +40 questions, since 5 exist), written to the new style guide, before any other module gets them.

---

## 3. Action plan

Ordered by impact ÷ effort. Each phase ships on its own. Estimates are for
Opus 5 doing the work with you reviewing.

### Phase 0 — Decide and write the rules (half a day, you + one prompt)

- [ ] **0.1** Confirm or change the three defaults above.
- [x] **0.2** Write `docs/STYLE.md`, the plain‑language style guide (Prompt 1). Every later content prompt cites it, so it has to exist first.
- [x] **0.3** Retire the old ledgers: fold the open items of plan.md, plan2.md, frontend.md, revamp.md into this file's "Carried over" section and delete them (Prompt 10). One plan.

### Phase 1 — Breathing room (1–2 days, CSS + small DOM)

- [x] **1.1** Reading measure: 60 ch (68ch rendered ~83 characters in this font) on `.theory > div`, `.quiz-why`, `.misconception`, FRQ solution bodies, `.topic-intro p` (already 70 ch). Left‑aligned, not centered, so it lines up with the cards. (Prompt 2)
- [x] **1.2** Type: `--f-4` 15 → 16 px, `--f-3` 13 → 14 px, `--f-2` 12 → 13 px; `--lh-body` to 1.6; paragraph spacing `--s-4`; `h3` in theory gets `--s-5` above. (Prompt 2)
- [x] **1.3** Sidebar: collapse the auth panel to one "Sign in" button that opens the existing popover (authWidget.ts has it); move the mode pills into the menu's Level filter only; keep search, nav, streak. (Prompt 3)
- [x] **1.4** Section chip row: wrap onto two lines at ≥ 900 px; on mobile keep scroll but add edge fades and never clip the active chip. (Prompt 3)
- [x] **1.5** Sim cards: controls and result visible; mission ladder collapsed to one line ("Mission 1 of 3 — Show") until opened; caption under the result. (Prompt 3)
- [x] **1.6** Hero: remove the reveal delay on the hero itself (keep `.reveal` for below‑the‑fold sections). (Prompt 3)
- [x] **1.7** Menu filters: Level + Area as two dropdown‑style selects on mobile, pills on desktop; Progress filter hidden until the user has progress. (Prompt 3)

Verify: screenshot the stoich theory section and the limiting‑reagent card at 1440 and 375 before/after; `documentElement.scrollWidth === 375` on mobile; `tsc` clean.

### Phase 2 — Plain language (1–2 weeks, content)

- [x] **2.1** Rewrite the 25 `intro` paragraphs to STYLE.md: ≤ 60 words, first sentence says what the topic *is* in everyday terms, no exam culture, one sentence on what you'll be able to do after. (Prompt 4)
- [x] **2.2** Rename module titles to plain words where the current title is a term list; keep slugs (they are URLs) and add the old title as an alias. Proposed: Quantum & Atomic Structure → *Atoms & Electrons*; Bonding, VSEPR & MO Theory → *Bonding & Molecular Shape*; Acids · Redox · Kinetics → *Acids, Batteries & Reaction Rates*; Stoichiometry & Solutions → *Moles & Solutions*; Gases, IMFs & Phases → *Gases, Liquids & Solids*. Olympiad‑only modules keep their names. (Prompt 4)
- [x] **2.3** A **Basics** theory block per CCC module (8), placed above the existing block, written to STYLE.md: define every term on first use, one worked number before each formula, 400–700 words, no "trap" callouts (those stay in the existing block, now titled "Exam‑level reference"). (Prompt 5)
- [x] **2.4** A glossary: `src/content/glossary.ts`, ~120 terms, one plain sentence each; `theory()` and the quiz renderer wrap the first occurrence of a term in a `<dfn>` with a tap/hover popover. One shared map, one renderer. (Prompt 6)
- [x] **2.5** Rewrite `why` for every Bronze question (existing 5 × 23 banks = 115) to the three‑step shape: what the question is really asking → the rule in plain words → the arithmetic. Rewording is allowed: progress keys on `id`. (Prompt 7)
- [x] **2.6** Homepage copy: headline, lede, eyebrow, the "Why it works" row, and the Start CTA target (→ *Moles & Solutions* or a "Start here" run). (Prompt 8)
- [x] **2.7** Level filter labels get a plain subtitle: CCC — "Grade 11–12 / high school"; USNCO — "Advanced high school"; CCO — "National olympiad"; IChO — "International". (Prompt 8)

Verify: read every rewritten intro aloud once; run `npm run audit` (question ids untouched); a friend who complained reads two Basics blocks and reports one confusing sentence or fewer.

### Phase 3 — Lower the floor (2–3 weeks, questions)

- [x] **3.1** +5 Bronze questions per CCC module (8 modules, 40 questions), tagged `tier: 1` explicitly, ids from `scripts/backfill-ids.mjs`, skill‑tagged from the frozen 81. Each has a `why` in the three‑step shape and a `misconception` where there is a real one. (Prompt 9)
- [x] **3.2** Quiz order: warm‑ups become "Basics" and the quiz shows *Basics 10 → Exam 20* as two visible stages with a checkpoint between them ("You've got the basics. Ready for exam‑style?"). Uses the existing `quiz(BANK, n)` count. (Prompt 9)
- [x] **3.3** "Start here" run in `RUNS` (topics.ts): Moles → Atoms & Electrons → Periodicity → Bonding → Thermo I → Equilibrium → Acids → Lab & Data. Homepage's three‑runs section shows it first; the hero CTA opens it. (Prompt 9)
- [x] **3.4** Default mode for a first visit: CCC (not "all"), with a one‑line dismissible banner explaining how to see everything. Returning users keep their stored mode. (Prompt 9) — reverted: default is All levels (owner decision 2026-09-03)

Verify: `auditCorpus()` clean; `MODULE_QUIZ_SIZE` and `CORPUS_COUNTS` updated; `ladderFor(id)` returns a real Bronze rung for all 8 modules; a Bronze‑only quiz of any CCC module has ≥ 10 questions.

### Phase 4 — Hygiene (ongoing, one prompt each)

- [ ] **4.1** `trustedHtml()` wrapper around the 111 `innerHTML` sites; `h()` gets `text` vs `html` made explicit. (plan2 item; Prompt 11)
- [x] **4.2** xmldom advisory — skipped, not a runtime path: `@xmldom/xmldom` is pulled in only by pixi.js's Node build and does not appear in any `dist/assets/*.js` (verified by grep after `npm run build`). Moderate severity, below the `--audit-level=high` gate. Goes away when pixi bumps it; nothing to do here.
- [x] **4.3** README.md intro rewritten to the current positioning and counts (25 modules, 933 MC, 128 FRQ, 5 papers); the per-tab table below it still lists the five renamed modules under their old titles — cosmetic, left for a later pass.
- [ ] **4.4** Show it to the same friends again. Record what they say in this file under "Feedback round 2". Then, and only then, the next plan.

### Not doing

- A new competition tier or a "grade 10" mode. CCC is the high‑school scope; the fix is inside modules.
- New modules. 25 is enough. Depth over count (ROADMAP's filter still holds).
- A redesign of the visual language. Tokens get retuned; paper/ink/one accent stays.
- AI explanations. Still gated on demand data (ROADMAP Phase H).
- A mass spacing rewrite across style.css (plan.md's standing decision). Only the tokens and the reading measure change.

---

## 4. Prompts for Opus 5

Each prompt is self‑contained. Paste one at a time, in order. Every prompt
assumes Opus reads CLAUDE.md first (it will; it's in the repo) and ends with
`npx tsc --noEmit && npm run audit`. Where a prompt writes chemistry, it must
check values against a textbook before shipping, per CLAUDE.md.

### Prompt 1 — Style guide

```
Read CLAUDE.md, then read src/topics.ts (the `intro` fields), the theory() call
in src/tabs/stoich.ts, and the first 30 questions in src/tabs/questions1.ts.

Write docs/STYLE.md: the plain-language writing guide for every piece of student-
facing prose on this site (intros, theory blocks, quiz `why`, `misconception`,
mission prompts, FRQ solutions, homepage copy). Audience: a grade 11 student
meeting the topic for the first time, who may later go on to olympiad level.

The guide must contain, with a before/after example drawn from the real files for
each rule:
1. Define a term the first time it appears, in the same sentence, in everyday
   words. ("A mole is just a count: 6.02 × 10²³ of something, the way a dozen is 12.")
2. Worked number before general formula. Show one concrete calculation, then
   the equation it came from.
3. One idea per sentence. No semicolons joining clauses. Aim under 20 words.
4. No exam culture in Basics-level text: no "olympiad", "marks", "CCO", "PS4",
   "trap", "classic". Those words are allowed only in blocks titled
   "Exam-level reference" and in questions tiered 3-4.
5. No cleverness that assumes the joke: "the mole highway", "MO theory's
   signature win", "this killed the wave model" are examples to replace.
6. The three-step `why` for Bronze questions: (a) what the question is really
   asking, (b) the rule in plain words, (c) the arithmetic or the reasoning
   step, in that order, 2-4 sentences total.
7. Symbols: spell out on first use ("ΔH, the enthalpy change — the heat given
   out or taken in at constant pressure"). Subscripts and unicode as the corpus
   already does; no LaTeX in prose.
8. Titles are plain nouns, not term lists.
9. Reading-level check: a paragraph should pass a Flesch-Kincaid grade of ≤ 10
   for Basics text. Say how to check it (any online tool; no tooling added).

Also include a 12-line "before you ship a paragraph" checklist. Keep the whole
document under 250 lines. Do not touch any source file.
```

### Prompt 2 — Reading measure and type scale

```
Read CLAUDE.md (the "Spacing, radius, shadow and duration come from the tokens"
rule and the plan.md note that spacing must NOT be mass-rewritten). Read
src/style.css :root tokens (lines ~80-125) and the rules for .theory,
.topic-intro, .quiz-why, .misconception, .card, .cards.

Problem, measured at 1440x900: theory text runs 152 characters per line
(`.theory` is max-width 1480px with 15px body). Body is 15px, UI text 13px,
labels 11-12px. Students say the site feels cramped.

Make these changes in src/style.css only:
1. Tokens: --f-4 16px, --f-3 14px, --f-2 13px (leave --f-1, --f-5, --f-6).
   Set --lh-body to 1.6 if it is lower. Add `--measure: 68ch`.
2. Apply `max-width: var(--measure)` to every prose container: `.theory > div`
   (or whatever wraps the theory HTML), `.topic-intro p` (replace the 70ch),
   `.quiz-why`, `.misconception`, the FRQ solution body in qbank, and the
   homepage `.lede` / `.section-lede`. Prose stays LEFT-aligned inside its card
   so it lines up with the controls; do not center it. Canvases, plots, tables
   and `.result` readouts keep full width.
3. Vertical rhythm inside theory: `h3` gets margin-top var(--s-5); `p`, `ul`
   get margin-bottom var(--s-4); `li` gets var(--s-2) between items.
4. Do not change any other spacing value. Do not touch layout of .cards.

Verify: run the dev server, open /topic/stoichiometry-and-solutions/theory-key-
equations at 1440 and at 375 wide, and report (a) the measured character count
per line in a theory <li> (width / (fontSize*0.5)), (b) documentElement.scrollWidth
on mobile equals 375, (c) screenshots before and after. Then `npx tsc --noEmit
&& npm run audit`. One commit, message starting "Phase 1.1-1.2:".
```

### Prompt 3 — Declutter the chrome

```
Read CLAUDE.md, then src/main.ts (sidebar assembly, the mode pills near
"Preparing for", the account panel), src/authWidget.ts (mountSidebarAccountPanel
and mountHomepageAccountWidget), src/sectionHost.ts and the section chip row CSS
in src/style.css, src/tabs/framework.ts cardWithMissions() and missionLadder(),
src/home.ts (the .hero-in reveal, ~line 577) and src/menu.ts (the filter pills).

Five changes, each its own commit:

A. Sidebar auth: replace the always-open Google button + email field + magic-link
   button with a single quiet "Sign in" button that opens the SAME popover the
   homepage uses (mountHomepageAccountWidget). Do not duplicate auth UI; extend
   authWidget.ts if the popover needs an anchor option. Signed-in state shows
   the existing streak/solved line plus a "Sign out".
B. Mode pills: remove the "Preparing for" pill group from the sidebar. The mode
   is still set from the menu's Level filter and the guide pages; show the
   current mode as one small chip next to the search box that links to /menu.
C. Section chip row: at >= 900px the chips wrap to as many lines as needed (no
   horizontal scroll, nothing clipped). Below 900px keep horizontal scroll, add
   left/right edge fades, and scrollIntoView({inline:'center'}) the active chip
   on section change so it is never clipped.
D. Mission ladder: inside cardWithMissions, render the ladder collapsed to a
   single line "Mission 1 of N · <prompt truncated> — Show" until the student
   opens it; remember open/closed per card in sessionStorage. Task line stays
   visible. Nothing about mission ids, tick() or markSolved changes.
E. Hero reveal: the hero's own children (.hero-in) must be visible on first
   paint — drop their transition delay and the observer gating for the hero
   only; keep .reveal for below-the-fold sections. Respect prefers-reduced-motion
   as the file already does.
F. Menu filters (src/menu.ts): on < 700px render Level and Area as two <select>
   elements (native), pills on desktop; hide the Progress filter entirely when
   solvedCount() === 0.

Verify each with a screenshot at 1440 and 375 and `npx tsc --noEmit && npm run
audit`. No emoji, no new dependency, tokens only for new spacing.
```

### Prompt 4 — Intros and titles

```
Read CLAUDE.md, docs/STYLE.md, and src/topics.ts in full.

Rewrite the `intro` of all 25 TopicMeta entries to STYLE.md: <= 60 words each;
the first sentence says what the topic IS in everyday language; the second says
what a student will be able to do after the module; no exam-culture words
(olympiad, marks, CCO, PS1-4, trap). For the 8 modules whose lowest difficulty
is 'CCC', write for a grade 11 student meeting the topic for the first time.
For the CCO/IChO modules, plain language still applies but you may assume the
CCC modules are known.

Rename these titles (slugs stay — they are URLs and are in the sitemap; add the
old title's key words to `aliases` so search still finds them):
  quantum      -> Atoms & Electrons
  bonding      -> Bonding & Molecular Shape
  stoich       -> Moles & Solutions
  aek          -> Acids, Batteries & Reaction Rates
  gases        -> Gases, Liquids & Solids
Update the matching label anywhere it is hard-coded (grep the old titles in src/
and scripts/, including guides.ts and prerender). The TabDef `label` in the
module files must match. Do not change ids, slugs, groups, difficulty, prereqs
or refs.

Do not touch question text in this prompt. Run `npx tsc --noEmit && npm run
audit && npm run build` (prerender must still resolve every slug). Commit as
"Phase 2.1-2.2: plain-language intros and titles".
```

### Prompt 5 — Basics theory blocks

```
Read CLAUDE.md, docs/STYLE.md, src/tabs/page.ts (TopicPage.theory accepts an
array), and the theory() helper in src/tabs/framework.ts.

For each of these 8 modules — stoich, quantum, periodicity, bonding, thermo1,
equilibrium, labdata, labtech (the modules whose lowest difficulty is 'CCC') —
add a SECOND theory block, placed FIRST in the `theory` array, titled
"Basics — <plain topic name>", 400-700 words of HTML in the house markup
(h3, p, ul/li, span.eq for equations). Rules:
- Written to STYLE.md: every term defined on first use, one worked number before
  each formula, one idea per sentence, no exam-culture words, no class="trap".
- Start with a 2-sentence "What this is about" and end with a 3-bullet "What
  you should be able to do now".
- Cover only what the module's Bronze questions and first simulation need. Do
  not duplicate the existing block; it stays and is retitled
  "Exam-level reference — <topic>".
- Every chemical value you quote (molar masses, bond energies, pKa, E°) must be
  a textbook value; state which one you used in the commit message.
- The Basics block opens by default (theory(title, html, true)); the reference
  block keeps the current auto-open behavior.

One commit per module so each can be reviewed alone. After each: `npx tsc
--noEmit && npm run audit`. Report the word count of each block.
```

### Prompt 6 — Glossary

```
Read CLAUDE.md, docs/STYLE.md, src/tabs/framework.ts theory(), src/tabs/ui/
quiz.ts (how `why` and `misconception` are rendered), and the D.7 note in
CLAUDE.md that new spacing uses tokens.

Build a glossary the lazy way:
1. src/content/glossary.ts: `export const GLOSSARY: Record<string, string>` of
   ~120 terms a grade 11 student meets in the 8 CCC modules (mole, molar mass,
   limiting reagent, enthalpy, entropy, equilibrium constant, Le Chatelier,
   electronegativity, orbital, valence, oxidation state, buffer, titration,
   indicator, catalyst, activation energy, isotope, half-life, ...). One plain
   sentence each, <= 25 words, per STYLE.md. Pure data, no imports, so
   scripts/prerender.mjs could load it.
2. One function `annotateTerms(root: HTMLElement)` in a new src/tabs/ui/
   glossary.ts that walks text nodes under `root`, wraps the FIRST occurrence of
   each glossary term (case-insensitive, whole word) in
   `<dfn class="term" tabindex="0" aria-describedby=...>`, and shows the
   definition in a small popover on hover/focus/tap. Native <dialog> or a single
   absolutely-positioned div reused for all terms — not one popover per term.
   Never annotate inside .eq, code, canvas captions, or question option buttons.
3. Call it from theory() and from the quiz `why` renderer only. Nowhere else.
4. Styling: dotted underline in --ink-dim, popover on --paper-2 with --shadow-2,
   radius --r-md, type --f-3, max-width 32ch. No emoji.
5. Cost: glossary.ts must not land in the entry chunk. Import it from the topic
   chunk path only; confirm with `npm run build` and the chunk list.

Verify: screenshots of a theory block with two annotated terms and the popover
open, keyboard focus reaches a term and Escape closes the popover, `npx tsc
--noEmit && npm run audit`. One commit.
```

### Prompt 7 — Rewrite Bronze `why`

```
Read CLAUDE.md (the content model section: ids are permanent; rewording is
allowed because progress keys on `id`), docs/STYLE.md rule 6 (the three-step
`why`), and src/content/registry.ts tierOf() (the first five ids of every quiz
bank are Bronze).

For every quiz bank in src/tabs/questions1.ts .. questions7.ts, rewrite the `why`
of the first five (warm-up) questions to the three-step shape: (a) what the
question is really asking, (b) the rule in plain words with the key term
defined, (c) the arithmetic or reasoning step. 2-4 sentences, no exam-culture
words, no cleverness. Keep the correct answer index `a` and the option text
unchanged. Do not change ids. Do not touch questions 6+ in this prompt.

Where a warm-up is actually not a warm-up (it needs a rule a beginner would not
have met), say so in the commit message with the id — do not move or renumber
it; that list feeds the next prompt.

Verify each number you write. Run `node scripts/audit-content.mjs` and `npx tsc
--noEmit && npm run audit`. One commit per questions file (7 commits) so a
reviewer can read one file at a time.
```

### Prompt 8 — Homepage and level labels

```
Read CLAUDE.md, docs/STYLE.md, src/home.ts (hero, "Why it works" feature rows,
the three runs section, the levels section), src/mode.ts and src/content/
topicIds.ts (COMP_LABEL), src/menu.ts (Level filter), and src/guides.ts.

Positioning change: the site is "high-school chemistry, from first principles
up to olympiad level", not an olympiad trainer. Make these copy changes only —
no layout changes, no new sections:

1. Hero eyebrow: replace "CCC · CCO · USNCO preparation" with "Grade 11 to
   olympiad · interactive".
2. Hero h1: plain and specific, <= 9 words, says what it is for whom. Offer
   three candidates in your summary; ship the one that passes STYLE.md, e.g.
   "Learn chemistry by running it." Keep the <em> accent on one word.
3. Lede: keep the interpolated counts, drop "Built for olympiad preparation,
   not for slideshows", add one sentence that a beginner can start at the
   basics and the same modules go up to contest level.
4. "Start learning" CTA target: the first module of the "Start here" run if
   RUNS has one, else 'stoich'. Never 'quantum'.
5. Every place COMP_LABEL is shown as a filter (menu Level pills, guide pages,
   the "levels" homepage section) gets a one-line plain subtitle from a new
   COMP_PLAIN map in topicIds.ts:
     ccc   "Grade 11-12 high school"
     usnco "Advanced high school"
     cco   "National olympiad"
     icho  "International olympiad"
   Never state dates, scoring or eligibility (CLAUDE.md guide rule).
6. Brand tag "CCC TRAINER" next to the logo -> "CHEMISTRY, RUNNING".

Verify with a homepage screenshot at 1440 and 375, `npx tsc --noEmit && npm run
audit && npm run build` (the OG description in index.html / prerender must say
the same thing — update it). One commit.
```

### Prompt 9 — Fill Bronze and the Start-here path

```
Read CLAUDE.md fully (content model, question ids, skill taxonomy is FROZEN at
81, MODULE_QUIZ_SIZE and CORPUS_COUNTS in src/content/counts.ts, mission and
quiz rules), docs/STYLE.md, src/content/registry.ts (tierOf, ladderFor),
src/tabs/ui/quiz.ts (quiz(BANK, warmups)), src/topics.ts RUNS, src/mode.ts,
and scripts/backfill-ids.mjs.

Four parts, four commits:

A. Questions. For each of stoich, quantum, periodicity, bonding, thermo1,
   equilibrium, labdata, labtech, write 5 NEW Bronze questions and insert them
   directly after the existing 5 warm-ups (positions 6-10). Each: explicit
   `tier: 1`, a `skill` from the frozen 81 (or untagged if none fits honestly),
   a `why` in the three-step shape, a `misconception` only where a real one
   exists. Single defensible answer, plausible distractors, textbook values.
   Ids come from `node scripts/backfill-ids.mjs` (dry-run first, then apply);
   never hand-number. ORIGINAL questions only — never copy a real contest item.
   Update MODULE_QUIZ_SIZE and CORPUS_COUNTS; `auditCorpus()` must pass.
B. Quiz stages. quiz(BANK, 10) for those 8 modules. The quiz renders two visible
   stages, "Basics" (the first n) and "Exam-style" (the rest), with a checkpoint
   card between them showing the Basics score and one primary button "Continue
   to exam-style" and a quiet "Review basics again". No new progress fields —
   recordAttempt and markSolved unchanged.
C. Start-here run. Add to RUNS in topics.ts, FIRST:
   { id: 'start-here', title: 'Start here', blurb: <one plain sentence>,
     topicIds: ['stoich','quantum','periodicity','bonding','thermo1',
                'equilibrium','aek','labdata'] }
   home.ts already renders RUNS; confirm it shows first. The hero CTA (Prompt 8)
   opens its first module.
D. First-visit default mode. In mode.ts, when localStorage has no stored mode
   AND progress is empty, the initial mode is 'ccc' and a one-line dismissible
   note appears at the top of /menu: "Showing high-school level. Show
   everything" (link sets 'all'). Returning users are unaffected. Persist the
   dismissal in localStorage; never throw if storage is unavailable.

Verify: `npx tsc --noEmit && npm run audit && npm run build`; for each of the 8
modules `ladderFor(id)` has a Bronze rung with >= 10 questions (write a 10-line
check in scripts/test-recommend.mjs or a sibling); screenshots of the checkpoint
card at 1440 and 375.
```

### Prompt 10 — One plan

```
Read plan.md, plan2.md, frontend.md, revamp.md and ROADMAP.md (headings and
every unchecked `- [ ]` line), then plan3.md.

Consolidate: move every still-open item from the first four files into a
"Carried over" section at the end of plan3.md, one line each, keeping the
original id (S2, Q1, item 7 ...) and marking HUMAN/BLOCKED as the source does.
Drop items that plan3.md already covers (say which). Then delete plan.md,
plan2.md, frontend.md and revamp.md. ROADMAP.md stays as history; add a two-line
note at its top pointing to plan3.md as the live plan. Update the "See
ROADMAP.md" pointers in README.md and CLAUDE.md if they claim the roadmap is
current.

Do not change any source file. One commit: "One plan: fold the four ledgers into
plan3.md".
```

### Prompt 11 — trustedHtml (Phase 4, optional)

```
Read CLAUDE.md (the innerHTML policy note referenced from ROADMAP 0.5 and
plan2 §2), src/tabs/framework.ts h() (the `html:` attribute path), and grep
every `innerHTML` in src/ (111 sites).

Make the dangerous path explicit without a rewrite: add
`export function trustedHtml(s: string): TrustedHtml` (a branded string type)
in src/tabs/framework.ts; `h()`'s `html:` option and a new `setHtml(el, t:
TrustedHtml)` helper accept only that type. Then convert sites mechanically:
content from the corpus (question text, why, theory, FRQ) wraps in trustedHtml
at the call site; anything that is really plain text switches to textContent.
The one user-typed string (feedback box, src/signals.ts) must never reach a
sink — assert that in a comment and a test in scripts/audit-content.mjs that
greps for `innerHTML` outside framework.ts and fails on any new one.

Verify: `npx tsc --noEmit && npm run audit && npm run build`, and click through
home, one topic, the question bank, progress, a guide with no console errors.
Several commits are fine; the last one adds the audit rule.
```

---

## 5. Order of operations

```
Prompt 1 (style guide) ─┬─ Prompt 2 (measure/type) ── Prompt 3 (chrome)
                        │
                        ├─ Prompt 4 (intros/titles) ── Prompt 5 (Basics blocks) ── Prompt 6 (glossary)
                        │
                        └─ Prompt 7 (Bronze why) ── Prompt 8 (homepage) ── Prompt 9 (fill Bronze, start-here)

Prompt 10 (one plan) any time after Prompt 1.  Prompt 11 any time.
```

Prompts 2–3 and 4–7 are independent and can run in parallel sessions. Show the
site to the friends after Prompt 3 (cramped), again after Prompt 6 (jargon),
and again after Prompt 9 (level). Write what they say in this file.

## Phase 5 — The homepage (audit 2026‑09‑03)

### What is there now, measured at 1440 × 900

| Metric | Value |
| --- | --- |
| Page height | 8,067 px = **9 viewports** (about 20 phone screens) |
| Rendered words | **1,548** (a landing page that converts reads in under 300) |
| Buttons and links | **70** |
| Sections | top bar, hero, Why it works (3 feature rows + 3 SVG figures), Try one, Ways through (4 path cards listing 27 module names), Which competition (4 cards), the full 25‑module catalogue, a stats strip, a footer CTA |
| Buttons that all open the same first module | 3 ("Open the app", "Start learning", "Enter ChemPrep") |
| Decorations | scroll‑progress bar, count‑up animation on the stats, scroll‑reveal fade on every section, section numbers "01–06" that are out of order (06 comes last, 05 is used twice in the source, 03 twice) |

### Why it reads as vibecoded

Every landing‑page trope is present at once: numbered sections, a stats strip with a count‑up, "Why it works" feature rows with figures, "Try it", learning paths, a comparison grid, a full catalogue, and a closing "Ready when you are." Each one is competently built. Together they say *a template was filled in*, and none of them was cut when the next was added.

**Jargon** (all in the register STYLE.md bans on the homepage):

- "watch it chase K back down", "a real kinetic system", "Nuclei decay at random yet trace the exponential law"
- "Half‑equivalence gives pKa; equivalence sits above 7"
- "The (2x)² inside the ICE table. Losing 4s before 3d. Chlorine's electron affinity beating fluorine's."
- "Valence rules only", "the ensemble still obeys first‑order kinetics", "N = N₀·(½)^(t/t½)", "a catalyst lowers the barrier for both directions; ΔH and K don't move"
- the demo readout `[N₂O₄] = 0.775 · [NO₂] = 0.450 · Q = [NO₂]²/[N₂O₄] = 0.26 (K = 0.50)`
- "Fig. 1 —", "Fig. 2 —" … five figure captions styled as a journal article

**Useless or duplicated information:**

- The lede is a numbers dump (25 / 933 / 128 / 5). The stats strip repeats the same four numbers, then animates them.
- "Which competition" (148 words) duplicates the menu's Level filter and the four guide pages.
- "Ways through" (244 words) lists every module in every run, then the catalogue (696 words) lists every module again, then "Browse the full directory" links to /menu, which lists them a third time.
- "Browse the modules" in the hero scrolls the page to the catalogue instead of going anywhere.
- The hero caption ends "Click 'Particle Sandbox' for the full engine" — there is no such link on the screen.
- "Chemistry, running" as a brand tag means nothing to a reader.
- The footer says "No accounts, no installs" next to a Sign in button.

**Now false**, after Phase 3: "five warm‑ups, then twenty contest‑level problems" (quizzes are 10 Basics + 20–30 exam‑style, 30–40 long) and "a 25‑question quiz — five warm‑ups, twenty at contest level".

**What is good and stays:** the hero simulation (atoms bonding, live), the equilibrium demo (the strongest thing on the page), the Continue block for returning students, the paper/ink design, the type.

### The decision

A first‑time visitor should be able to read the whole page in a minute and know three things: what this is, that they can start with no chemistry, and where to click. Everything that does not serve one of those three leaves. **Target: 3 viewports, under 300 words, one primary button.**

### The new page, top to bottom

1. **Top bar.** Wordmark (no tag line), "All topics" → /menu, Sign in. Drop "Open the app".
2. **Hero.** Headline as now. One sentence, no numbers: *"Interactive lessons from the first mole up to olympiad level. Every topic starts with the basics and every answer is explained."* One primary button "Start with the basics" → Moles & Solutions. One quiet link "See all 25 topics" → /menu (a real page, not a scroll). Hero sim stays; caption in plain words, no "Fig. 1": *"Hydrogen and oxygen atoms bonding into water, live. Hydrogen makes one bond, oxygen makes two."* Returning students see the Continue block in place of the primary button, as now.
3. **Try it.** The equilibrium demo, kept, with a plain instruction and a plain readout: *"Press Add NO₂ and watch the mixture settle back. Brown NO₂ is 0.45 mol/L · colourless N₂O₄ is 0.78 mol/L · it is [moving / settled]."* The K/Q algebra moves into the module. One quiet link "Open the equilibrium topic".
4. **Start here.** The one run, as eight numbered steps with the module titles, minutes total, and one button "Start step 1". The other three runs get one line: "Doing a contest? Runs for CCC, organic, and advanced are in All topics." Progress bar stays for returning students.
5. **Three reasons, one line each, no figures.** *Simulations you control, not videos.* · *Every answer explained, right or wrong.* · *A Basics level in every topic, then exam‑style.* No section number, no heading larger than the lines.
6. **Footer.** "Made for Canadian high‑school students, free, no account needed to start." with the All topics link. No third CTA, no "Ready when you are."

**Removed:** Why it works (the three feature rows and their three SVG figures), Which competition, the 25‑card catalogue, the stats strip and count‑up, the scroll‑progress bar, the section numbers, the scroll‑reveal fade (content is visible on arrival; motion is reserved for the two simulations), "Enter ChemPrep". Dead code goes with it: `FIG_TITRATION`, `FIG_ENERGY`, `FIG_DECAY`, `featureRow`, `competitionCard`, `countUp`, the progress bar and its scroll listener, and the `.reveal` CSS (check `menu.ts`/`guide.ts` for other users first).

**Kept and untouched:** `continueBlock` (also drives /today), `startTopic()`, `makeHeroSim`, `makeDemoSim` (readout text changes only), `renderTopicCard` in topics.ts (the menu uses it), the OG/meta description (already matches the new lede's meaning; re‑check the exact sentence).

- [x] **5.1** Copy and structure per the list above (Prompt 12).
- [x] **5.2** Delete the removed sections' code and CSS; confirm the entry chunk shrinks (Prompt 12).
- [x] **5.3** Mobile: the page must be ≤ 6 phone screens at 375 px; the hero sim canvas and the demo stay full‑width (Prompt 12).
- [ ] **5.4** Show it to the friends. Ask one question: "What is this site and what would you click first?"

### Prompt 12 — The homepage, cut to what a visitor needs

```
Read CLAUDE.md, docs/STYLE.md, and plan3.md "Phase 5 — The homepage" in
full: it is the spec. Then read src/home.ts end to end, src/style.css from
the ".home-wrap" rule through the ".home-end" rule (the homepage styles),
src/topics.ts (PATHS, pathTopics, renderTopicCard — the menu uses the last
one, do not remove it), src/progressPage.ts and src/main.ts for every import
from home.ts (continueBlock, TILE_HTML, buildHome), and index.html /
scripts/prerender.mjs for the no-JS copy and meta description.

Rebuild buildHome() to the six-part structure in Phase 5, in this order:
top bar · hero (with Continue block for returning students) · Try it ·
Start here · three one-line reasons · footer. Use the exact copy given in
the plan; where the plan gives a sentence in quotes, ship that sentence.
Target: under 300 rendered words for a first-time visitor, one primary
(.btn-hero) button, page height <= 3 viewports at 1440x900 and <= 6 at
375 px wide.

Remove, with their CSS: the "Why it works" feature rows and FIG_TITRATION /
FIG_ENERGY / FIG_DECAY / featureRow, "Which competition" and
competitionCard, the 25-card catalogue section, the stats strip and
countUp, the scroll-progress bar and its scroll listener, the section
numbers (.sect-no), the "Ready when you are" footer, and the .reveal
scroll-fade (grep menu.ts, guide.ts, progressPage.ts first; if another page
uses .reveal keep the CSS rule and only stop applying it here). Everything
must be visible on arrival; the only motion is the two simulations, still
gated by IntersectionObserver and prefers-reduced-motion as now.

Try it: keep makeDemoSim, change only its readout to the plain sentence in
the plan (concentrations in mol/L to two decimals, and "moving" while
|Q - K| is beyond the sim's own settled threshold, else "settled"); the K
and Q algebra is deleted from the homepage, not moved. Start here: render
the run whose id is 'start-here' from PATHS as an ordered list of its
module titles with total minutes and one "Start step 1" button (or
"Continue: <title>" with the progress bar when the student has progress,
reusing the existing paint logic); the other runs become the single
sentence in the plan linking to /menu. Fix the hero caption (no "Fig.",
no "Particle Sandbox" reference). Delete every sentence that states quiz
counts ("five warm-ups, twenty…").

Update index.html's <noscript>/no-JS copy and the meta/OG description in
index.html and scripts/prerender.mjs so they say the same thing as the new
lede (no numbers). Keep the JSON-LD valid.

Verify: `npx tsc --noEmit && npm run audit && npm run build`; report the
entry chunk size before and after (expect it to shrink). On the dev server
(Browser preview, "chemprep", http://127.0.0.1:5174) at 1440x900: report
document words (#home innerText word count), page height in viewports, the
count of .btn-hero elements (must be 1), and a screenshot of each viewport;
at the 375 preset: height in screens and documentElement.scrollWidth ===
375. Clear localStorage first so you see the first-visit page, then set a
lastTopic to confirm the Continue block still replaces the primary button.
Do NOT commit; the lead reviews and commits.
```

## Phase 6 — Split every high‑school module into a course page and a contest page (audit 2026‑09‑03, revised)

### The complaint, verified

"The progression from basic to advanced is too fast: we go from defining an
atom straight to exam traps." Measured on Atoms & Electrons:

| Step a beginner takes | What they meet |
| --- | --- |
| Chip 2, Basics | "An atom is a dense central nucleus … an electron is a very light particle" |
| Chip 3, Exam‑level reference | "Nodes: total = n−1; angular = ℓ; radial = n−ℓ−1. Classic trap: how many radial nodes in 4d?" |
| Chip 4, first simulation | "Hydrogen orbital viewer — ψ, signed amplitude (blue = ψ > 0, red = ψ < 0)" |
| Quiz question 11, first after Basics | "How many radial nodes does a 4d orbital have?" |

Bonding is the same: Basics ends at "a double bond is one sigma and one pi", question 11 is XeF₄'s shape, 12 is paramagnetism by molecular‑orbital theory, 13 is the bond order of superoxide. The first simulation on Acids, Batteries & Reaction Rates is the buffer designer; on Lab & Data it is Beer's law.

**Root cause: every module has two layers and no middle**, and both layers share one page. The grade 11–12 course itself is not written anywhere; the "Silver" tier is derived from contest questions, not authored. Simulations are in author order, often hardest first.

### The decision (owner, 2026‑09‑03)

**Separate topics, not layers on one page.** Each of the nine high‑school
modules (stoich, quantum, periodicity, bonding, thermo1, equilibrium, aek,
labdata, labtech) becomes **two topic pages**:

- **The course page** keeps the module's name, id, slug and URL: *Atoms &
  Electrons*. Basics + Core. Everything on it is grade 11–12 course level.
  Nothing on it mentions a contest.
- **The contest page** is a new topic: *Atoms & Electrons — Contest*, its own
  slug (`atoms-and-electrons-contest`), its own card in the menu and the
  sidebar, its own quiz and progress bar, with the course page as its
  prerequisite. The current "Exam‑level reference", the Gold questions, the
  advanced simulations and the challenge ladder live here.

25 topics become 34. The advanced (CCO/IChO) modules are untouched.

### How to split without breaking what works

The content model keys everything on the **module** (question ids `qua-…`,
`QuizQ.topic`, `toExamTopic`, skills, the attempt log, `byModule`,
`ladderFor`). None of that should move. So the split is a **presentation of
one module on two pages**, not two modules:

- `TopicMeta` gains `layer: 'course' | 'contest'` and, on a contest page,
  `parent: ModuleId`. The contest page's questions, ladder and stats are the
  parent's; only which blocks it *shows* differs.
- Every theory block and sim card carries a `level` (`basics | core |
  contest`). One `TabDef.mount` builds all blocks as today; `topicPage(pageId,
  …)` keeps the blocks whose level belongs to that page's layer (course →
  basics + core; contest → contest) and orders them Basics before Core.
- The quiz bank is one array in one order: positions 1–10 Bronze, 11–20 Core
  (tier 2), 21+ Contest. The course page runs `quiz(BANK.slice(0, 20), [10])`
  (two stages, Basics → Core); the contest page runs `quiz(BANK.slice(20))`.
  Ids never change; `MODULE_QUIZ_SIZE` is keyed by page id (20 for the course
  page, the rest for the contest page) so each progress bar has the right
  denominator; the registry's per‑module views are unchanged.
- The sidebar's lazy loader (`LAZY` in main.ts) maps both page ids to the same
  module file. The router, prerender, sitemap and `test-router.mjs` derive
  from `TOPICS`, so the nine new slugs appear once the entries exist.
- Prereqs: contest page requires its course page. The **Start‑here** run
  lists course pages only. The `ccc-foundation` run lists the contest pages.
  `recommendNext` follows prereqs, so a student who finishes a course page is
  offered its contest page next.

### The level below CCC

The course pages need a badge, and none of the four contests is honest for
them (the owner's point: the CCC is harder than the course). **Add a fifth
level at the bottom of `COMPS`: `hs`, label "High school course", short
"HS".** `comps` is an upward closure from the lowest level in `difficulty`,
so HS content is in scope for every mode, which is exactly right. Course
pages carry `difficulty: ['HS']`; contest pages inherit the module's current
difficulty (`['CCC']`, `['CCC','USNCO']`…). The menu's Level filter gains
"HS — the grade 11–12 course"; `tierOf`'s floor for an HS‑only module is
Silver (tier 2) which now means Core, so the derived default stays true.
This is the one taxonomy change in the plan; it is the badge the split needs
and nothing else.

### What each page holds

| | Course page (existing id and URL) | Contest page (new) |
| --- | --- | --- |
| Overview | rewritten intro, course register | short new intro: what a contest adds, prerequisite named |
| Theory | Basics block (exists) · **Core block (new, Prompt 14)** | "Contest reference" (the current exam‑level block, retitled) |
| Simulations | Basics + Core sims from the table below | Contest sims |
| Quiz | positions 1–20, stages Basics → Core | positions 21+ |
| Challenge ladder | none; a quiet "Ready for contests? → <title> — Contest" link | the existing ladder |
| References | the module's | the module's |
| Badge | HS | the module's current levels |

**Simulation levels** (author order kept within a level):

| Module | Basics | Core | Contest |
| --- | --- | --- | --- |
| Moles & Solutions | Limiting reagent visualizer | Solution chemistry tools · Percent yield | — (contest page has quiz + ladder + reference only) |
| Atoms & Electrons | Electron configuration builder | Energy levels & spectral lines · Orbital shapes (the orbital viewer, retitled) | Radial distribution |
| Periodicity | Periodic trends explorer | — | Anomalies, diagonals & amphoterism |
| Bonding & Molecular Shape | VSEPR geometry explorer | — | MO diagram |
| Thermodynamics I | Calorimetry | ΔH from bond enthalpies | Born–Haber cycle |
| Equilibrium | Live N₂O₄ ⇌ 2NO₂ | ICE table solver | Ksp |
| Acids, Batteries & Reaction Rates | Titration simulator | Galvanic cell builder · Integrated rate laws · Electrolysis / Faraday | Buffer designer · Latimer diagram · Arrhenius |
| Lab & Data | Sig fig counter · Glassware | Beer's law · Titration technique · Error direction | Uncertainty propagation · Q‑test · Functional‑group tests · Cation/anion & gas tests |
| Lab Technique | Recrystallization | Distillation · Extraction · Standard‑solution prep · Filtration/drying/safety | Chromatography |

A contest page with no sim of its own (Moles) is still a page: reference,
quiz, ladder. The page contract (`sims` non‑empty) is relaxed for
`layer: 'contest'` pages, not for course pages.

### Not doing

- Two module files per topic. One file, two pages; the content model does not learn about the split.
- Splitting the advanced modules. Their readers already have the middle.
- A per‑page "show contest material" toggle. The split makes it unnecessary.

- [ ] **6.1** `hs` level; `layer`/`parent` on TopicMeta; level tags; two pages per module; quiz slicing; MODULE_QUIZ_SIZE per page; prereqs and runs; router/prerender/sitemap (Prompt 13, engineering).
- [ ] **6.2** Core theory block on each of the nine modules (Prompt 14, content). Runs alongside 6.1.
- [ ] **6.3** Core questions: triage plus new, positions 11–20 tier 2 (Prompt 15, content). After 6.1 and 6.2.
- [ ] **6.4** Intros for the nine course pages (rewrite to course register) and the nine contest pages (new, short) (Prompt 16, content). After 6.1.
- [ ] **6.5** Show it to the friends: "Start Atoms & Electrons and tell me when it first feels too hard."

### Prompt 13 — Two pages per module

```
Read CLAUDE.md in full (pages & routing, the page contract, topics.ts as
the single source of topic metadata, the content model, competition
modes), plan3.md "Phase 6" in full (it is the spec; its tables are
authoritative), then: src/topics.ts (TopicMeta, TOPICS, PATHS,
moduleProgress, renderTopicCard), src/content/topicIds.ts (COMPS,
COMP_LABEL, COMP_PLAIN, MODE_SHORT in mode.ts, compsForDifficulty,
ceilingRank, ModuleId), src/content/counts.ts, src/content/registry.ts
(tierOf, ladderFor, auditTopicPages), src/main.ts (LAZY, DEFS, the
sidebar), src/router.ts, scripts/prerender.mjs, scripts/test-router.mjs,
scripts/test-spine.mjs, src/tabs/page.ts (topicPage, simBlocks, block,
the DEV contract checks), src/tabs/framework.ts (theory, card,
cardWithMissions), src/tabs/ui/quiz.ts (quiz(BANK, warmupCount) and the
checkpoint), src/tabs/challenge.ts (challengeLadder(id)), src/recommend.ts,
src/mode.ts, src/guide.ts + guides.ts (inScope), src/icons.ts (badges),
and the nine module files: stoich, quantum, periodicity, bonding, thermo1,
equilibrium, aek, labdata, labtech.

Deliver, in separate reviewable hunk groups, no commits:

A. The HS level. Add 'hs' FIRST in COMPS with COMP_LABEL "High school
course", COMP_PLAIN "The grade 11-12 course, before any contest",
MODE_SHORT "HS", a badge in icons.ts matching the existing set (no emoji),
menu Level pill + select option, and difficulty string 'HS' accepted by
compsForDifficulty/ceilingRank (rank 1; CCC becomes 2, etc. — check every
place that compares ranks or hard-codes 'CCC' as the lowest, including
tierOf's floor logic, guides.ts inScope text, and tests). Modes: 'hs' is a
valid Mode; in HS mode only HS-tagged pages are in scope.

B. TopicMeta gains `layer: 'course' | 'contest'` (default 'course' for
every existing entry; add it explicitly) and optional `parent: ModuleId`.
For each of the nine modules add a contest entry directly after it in
TOPICS: id `<id>-contest`, slug `<current-title-slugified>-contest`
(atoms-and-electrons-contest, moles-and-solutions-contest, …), title
"<Title> — Contest", same group and icon, difficulty = the module's
current difficulty, prereqs [<id>], layer 'contest', parent <id>, intro
placeholder EXACTLY "" (Prompt 16 writes it; an empty intro must render as
no Overview paragraph, not as an empty box), refs = parent's. The nine
course entries get difficulty ['HS'] and keep everything else. estMinutes:
course page keeps the current number for now; contest page 25.

C. Level tags. theory(title, html, open, level) and an options bag on
card()/cardWithMissions() (or the smallest equivalent) set data-level
('basics' | 'core' | 'contest', default 'contest'). Tag the nine modules'
blocks per the Phase 6 sim table; Basics theory blocks 'basics'; the
exam-level blocks 'contest', retitled "Contest reference — <Title>".
Retitle the quantum orbital viewer "Orbital shapes" (URL of that section
changes; update test-router if it lists it).

D. Two pages, one mount. LAZY/DEFS in main.ts register both page ids to
the same module loader. TabDef.mount receives the page id (or topicPage
reads it from the route) and topicPage(pageId, blocks) keeps blocks whose
level matches the page's layer (course: basics then core, author order
within each; contest: contest). Course pages get no challenge ladder but a
quiet link card "Ready for contests? <Title> — Contest" after the quiz;
contest pages get the ladder (challengeLadder(parent)). The page contract:
`sims` may be empty on a contest page (Moles has none) — relax the DEV
check for layer 'contest' only. Breadcrumb, prev/next, section chips and
"In this topic" work per page as today.

E. Quiz slicing. Course page: quiz(BANK.slice(0, 20), 10) — stages
"Basics" and "Core" (rename the second stage label from "exam-style" to
"Core"). Contest page: quiz(BANK.slice(20), 0). MODULE_QUIZ_SIZE keyed by
page id: course 20, contest = bank length − 20. moduleProgress() must
count solved ONLY among that page's questions: it needs the page's id
list — expose a cheap PAGE_QUESTION_IDS map from counts.ts or compute from
the bank slice inside the module and register it; pick the one that keeps
counts.ts free of bank imports (CLAUDE.md: home/menu must not import
banks). auditTopicPages: bank-size floor becomes per page (course = 20
exactly, contest ≥ 5). Until Prompt 15 lands, positions 11–20 are a mix —
expected; say so in the report.

F. Runs and prereqs. Start-here lists course pages only (unchanged ids).
ccc-foundation lists the nine contest pages in its current order. Guides:
inScope uses difficulty, so contest pages appear in CCC guides and course
pages in none — confirm and report; if the CCC guide should also show the
course pages as "start here", add one sentence, no mechanics.

G. Verify: `npx tsc --noEmit && npm run audit && npm run build` (34 topic
pages prerendered + guides + menu; sitemap lists the nine new slugs;
test-router covers them; test-spine passes with the prereq chain). Dev
server (Browser preview "chemprep", http://127.0.0.1:5174):
/topic/quantum-and-atomic-structure shows Overview · Basics · Electron
configuration builder · Energy levels & spectral lines · Orbital shapes ·
Quick quiz · Ready for contests · References, badge HS; /topic/
atoms-and-electrons-contest shows Overview · Contest reference · Radial
distribution · Quick quiz · Challenge ladder · References with a
prerequisite line naming Atoms & Electrons; /menu shows 34 cards with the
HS filter working; sidebar lists both under Foundations; screenshots at
1440 and 375; scrollWidth 375. Answer the first ten questions on the
course page and see "Basics complete"; check the contest page's progress
bar denominator equals its bank slice.

Report: per hunk group what changed; every place 'CCC'-as-lowest was
assumed and what you did; the new slugs; anything in the spec you could
not do as written.
```

### Prompt 14 — Core theory blocks

```
Read CLAUDE.md, docs/STYLE.md in full, plan3.md "Phase 6", and, for each
of stoich, quantum, periodicity, bonding, thermo1, equilibrium, aek,
labdata, labtech: the module's Basics block, its Contest reference block,
and its quiz bank (find it in src/tabs/questions*.ts).

Write ONE Core theory block per module: theory('Core — <plain title>',
html, true, 'core') placed in the `theory` array between the Basics block
and the Contest reference (Prompt 13 adds the level argument; if it has
not landed yet, place the block second, omit the argument, and say so).
500–800 words, house markup (h3, p, ul/li, span.eq). Register: the grade
11–12 course as taught — not first contact (Basics did that), not the
contest (the reference does that). STYLE.md applies in full, including
rule 4 (no exam culture). Every skill gets: the idea in two sentences, one
worked example with real numbers, then the general form. Open with two
sentences on what Core adds to Basics; close with an h3 "What you should
be able to do now" and three to five bullets.

Scope per module (cover these; nothing from the Contest column):
- stoich: mole ratios in a balanced equation; mass→mol→mass; limiting
  reagent with leftover; percent yield; molarity, dilution (c1V1 = c2V2),
  molar concentration of ions; empirical formula from % composition.
- quantum: shells, subshells, orbitals and the 2/8/18 pattern; the
  filling order to Kr; core vs valence electrons; configurations of ions;
  the periodic table's s/p/d blocks; why the group number gives valence
  electrons; light as photons, E = hc/λ, absorb vs emit.
- periodicity: atomic radius, ionic radius, first ionisation energy,
  electronegativity, electron affinity — the trends and the reason (Zeff
  and shells), with values; metallic character; predicting which of two
  atoms is bigger or more electronegative.
- bonding: Lewis structures with lone pairs and formal charge; VSEPR for
  2–4 groups with angles; polarity from shape plus ΔEN; sigma and pi;
  intermolecular forces (dispersion, dipole, hydrogen bonding) and boiling
  point.
- thermo1: q = mcΔT with both substances; ΔH per mole from calorimetry;
  exothermic/endothermic diagrams; Hess's law with a two-step worked
  example; bond enthalpies to estimate ΔH.
- equilibrium: writing Kc and Kp; ICE tables with a worked example
  (small-x where valid, with the 5% check); Q vs K; Le Chatelier for
  concentration, pressure, temperature; why catalysts do not move K.
- aek: strong vs weak acids and Ka; pH of strong acids/bases; conjugate
  pairs; neutralisation stoichiometry and titration calculations to the
  equivalence point; oxidation states and half-equations; a galvanic cell
  and E°cell = E°cathode − E°anode; rate = Δ[ ]/Δt, rate laws and order
  from data; collision theory and catalysts.
- labdata: significant figures in a calculation; precision vs accuracy;
  glassware tolerances; reading a burette; Beer's law A = εlc with a
  calibration line; simple error direction (a wet flask, an air bubble).
- labtech: recrystallisation and choosing a solvent; simple vs fractional
  distillation; extraction and which layer is which; preparing a standard
  solution; filtration; drying agents; safety basics.

Textbook values only; name the source per module in the report. No emoji.
Do not edit questions, page.ts, quiz.ts, topics.ts or style.css. Do NOT
commit. After all nine: `npx tsc --noEmit && npm run audit`; report word
counts and any scope item you left out and why.
```

### Prompt 15 — Core questions

```
Read CLAUDE.md fully (ids permanent; skills frozen at 81; counts.ts;
ORIGINAL questions only), docs/STYLE.md, plan3.md "Phase 6", the Core
blocks from Prompt 14, src/content/registry.ts tierOf(), scripts/
test-bronze.mjs, scripts/backfill-ids.mjs, scripts/deskew-answers.mjs,
and how Prompt 13 slices each bank (positions 1–20 = course page, 21+ =
contest page).

For each of the nine modules' banks:
1. Triage every question from position 11 onward: answerable from the
   Core block → `tier: 2`; needs the Contest reference → `tier: 3` (or
   keep an existing tier 3/4). Write the decision per id in your report.
2. Reorder the bank so positions 1–10 stay the Bronze ten, 11–20 are ten
   tier-2 questions, 21+ the rest. Ids do not change. If a bank has fewer
   than ten tier-2 questions, write new ORIGINAL ones to reach ten: Core
   register, three-step `why`, misconception only where real, skill from
   the frozen 81 or untagged, ids from backfill-ids.mjs (dry-run, read,
   apply), answer positions spread across A–D per module (deskew rule on
   new ids only, as Phase 3.1 did). No contest vocabulary in positions
   1–20 (grep for olympiad/CCC/CCO/trap/classic in q, opts, why).
3. Update counts.ts (per-page MODULE_QUIZ_SIZE, CORPUS_COUNTS.mc) and
   extend scripts/test-bronze.mjs to assert positions 11–20 are tier 2 for
   the nine modules. `npx tsc --noEmit && npm run audit && npm run build`
   must pass.
4. Re-estimate estMinutes for the nine course pages in topics.ts (+10–15
   each, your judgement from the Core block length) and say what you set.

Every value textbook-correct. Report per module: triage table, new ids,
counts, and any question you are less than fully confident about. Do NOT
commit.
```

### Prompt 16 — Intros for eighteen pages

```
Read CLAUDE.md, docs/STYLE.md, plan3.md "Phase 6", src/topics.ts (the
nine course entries and their nine -contest siblings), and each module's
Core block (Prompt 14) and Contest reference.

Course pages: rewrite the nine intros for the course register — what the
topic is, what the student can do after Basics + Core, no contest
vocabulary at all, ≤ 60 words, one <b> for the key habit. Contest pages:
write nine new intros, ≤ 50 words: the first sentence names the
prerequisite in plain words ("Do Atoms & Electrons first."), the second
says what a contest adds (the specific extra ideas — nodes, PES, the
anomalies), no exam mechanics, no "marks"/"trap"/"classic" (the word
"contest" itself is fine here: it is the page's subject). Also write the
nine contest pages' blurbs (one plain sentence each). Do not touch any
other field. `npx tsc --noEmit && npm run audit && npm run build`
(prerender must emit the new descriptions). Do NOT commit. Report word
counts.
```

### Order of operations

```
Prompt 13 (two pages, engineering) ─┬─ Prompt 15 (Core questions) ── Prompt 16 (intros)
Prompt 14 (Core theory)  ───────────┘
```

13 and 14 run in parallel (disjoint files: 14 touches only the nine module
files' theory arrays; 13 touches everything else — if 13 also needs to edit
those files for tags, run 14 first and 13 second instead). 15 needs both;
16 needs 13.

## Found while executing

- **Warm-ups that are not warm-ups.** In the CCO-tier modules the first five
  questions are definitional questions about advanced material, not beginner
  questions. Rewritten in place (ids never move); Phase 3 should decide whether
  these modules get real Bronze questions or whether Bronze is simply out of
  scope there. Clearly beyond a beginner: `ain-001`, `ain-003`, `ain-005`,
  `phy-001`–`phy-004`, `coo-001`, `coo-003`, `coo-005`, `og3-001`, `og3-005`.
  Borderline: `ain-002`, `ain-004`, `coo-004`, `og3-004`, `ana-003`.
  **Decided (owner, 2026-09-03): leave as is.** Bronze is out of scope for
  the CCO/IChO modules; their first five stay definitional, with the `why`
  rewritten to define the term in-sentence.
- **Two factual errors fixed in passing:** `bon-005` quoted ΔEN 2.1 for NaCl
  (Pauling 0.93 vs 3.16 → about 2.2); `qua-016` said the photoelectric effect
  "killed the wave model".
- **Prompt 2's `ch` finding:** in this sans stack `1ch ≈ 0.63em`, so a target of
  N characters needs roughly `0.87N ch`. `--measure` is 60ch (~73 characters).

## Feedback round 2

_(empty — fill after Phase 3)_

## Carried over

plan.md, plan2.md, frontend.md and revamp.md were four overlapping ledgers.
Their open items are below, one line each, keeping the original id or number
and the source's own HUMAN / BLOCKED / DEFERRED / DECIDED marking. The four
files are deleted; ROADMAP.md stays as the record of Phases 0–I.

### From plan.md (the five typography/chrome passes)

Checked against the current `src/style.css` and the git log rather than taken
on trust:

| Pass | State |
| --- | --- |
| 1 — type scale | **shipped.** `--f-1`…`--f-6` exist in `:root` (values since retuned by 1.2 above); `#progress-link` and `.btn` inherit the app font; no Arial/Times in the probe. |
| 2 — colour audit | **shipped** (revamp F1 measured 23 distinct hex literals against a target of 30; 47 uses, all on dark panels or `#fff`). |
| 3 — mono discipline + line-height roles | **shipped.** `--lh-tight/ui/body/loose` exist; `.mode-btn` no longer exists at all; `.nav-group-n` is `--f-1`. The probe's "≤ 5 distinct line-heights" target is unreachable as written — five ratios over a six-step scale cannot yield five pixel values — recorded, not chased. |
| 4 — topic-page chrome | items 1 and 2 **shipped** (breadcrumb + prereq merged into one `#topic-chrome` row; stepper is a single scrolling row on mobile and deliberately wraps ≥ 901 px, a reversal with its reason in the CSS). Item 3 open, below. |
| 5 — tap targets + section chrome | **shipped** by revamp F1 (44 px overlays on bookmark / helpful / search-dismiss; `.section-step` equal flex basis; `transition: all` replaced by named properties). |

- [ ] **plan.md pass 4, item 3** — sticky breadcrumb row on scroll. `DEFERRED`
      by the plan itself: "do not do it at all if 1 and 2 bring content above
      the fold." 1 and 2 shipped, so this needs a measurement before it needs
      an implementation.

### From plan2.md

- [ ] **plan2 §4** — Check loading states.
- [ ] **plan2 §4** — Check error states.
- [ ] **plan2 §5** — Test with a screen reader. `HUMAN` (semantics are
      verified; what VoiceOver/NVDA actually announces is not). Same gap as
      revamp F3.
- [ ] **plan2 §7** — Separate animation helpers out of `framework.ts`.
      Opportunistic only — E1 already took the quiz seam.
- [ ] **plan2 §7** — Remove dead code after refactors.
- [ ] **plan2 §8** — Check mobile performance (frame rate on a real phone).
      `HUMAN`.
- [ ] **plan2 §8** — Check startup time on slower hardware. `HUMAN`.
- [ ] **plan2 §11** — The observation protocol behind 4.4: watch students use
      it unexplained, record hesitation / confusion / what they skip / what
      they return to, ask which questions feel unfair or too easy, compare
      desktop vs mobile, turn findings into issues. `HUMAN`.
- [ ] **plan2 §12** — Get ChemPrep in front of CCC/CCO students. `HUMAN`.
- [ ] **plan2 §12** — Collect feedback. `HUMAN`.

Dropped as already covered here: §1 "Upgrade weak explanations" → Phase 2
(2.3 + 2.5); §2 "Separate plain text from trusted HTML" and §2 "Make the
dangerous API explicit, `trustedHtml(...)`" → 4.1 / Prompt 11; §11 "Give
ChemSim to actual students" → 4.4; §12 "Improve landing-page messaging" →
2.6. Dropped as answered elsewhere: §3 analytics retention → revamp D3
(shipped: `signals` 12 months, progress data indefinitely, written into
`0003_signals.sql`); §3 database deployment → done, migrations 0001–0007
applied and smoke-tested. §9 search/sorting and §12 acquisition analytics were
declined, not missed — see Standing decisions.

### From frontend.md

Weeks 1–3 all shipped (items 1–9 and Week 3's 0–5). Its own Deferred list
carries over unchanged, all `DEFERRED`:

- [ ] **frontend Deferred** — sticky Learn / Practice / Prove rail.
- [ ] **frontend Deferred** — a generic "Show me" tween on every sim.
- [ ] **frontend Deferred** — misconception clustering.
- [ ] **frontend Deferred** — the full `/today` dashboard (the route ships the
      Continue block only).
- [ ] **frontend Deferred** — inline landing-page onboarding question.
- [ ] **frontend Deferred** — micro-interactions and success animations.

Dropped as already covered here: "token retrofit across `style.css`" → the
"Not doing" entry above (only the tokens and the reading measure change).

### From revamp.md

Tracks S, D, Q, E and A are closed; F1, F2, F4, F5 shipped. Open:

- [ ] **revamp F3** — Real-device sweep: iPhone Safari, landscape phone,
      keyboard-only, screen reader, 200 % zoom. `HUMAN`. A headless viewport
      resize is not this.
- [ ] **revamp A2** — `why2` from evidence: high wrong-rate → inspect → write
      the alternate explanation. `BLOCKED` on real traffic.
- [ ] **revamp P1** — Ship to students. `HUMAN`. Its gate (S4, the signals
      rate limit) is now live. 4.4 above is the first, smallest version of it.

### Standing decisions

Principles, not tasks — from plan2's "Things I would NOT work on yet",
revamp's "Not doing" and plan.md's non-scope, deduplicated against this file's
own "Not doing" (which already covers new modules, a new tier, another visual
redesign, AI explanations and the spacing sweep):

- **No gamification.** XP, badges, leaderboards. Not the bottleneck.
- **No more dashboards.** Useful signals, not mission control.
- **No framework rewrite.**
- **No Postgres tuning for imaginary scale.** Four tables, one developer.
- **No dark mode.** The dark panels are a contrast device inside one theme,
  not a half-built second theme; a real one is a separate project with its own
  contrast matrix.
- **No new accent.** One flame accent is the identity.
- **No third-party acquisition analytics.** `signals` is first-party and
  already there; a tag would mean widening a CSP that has no `unsafe-inline`
  and no `unsafe-eval`.
- **Question-bank search and sorting: leave them.** Measured at 0.1–2.8 ms,
  returning modules and questions; no concrete deficiency to fix.
- **No content changes as a side effect of a visual pass.** Chemistry prose
  changes only under a content item.
