# D3 — Homepage section order, and stats that are true

**ROADMAP:** Phase D.3 · **Estimate:** ~3 hours

## Why

Two problems. The section order buries the proof, and **the numbers on the page
are wrong.**

`src/home.ts` currently hard-codes:

```ts
const statDefs = [
  { n: 18,  suffix: '',  label: 'interactive modules' },
  { n: 65,  suffix: '+', label: 'simulations & tools' },
  { n: 650, suffix: '+', label: 'practice questions' },
  { n: 90,  suffix: '+', label: 'key equations' },
];
```

There are **25** modules, and `node scripts/audit-corpus.mjs` reports **853 MC +
105 written = 958 items**. The hero copy underneath says "Twenty-five
interactive modules … 850+ exam-style questions, 66 multi-part written
problems", which contradicts the strip directly above it. On a site whose whole
promise is numerical accuracy, the homepage cannot be the least accurate page.

## Files

- `src/home.ts` — section assembly (`buildHome`), stats strip, hero copy
- `src/content/registry.ts` — `CORPUS_COUNTS`, `corpusBreakdown()` (already exist)
- `src/topics.ts` — `TOPICS` (module count)
- `src/style.css` — styles for the new sections

## What to change

### 1. Drive every number from the source

- Modules → `TOPICS.length`
- Questions → `CORPUS_COUNTS` (already exported and already used by the dev
  audit in `src/main.ts`)
- Written problems → the FRQ count from the same source
- Simulations / equations: if there is no source of truth, **remove the stat**
  rather than keep a number nobody can verify. A four-stat strip with four true
  numbers beats a six-stat strip with two invented ones.

Fix the hero paragraph to agree with whatever the strip now says. This is copy
about the product, not chemistry content, so it is in scope for you — but keep
it to the numbers and the existing voice; don't rewrite the pitch.

### 2. Section order

Target order, from the product review:

| # | Section | State |
| --- | --- | --- |
| 1 | Hero | exists — keep, incl. the live `makeHeroSim()` canvas |
| 2 | Why ChemPrep | exists as `features` ("Why it works") — renumber to 01 |
| 3 | Interactive demo | **new** — one real, touchable simulation |
| 4 | Learning paths | **new** — reads a `PATHS` array; three paths |
| 5 | Competition modes | **new** — static CCC/USNCO/CCO/IChO scope explainer |
| 6 | Topic categories | exists as `topics` — regroup by domain |
| 7 | Question statistics | exists as `stats` — move down, drive from the corpus |
| 8 | Footer | exists as `home-end` |

Keep the `.sect-head` + `.sect-no` numbering pattern and renumber the labels to
match the new order. Keep the `IntersectionObserver` reveal and the count-up;
both must still respect `prefers-reduced-motion`.

### 3. New section 3 — interactive demo

Not a screenshot and not a second hero canvas. Embed one existing simulation
that is cheap to run and reads instantly — the equilibrium N₂O₄ ⇌ 2NO₂ card is
the best candidate — with one or two controls and a "Open the full module"
button. Mount it lazily (`IntersectionObserver`, like the hero sim) so it costs
nothing until it scrolls into view, and stop its loop when it scrolls out.

### 4. New section 4 — learning paths

Data, not code. Add to `src/topics.ts`:

```ts
export interface LearningPath {
  id: string; title: string; blurb: string; topicIds: readonly string[];
}
export const PATHS: readonly LearningPath[] = [ … ];
```

Three paths, built **only from existing module ids** — e.g. a CCC foundation
run, an organic run, a CCO/IChO advanced run. Render each as a card with its
module count, summed `estMinutes`, and the difficulty badges already used by
`renderTopicCard()`.

Ordering the modules within a path is a curriculum decision. Use `TOPICS` order
and the existing `prereqs` as your first cut, and **flag in your summary that
the paths need a content review** — they will be checked before launch.

### 5. New section 5 — competition modes

A static four-card explainer: CCC, USNCO, CCO, IChO — what each is, roughly who
it's for, and which difficulty badge maps to it. Use the existing badge
components from `src/icons.ts` / `difficultyBadges()`; do not invent a second
badge style. **Write only what you can source from `TopicMeta.difficulty` and
the existing badge tiers** — no claims about exam dates, formats, cutoffs or
qualification rules. Leave the per-competition prose as a short factual line
each; it will be reviewed.

### 6. Section 6 — regroup the topic grid

`TOPICS.map(...)` renders one flat run of 25 cards. Group it by
`TopicMeta.group` with a subheading per domain, in `TOPICS` order. Keep
`renderTopicCard()` as the single card renderer — extend it if you need
something, never fork it.

## No testimonials

The review suggested a testimonials section. There are no real testimonials, so
there is no testimonials section. Do not add placeholder ones, not even
obviously-fake sample text — a fabricated quote on a study site is the fastest
possible way to lose a student's trust in the chemistry.

## Acceptance criteria

- [ ] Every number on the homepage matches `node scripts/audit-corpus.mjs` and
      `TOPICS.length`, and the hero copy agrees with the stats strip
- [ ] Sections appear in the order above, correctly numbered
- [ ] The demo sim starts only when scrolled into view and stops when it leaves
- [ ] Learning-path cards derive titles, times and badges from `TOPICS` — no
      duplicated metadata
- [ ] The topic grid is grouped by domain and still uses `renderTopicCard()`
- [ ] Scroll reveals, count-up and any new motion respect
      `prefers-reduced-motion`
- [ ] No emoji; no new colours outside the existing CSS variables
- [ ] Mobile layout at 375 px has no horizontal scroll

## Verification

```bash
npx tsc --noEmit && npm run build && node scripts/audit-corpus.mjs
```

Live at desktop and 375 px. Confirm the demo sim's loop actually stops
(devtools performance or a `console.count` you remove afterwards). Report the
final numbers you put on the page.

## Out of scope

Making learning paths adaptive or progress-aware (Phase E/F), making the
competition cards interactive filters (Phase G), SEO metadata (Phase I.1).
