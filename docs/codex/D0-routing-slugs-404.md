# D0 — Real slugs, a `notfound` route, and a 404 page

**ROADMAP:** Phase D.0 · **Priority:** P0 · **Estimate:** ~2 hours

## The bug, precisely

A reviewer reported that "18 of 24 topic pages are broken — the URL is right but
the homepage renders." That report is accurate. The diagnosis they offered
(failed lazy `import()`, PixiJS init crash, missing error boundary) is **wrong**
— tabs are statically imported in `src/main.ts` and `mount()` is synchronous, so
no chunk-load failure path exists. Do not go looking for one.

The actual cause is in `src/router.ts`:

```ts
const m = clean.match(/^\/topic\/([a-z0-9]+)$/i);   // no hyphen in the class
if (m) return { kind: 'topic', id: m[1] };
return { kind: 'home' };                            // silent, and no URL rewrite
```

Topic ids are internal short names — `thermo1`, `aek`, `labdata`, `organic1`,
`coordchem` — not slugified titles. So:

- `/topic/thermodynamics-i` fails the character class (no `-`), falls through to
  `{ kind: 'home' }`, and `showRoute` in `src/main.ts` renders the homepage
  while the address bar still shows the topic URL. **Silent wrong page.**
- `/topic/thermo9` passes the character class but fails `VALID_IDS`, and
  `src/main.ts` does `navigate({ kind: 'home' }, true)` — a silent
  `replaceState` to `/` with no explanation. **Second silent path.**

The pages that appeared to work are exactly the ones whose guessed slug happened
to equal the real id: `quantum`, `equilibrium`, `bonding`, `periodicity`,
`spectroscopy`, `polymers`.

Two things are wrong and both must be fixed: the URLs are not guessable, and an
unknown URL does not say so.

## Files

- `src/topics.ts` — add the slug fields (single source of topic metadata)
- `src/router.ts` — route parsing, the new `notfound` kind, slug resolution
- `src/main.ts` — `showRoute`, the 404 view
- `src/style.css` — styles for the 404 view
- `scripts/` or `src/router.test.ts` — the test (see "Tests" below)

## What to change

### 1. Slugs in `src/topics.ts`

Add two fields to `TopicMeta`:

```ts
slug: string;              // canonical, human-readable, kebab-case
aliases?: readonly string[];  // older URLs that must keep resolving
```

Every topic gets a `slug` derived from its title, and an `aliases` entry
containing its current bare `id` so existing links and bookmarks survive. The
`id` stays exactly as it is — it is the key for `DEFS`, `MODULE_EXAM_TOPICS`,
question-id prefixes and progress, and renaming it would be a data migration,
not a routing change.

Use these slugs (they are the titles, kebab-cased; do not invent your own):

| id | slug |
| --- | --- |
| `sandbox` | `particle-sandbox` |
| `quantum` | `quantum-and-atomic-structure` |
| `periodicity` | `periodicity` |
| `bonding` | `bonding-vsepr-and-mo-theory` |
| `stoich` | `stoichiometry-and-solutions` |
| `thermo1` | `thermodynamics-i` |
| `thermo2` | `thermodynamics-ii` |
| `gases` | `gases-imfs-and-phases` |
| `equilibrium` | `chemical-equilibrium` |
| `aek` | `acids-redox-and-kinetics` |
| `physchem` | `advanced-physical-chemistry` |
| `biophys` | `physical-and-biochemistry` |
| `organic1` | `organic-i-mechanisms` |
| `organic2` | `organic-ii-and-symmetry` |
| `organic3` | `organic-iii-synthesis` |
| `polymers` | `polymers` |
| `nuclear` | `nuclear-and-coordination` |
| `coordchem` | `coordination-and-organometallic` |
| `advinorganic` | `advanced-inorganic` |
| `labdata` | `lab-and-data` |
| `labtech` | `laboratory-techniques` |
| `analytical` | `analytical-and-quantitative` |
| `spectroscopy` | `spectroscopy-and-synthesis` |
| `structure` | `structure-determination` |
| `qbank` | `exam-question-bank` |

Add two lookups next to `topicById`:

```ts
export const topicBySlug = (s: string): TopicMeta | undefined => ...
```

resolving `slug` first, then `aliases`. Build the map once at module load, not
per call. A duplicate slug or alias must be impossible — add it to the dev-time
audit (see step 5).

### 2. `src/router.ts`

- Character class becomes `[a-z0-9-]+`, still case-insensitive, and the matched
  string is **lower-cased** before resolution so `/topic/Thermodynamics-I`
  works.
- `Route` gains a fourth kind:

  ```ts
  export type Route =
    | { kind: 'home' } | { kind: 'menu' }
    | { kind: 'topic'; id: string }
    | { kind: 'notfound'; path: string };
  ```

- `parseRoute` resolves the captured string through `topicBySlug` and returns
  `{ kind: 'topic', id }` with the **internal id**, so nothing downstream
  changes. Anything unresolvable — including a path that is not `/topic/*` at
  all — returns `notfound` carrying the original path.
- **`parseRoute` must never return `home` for a path that is not `/`.** This is
  the whole bug; a fallback to `home` anywhere in this function is a regression.
- `routeToPath` emits the canonical slug for a topic (`/topic/thermodynamics-i`)
  and, for `notfound`, the path it was given.

