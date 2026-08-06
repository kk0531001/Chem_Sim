# D2 — Collapsible sidebar sections and a mobile drawer

**ROADMAP:** Phase D.2 · **Estimate:** ~3 hours

## Why

The sidebar renders 25 buttons in eight permanently-expanded groups. The
grouping exists in the data and is invisible in use — you scroll a wall of
labels to find anything.

**What is already true, and must not be "fixed":** the domain taxonomy
(Playground · Foundations · Physical Chemistry · Organic Chemistry · Inorganic
Chemistry · Laboratory Skills · Spectroscopy · Practice) already lives in
`src/topics.ts` and is mirrored by `DEFS` order in `src/main.ts`. There is no
"Advanced Physical" bucket to break apart. **This is a presentation change
only.** Do not add, remove, rename, split or reorder any module.

## Files

- `src/tabs/framework.ts` — the nav-building loop in `initTabs`
- `src/style.css` — `#sidebar`, `#nav-items`, `.nav-group`, `.nav-group-items`,
  `.nav-item`
- `index.html` — only if the drawer needs a toggle button in the shell

## What to change

### 1. Collapsible groups

Rebuild the nav loop in `initTabs` around native `<details>` / `<summary>`:

```html
<details class="nav-group" open>
  <summary class="nav-group-head">Physical Chemistry <span class="nav-group-n">7</span></summary>
  <div class="nav-group-items" role="group">…nav-item buttons…</div>
</details>
```

`<details>` is keyboard-operable, announced correctly, and has no focus
management to get wrong. **Do not hand-roll a disclosure with a `<div>` and a
click handler.** Keep `role="group"` and the `aria-labelledby` relationship the
current code already sets up — that grouping is deliberate and accessible.

Style the marker with CSS (a rotating chevron from `src/icons.ts`); do not use
an emoji or a text arrow glyph.

### 2. Open/closed behaviour

- **The group containing the active topic is always open**, whatever the stored
  state says, and re-opens on every navigation into it.
- Everything else restores from `localStorage` (one key, e.g.
  `chemprep.nav.open`, holding the open group names).
- On a first visit with nothing stored: only the active topic's group is open.
- Persist on `toggle`.

A corrupt or absent stored value must fall back to the default, never throw —
same defensive posture as the rest of the storage code in `src/progress.ts`.

### 3. Item counts

`<span class="nav-group-n">` in each summary showing how many modules the group
holds, derived from the `defs` array — not a hard-coded number.

### 4. Mobile drawer

Under ~900 px the sidebar becomes an off-canvas drawer:

- A toggle button in the app header, labelled ("Topics"), `aria-expanded`
  correct, `aria-controls` pointing at `#sidebar`
- Opening traps nothing and closes on: selecting a module, `Escape`, or a click
  on the backdrop
- Focus moves into the drawer on open and returns to the toggle on close
- Transitions behind `prefers-reduced-motion`

Above the breakpoint the drawer markup must not change the current desktop
layout at all.

### 5. Scroll position

The sidebar keeps its scroll position across navigations, and the active item
is scrolled into view (`scrollIntoView({ block: 'nearest' })`) when a topic is
opened from outside the sidebar — e.g. a breadcrumb, a prev/next footer button,
or a cold URL load.

## Explicitly not in this order

The reviewer also asked to split Organic into eleven modules (Stereochemistry,
Alkenes, Alkynes, Carbonyls, …). **Do not.** It contradicts the roadmap's own
filter — depth in the 25 modules that exist beats a 26th — and would fragment
three coherent 25-question banks into eleven thin ones with no questions to
fill them. The underlying want is navigability, which is what this order
delivers. In-page section anchors within a module are a separate, later item.

## Acceptance criteria

- [ ] All eight groups collapse and expand, by mouse and by keyboard
      (Tab to the summary, Enter/Space)
- [ ] The active topic's group is open after a cold load of any topic URL
- [ ] Open/closed state survives a reload
- [ ] Counts are correct and derived
- [ ] Under 900 px the drawer opens, closes three ways, and manages focus
- [ ] Desktop layout is pixel-unchanged above the breakpoint
- [ ] `aria-current="page"` still marks the active item (it does today — don't
      lose it)
- [ ] Nothing about which modules exist, or their order, has changed

## Verification

```bash
npx tsc --noEmit && npm run build
```

Live: desktop and a 375 px viewport. Tab through the whole sidebar with the
mouse untouched and confirm every control is reachable with a visible focus
ring. Say which viewports you checked.

## Out of scope

Search (Phase F), progress bars in the sidebar (Phase E), topic filtering on
`/menu` (Phase F). This is the sidebar's structure only.
