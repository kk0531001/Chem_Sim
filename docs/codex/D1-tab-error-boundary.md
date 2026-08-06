# D1 — Error boundary and teardown in the tab framework

**ROADMAP:** Phase D.1 · **Priority:** P0 · **Estimate:** ~1 hour

## Why

`initTabs` in `src/tabs/framework.ts` mounts a module like this:

```ts
let entry = roots.get(id);
if (!entry) {
  const root = h('div', { class: 'tab-root' });
  view.appendChild(root);
  const def = defs.find(d => d.id === id)!;
  entry = { root, handle: def.mount(root) };   // no guard
  roots.set(id, entry);
```

One throw inside any `mount()` propagates out through `showRoute` and leaves an
**empty** `.tab-root` in the view with the sidebar item highlighted — a page
that looks loaded and isn't. It also leaves a half-built entry out of `roots`,
so the next visit re-runs the same failing mount against a view that now has two
`.tab-root` children.

This has not bitten yet because every mount is synchronous and every tab is
statically imported. **D10 makes mounts async**, and then a slow network or a
failed chunk hits this path for real. Land the guard first.

Note for anyone who read the external review: this is *not* the cause of the
"18 of 24 pages are broken" report. That was a URL-slug bug, fixed in D0. This
work order is worth doing on its own merits, not as a fix for that symptom.

## Files

- `src/tabs/framework.ts` — `initTabs`, `TabHandle`
- `src/style.css` — `.tab-error`
- `src/main.ts` — only if `showRoute` needs to distinguish a failed mount

## What to change

### 1. Guard the mount

```ts
try {
  entry = { root, handle: def.mount(root) };
} catch (err) {
  console.error(`[tab] mount failed: ${id}`, err);
  root.replaceChildren();
  root.appendChild(renderTabError(def, id, err, retry));
  entry = { root, handle: undefined, failed: true };
}
roots.set(id, entry);
```

Cache the entry **either way** so a failed tab doesn't append a second
`.tab-root` on the next visit.

### 2. `renderTabError(def, id, err, retry)`

A `.tab-error` card containing:

- "Couldn't load {def.label}" as the heading
- The error message via `textContent` — **never `innerHTML`**; it can contain
  anything
- A **Retry** button that calls `onDestroy()` if present, drops the cached
  entry, removes the root from the DOM, and re-runs `show(id)`
- A link back to `/menu`

Do not offer `location.reload()` as the primary action — a full reload
discards unsaved progress state for a failure that is usually per-module.

### 3. `onDestroy` on `TabHandle`

`TabHandle` currently exposes `onShow` / `onHide`. Add an optional
`onDestroy?(): void`, called only on retry (and later, if a tab is ever
evicted). Every tab holding a Pixi application, a `requestAnimationFrame` loop
or a `setInterval` should cancel it there — otherwise each retry leaks a
canvas and a live loop.

Implement `onDestroy` in `src/tabs/sandbox.ts` at minimum (it owns the Pixi
app). For the rest, add it only where a loop or a canvas actually exists;
`grep -l "requestAnimationFrame\|setInterval" src/tabs/*.ts` finds them. **Do
not** restructure any simulation to make this fit — if a tab's teardown isn't
obvious, list it in your summary and leave it.

`onShow` / `onHide` semantics do not change.

### 4. Guard the lifecycle calls too

`prev?.handle?.onHide?.()` and `entry.handle?.onShow?.()` should each be
wrapped so that a throw in one tab's teardown cannot prevent the next tab from
mounting. Log and continue.

### 5. Styling

`.tab-error` uses the existing paper/ink reading surface, not a dark panel —
it is text, not an instrument readout. One accent border on the left; no new
colours.

## Acceptance criteria

- [ ] Temporarily throw at the top of one tab's `mount()` (e.g. `thermo1`):
      that page shows the error card, **every other tab still works**, and the
      sidebar does not claim the broken page loaded. Remove the throw before
      committing.
- [ ] Retry on the error card re-mounts and succeeds once the throw is removed
- [ ] Visiting a failed tab twice does not produce two `.tab-root` elements
      (check in devtools)
- [ ] Nothing renders homepage content on a failed mount
- [ ] The error message is escaped: a thrown `Error('<img src=x onerror=alert(1)>')`
      renders as literal text
- [ ] No behaviour change on the happy path — all 25 tabs still mount, with the
      same animation-gating on show/hide

## Verification

```bash
npx tsc --noEmit && npm run build
```

Plus the injected-throw test above, done live. State in your summary which tab
you broke and what you saw.

## Out of scope

Dynamic `import()` and loading skeletons are D10. This order only makes the
existing synchronous path fault-tolerant so that D10 is safe to attempt.