`parseRoute` importing from `topics.ts` is fine and intended — the router
resolving names through the metadata source is the point.

### 3. Canonical redirect

When a topic resolves via an **alias** rather than its slug, `history.replaceState`
to the canonical slug URL immediately. One page, one URL — this is also the
`<link rel="canonical">` that Phase I.1 will need. `pushState` here would put a
dead entry in the back stack; use `replaceState`.

### 4. The 404 view in `src/main.ts`

**`#view` belongs to `initTabs` and nothing else may write to it.** The tab
framework caches every mounted module's `.tab-root` in its `roots` map and
re-shows it by flipping `style.display`. It never re-appends. So any code that
calls `viewEl.replaceChildren()` silently detaches those cached roots, and the
affected lesson renders **blank** forever after — the framework thinks it is
still mounted.

The 404 gets **its own container**, a sibling of `#view` inside `<main>`,
toggled with `hidden` exactly the way `home` and `menuPage` already are in
`showRoute`. Every non-`notfound` route must hide it; every route that is
`notfound` must hide the tab view. Do not render the 404 into `#view`.

`showRoute` gets a `notfound` branch that hides `home` and `menuPage`, shows the
app shell, and renders into `viewEl`:

- Heading: "No topic at this URL"
- The path that was requested, rendered with `textContent` — **never
  `innerHTML`**; it is attacker-controlled text in the address bar
- Up to three nearest topics by string distance against every slug, alias and
  title, as buttons that navigate
- Links to `/menu` and `/`
- `document.title = 'Not found — ChemPrep'`

A cheap Levenshtein or a shared-trigram score is plenty; no dependency.

Delete the `navigate({ kind: 'home' }, true)` line — the `VALID_IDS` check is
now redundant with slug resolution, but keep a defensive branch that renders the
same 404 rather than silently redirecting.

**The homepage must never be the fallback for an unresolved URL.** If you find
another path that produces one, fix it and say so.

### 5. Audit

Extend the dev-time block at the bottom of `src/main.ts` (next to
`auditCorpus()`): every topic has a slug; no name is claimed by **two
different** topics (a topic naming itself twice is fine — `periodicity` and
`polymers` have slug === id); no slug collides with `/menu`; and every topic is
reachable at its bare `id`, either because the slug *is* the id or because
`aliases` contains it. Console error listing offenders, same shape as the
corpus audit.

## Tests — already written, do not modify

**`scripts/test-router.mjs` exists and currently fails.** It is the acceptance
gate for this work order and it was written before the implementation on
purpose. Run it:

```bash
node scripts/test-router.mjs
```

It checks: every slug is kebab-case and unique; every topic aliases its own id;
no slug or alias collides with another or with a reserved path; every slug and
every alias resolves through `parseRoute` to the right internal id;
`/topic/thermodynamics-i` → `thermo1`; uppercase and trailing-slash tolerance;
`/` → home and `/menu` → menu; six unknown paths → `notfound`; and the core
invariant that **no path except `/` may ever return `home`**.

**Do not edit, weaken or delete this file to make it pass.** If you believe a
check is wrong, stop and say which one and why — do not change it. Changing the
gate to match the implementation defeats the entire point of having one.

It expects `parseRoute` to stay a **pure function of the path** — no reads of
`location`, no side effects — because that is what makes it testable. Keep it
that way.

## Acceptance criteria

- [ ] `/topic/thermodynamics-i` loads Thermodynamics I
- [ ] `/topic/thermo1` loads it too, and the URL becomes `/topic/thermodynamics-i`
- [ ] `/topic/thermo9` renders the 404 view; the URL is left alone
- [ ] The homepage renders at `/` and nowhere else
- [ ] All 25 slugs load their module on a **cold** load (typed URL + hard
      refresh, not in-app navigation)
- [ ] Deep links still work on Netlify (`public/_redirects` unchanged and still
      `/* /index.html 200`)
- [ ] Back/forward across topic → 404 → topic behaves
- [ ] The router test passes
- [ ] **The container check.** `parseRoute` is covered by the gate; the DOM is
      not, so run this in the console at `/topic/thermo9` and paste the output
      into your summary. It must show a `.tab-root` present and **no**
      `.notfound-view` at steps 2 and 4:

      ```js
      (async () => {
        const el = document.getElementById('view');
        const snap = s => ({ s, url: location.pathname,
          kids: [...el.children].map(c => c.className + ' ' + (c.style.display || 'shown')) });
        const out = [snap('1. on the 404')];
        document.querySelector('.notfound-topic').click();
        out.push(snap('2. after clicking a suggestion'));
        history.back();    await new Promise(r => setTimeout(r, 400));
        out.push(snap('3. back to the 404'));
        history.forward(); await new Promise(r => setTimeout(r, 400));
        out.push(snap('4. forward to the topic'));
        return out;
      })()
      ```

## Verification

```bash
npx tsc --noEmit && npm run build && node scripts/audit-corpus.mjs
```

Then in the browser, cold-load at minimum: `/topic/thermodynamics-i`,
`/topic/acids-redox-and-kinetics`, `/topic/lab-and-data`, `/topic/thermo1`
(expect the redirect), `/topic/thermo9` (expect 404). Report which ones you
actually loaded.

## Out of scope

Do not add `sitemap.xml`, prerendering, structured data or per-route `og:` tags
— that is Phase I.1 and it depends on this landing first. Do not touch the tab
framework; that is D1.
