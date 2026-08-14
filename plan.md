# Frontend polish plan — type, colour, chrome, controls

**Estimate:** ~9 hours across five independently shippable passes.

## Why, and what is deliberately NOT in scope

D.7 already collapsed radii (14 → 4), shadows (9 → 3) and durations (9 → 2)
into tokens, and it deliberately left the ~400 hard-coded spacing values alone,
with a stated reason: a mechanical sweep over spacing is a large invisible diff
with a real chance of nudging a layout that was tuned by hand, and the drift it
prevents is future drift, which the tokens prevent just as well.

**That decision stands. Do not mass-rewrite spacing.** `--s-*` is already used
126 times and every new rule uses it; that is the mechanism working.

What D.7 never did is the same collapse for **type**, and type is the scale
where the argument for collapsing is strongest — the values are visually
interchangeable, the inconsistency is the whole defect, and unlike spacing it
is checkable by machine. Measured on one topic page
(`/topic/acids-redox-and-kinetics/titration-simulator-acid-naoh`, desktop):

- **16 distinct font sizes visible in a single view**, stylesheet-wide 28.
  Ten of them are half-pixel (`9.5`, `10.5`, `11.5`, `12.5`, `13.5`, `14.5`,
  `15.5`, `16.5`, `17.5`, plus a browser-default `13.3333`).
- **12 distinct line-heights** in that same view; 14 in the stylesheet.
- Three different sizes doing the one job of "small quiet label":
  `.prereq-label` 11.5px, `.crumb-link` 12.5px, `.nav-item` 13.5px.
- **83 hex literals** outside `:root`, against 51 defined tokens.

None of this is visible as a bug. It is visible as the site not quite feeling
like one application, which is the thing D.7 set out to fix and finished
three-quarters of.

Ordering below is by payoff. Pass 1 is most of the win; pass 4 is the only one
that touches layout and should go last.

| Pass | What | Est. |
| --- | --- | --- |
| 1 | A type scale, and the two controls that escape it | 3 h |
| 2 | Colour audit: hex literals → tokens, contrast re-check | 2 h |
| 3 | Mono discipline and the vertical rhythm | 1.5 h |
| 4 | Topic-page chrome: 34% of the viewport before content | 2 h |
| 5 | Tap targets and the section chrome's own polish | 1 h |

---

## Pass 1 — A type scale

**Files:** `src/style.css` only.

Add to `:root`, beside the existing scales:

```css
--f-1: 11px;   /* eyebrow, meter caption, badge */
--f-2: 12px;   /* small label: breadcrumb, prereq, nav meter */
--f-3: 13px;   /* UI default: buttons, controls, table cells */
--f-4: 15px;   /* body copy */
--f-5: 19px;   /* card title (h2) */
--f-6: 26px;   /* page title (h1) */
```

Six steps, because the page already clusters into six roles — the 28 values
are those six roles plus drift. Then rewrite every `font-size` in the file to
the nearest step. Rules:

- **Round to the nearest step, do not preserve the half-pixel.** `12.5px` is
  not a considered value, it is what `13px` became when something next to it
  looked slightly large.
- The `clamp()` display sizes on the homepage hero stay as they are. They are
  fluid type doing a job the fixed scale cannot; they are not drift.
- `font-size: 0.5em` on `sub`/`sup` stays relative — it must track its parent.

**Two real bugs to fix in the same pass** (both are controls that never
inherited the app's font at all):

1. `#progress-link` renders in **Arial 13.3333px** — the UA default for
   `<button>`. It needs `font: inherit` like every other button. Grep for
   other `<button>`/`<input>`/`<select>` rules missing it; `.mission-dot` has
   the same hole (empty text, so it only shows as an inconsistent box).
2. `.card-reset` renders in **serif**, because `addReset()` appends it inside
   the card's `h2` and `.btn` never sets a family. A UI control in body serif
   is a slip, not a choice — give `.btn` an explicit `font-family: var(--sans)`.

**Check:** re-run the probe in the "How to verify" section below. Distinct
computed font sizes on a topic page must be ≤ 7 (six steps plus the hero
clamp), and no computed family may be Arial or Times.

---

## Pass 2 — Colour: 83 literals against 51 tokens

**Files:** `src/style.css`, and any inline `fillStyle`/`strokeStyle` in
`src/tabs/*.ts` the audit turns up.

Sort every hex literal into three buckets and treat each differently:

1. **Canvas and dark-panel colours** (`#ff8b3d`, `#7ae27a`, `#6fc3ff`, the
   `#2a3546`-family panel greys). These are legitimate per AGENTS.md — canvases
   always sit on dark panels and their palette is designed for that. But the
   ones that already have a token (`--accent-on-panel` **is** `#ff8b3d`, used
   raw in at least two places) must use it. Anything used more than twice and
   not yet a token becomes one: `--panel-ok`, `--panel-info`, `--panel-warn`.
2. **Paper-surface colours** that duplicate an existing token
   (`#f7f4ee`, `#fffdf8`, `#efeadf`, `#fff`, `#ffffff`). Straight substitution.
   `#fff` and `#ffffff` in the same file is the tell.
3. **One-offs with no token and one use.** Leave them, but add a comment
   saying what they are for. A one-use colour is not drift; an unexplained one
   is.

Then re-run the contrast check the `:root` comments already document. Two
things to verify rather than assume, because both were tuned once and have
since had new surfaces put under them:

- `--ink-faint` (#656a72) was measured at 4.96:1 on `--paper` and 4.54:1 on
  `--paper-3`. It is now also used on `--accent-wash` (the mission box) and on
  `--paper-2` cards. Measure those two.
- `.section-step-label` and `.section-pos`, both added in the pagination work,
  use `--ink-dim` at what will become `--f-1`/`--f-2`. Small text has the same
  4.5:1 requirement as body text — confirm, don't infer from the token's
  documented ratio on a different surface.

**No new accent.** One flame accent is the identity; this pass reduces the
palette, it does not extend it.

---

## Pass 3 — Mono discipline and vertical rhythm

**Files:** `src/style.css`.

AGENTS.md: *"Serif display type (`--serif`) for headings; mono only for
numbers."* Two places break it and both are chrome, so they break it on every
page:

- `.mode-btn` ("All", "CCC", "USNCO", "CCO", "IChO") is mono at 10.5px. The
  competition names are words. They are also the one control whose four states
  a reader compares at a glance, which is what the badge treatment is for —
  reuse the difficulty-badge styling rather than inventing a third.
- `.nav-group-n` is a count, so mono is correct — but at 9.5px it is below the
  scale's floor. It becomes `--f-1`.

Then line-height. 14 values (1, 1.3, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.68,
1.7, 1.75, 1.8) collapse to four, and unlike the type sizes these should be
set *by role on a container*, not per element:

```css
--lh-tight: 1.25;  /* display type, card titles */
--lh-ui:    1.4;   /* buttons, labels, table cells */
--lh-body:  1.6;   /* paragraphs, theory prose */
--lh-loose: 1.75;  /* the long-form intro and .section-lede only */
```

`1.68` and `1.65` next to each other in a stylesheet is the same defect as
`12.5px` next to `13px`.

---

## Pass 4 — The topic-page chrome

**Files:** `src/style.css`, `index.html` (chrome markup only), `src/main.ts`
(`updateTopicChrome`).

Measured on a 720px-tall desktop viewport, a topic page spends **245px — 34%
of the viewport — on chrome before the first card**: breadcrumb 47px,
"Recommended first" band 43px, stepper 109px (it wraps to two rows for a
13-section topic), plus margins. On a 812px phone it is 254px. The lesson
starts below the halfway line on a laptop.

This is the pass that touches layout, so it goes last and it is the one to be
conservative in. Three changes, in order of confidence:

1. **Merge the breadcrumb and the prereq band into one row.** They are both
   "where am I / what should I have read", they are adjacent, and each is a
   half-empty 45px line. One row, breadcrumb left, prereq chips right, wrapping
   under on narrow. Saves ~45px and removes a horizontal rule.
2. **Cap the stepper at one row on desktop too.** It already scrolls on mobile
   (P4 of the pagination work); the same `flex-wrap: nowrap` + overflow at all
   widths saves the second row on the seven modules with more than nine
   sections, and makes the control behave the same way everywhere. Verify the
   current pill still centres — that logic already exists and is width-agnostic.
3. **Only then** consider making the breadcrumb row sticky on scroll. Listed
   for completeness; do not do it in the same commit as 1 and 2, and do not do
   it at all if 1 and 2 bring content above the fold.

Do not touch the sidebar. It is 25 items in eight collapsible groups and it
already had its pass (D2).

---

## Pass 5 — Tap targets and the new section chrome

**Files:** `src/style.css`.

24 interactive elements render under 40px tall at 375px wide. The WCAG 2.2
target-size minimum (AA, 2.5.8) is 24×24 CSS px, which most of these clear;
the 44px comfortable minimum is what they miss. Fix the ones a student uses
mid-lesson on a phone, and leave the rest:

- `.mode-btn` at **20px** and `.crumb-link` at **15px** are the two genuinely
  hard to hit. Both need vertical padding, not a font-size increase.
- `.nav-item` at 30px is in the drawer, tapped repeatedly, and should reach 44.
- `.prereq-chip` at 22px is a link out of the lesson — 36px is enough.
- The account form (`INPUT` 28px, `.btn.primary` 31px) is touched once ever.
  Leave it.

While in here, the section chrome from the pagination work has two rough
edges it shipped with, both deliberate deferrals:

- `.section-step` uses `max-width: 42%` with no `min-width`, so a one-word
  section title ("Ksp") gets a button a third the width of its neighbour. Give
  the pair equal flex basis.
- The stepper's `.pill` styling is inherited from the tablist it replaced and
  still carries `transition: all var(--t)`. `all` is the one transition
  property that should never survive a polish pass — name the two properties
  that actually change (`color`, `border-color`).

---

## How to verify

Run this in the console on a topic page before and after each pass. It is the
same probe that produced the numbers in this document:

```js
(()=>{const s={},f={},l={};
document.querySelectorAll('#app *').forEach(e=>{if(!e.offsetParent)return;
  const c=getComputedStyle(e);
  if(!e.children.length&&e.textContent.trim()){
    s[c.fontSize]=(s[c.fontSize]||0)+1; f[c.fontFamily.split(',')[0]]=1; l[c.lineHeight]=1;}});
return {sizes:Object.keys(s).length, families:Object.keys(f), lineHeights:Object.keys(l).length};})()
```

| | now | target |
| --- | --- | --- |
| distinct font sizes on a topic page | 16 | ≤ 7 |
| distinct line-heights | 12 | ≤ 5 |
| families containing Arial / Times | yes | none |
| hex literals outside `:root` | 83 | ≤ 30, each commented |
| chrome height before first card (720px viewport) | 245px | ≤ 160px |

And the standing floor, unchanged: `npx tsc --noEmit` and `npm run audit`
clean, `:focus-visible` intact on every control touched (nothing may set
`outline: none` without putting an indicator back), `prefers-reduced-motion`
honoured, hover transitions ≤ 150ms (`var(--t)`), and both 375px and 1280px
checked by screenshot.

## What this plan does not do

- **No dark mode.** The site has one theme and the dark panels are a deliberate
  contrast device inside it, not a half-built second theme. Adding
  `prefers-color-scheme` support is a separate project with its own contrast
  matrix, not a polish pass.
- **No new component library, no CSS framework, no build step for styles.**
  2,981 lines of hand-written CSS with a documented token vocabulary is not the
  problem; the problem is the quarter of it that predates the vocabulary.
- **No spacing sweep**, per D.7 above.
- **No content changes.** Not one word of chemistry prose, per the standing
  rules in this directory.
