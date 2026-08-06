# Codex work orders

One file per unit of work, each self-contained: paste it as the prompt, no
other context needed. They are numbered by ROADMAP phase item.

**Run them in order.** D0 → D1 → D2 → D3. D1 depends on nothing but is what
makes D10 (code-splitting) safe later; D2 and D3 are independent of each other.

| Order | What | Est. |
| --- | --- | --- |
| [D0](D0-routing-slugs-404.md) | Real slugs, a `notfound` route, a 404 page | 2 h |
| [D1](D1-tab-error-boundary.md) | Error boundary + `onDestroy` in the tab framework | 1 h |
| [D2](D2-sidebar-sections.md) | Collapsible sidebar groups, mobile drawer | 3 h |
| [D3](D3-homepage-order.md) | Homepage section order + stats from the real corpus | 3 h |

## Standing rules — these apply to every work order

Read `AGENTS.md` first; it is the authority and these are the parts most easily
broken by a mechanical change.

1. **Do not write or edit chemistry content.** Not question text, not `why`,
   not `misconception`, not mission copy, not theory prose, not worked
   solutions. Adding a *field* is fine — ship the type, the renderer, and an
   empty value. Never placeholder prose: it reads as finished and never gets
   revisited. List content gaps in your summary instead.
2. **Never renumber a question or mission id.** Progress is keyed on them; a
   renumber silently destroys every user's history and cannot be undone from
   the app.
3. **`src/topics.ts` is the single source of topic metadata.** If a work order
   adds a field, it goes there and everything else derives from it. Never
   duplicate the topic list — `main.ts` `DEFS` mirrors the *order* only.
4. **All sim state changes go through the `sim.ts` helpers.** Never push to
   `particles` / `bonds` directly.
5. **No emoji anywhere in the UI.** Text labels or inline SVG (see `MARK_SVG`,
   `src/icons.ts`).
6. **Additive changes only to `Particle` / `Bond` (`src/particle.ts`) and to
   `QuizQ` / `FRQ`.** Renaming a field breaks every module that reads it.

## Definition of done, every time

```bash
npx tsc --noEmit && npm run build && node scripts/audit-corpus.mjs
```

Plus any acceptance gate the work order names (D0 has
`node scripts/test-router.mjs`). All clean, plus:

- No new console errors or warnings on `/`, `/menu`, and at least three topic
  pages, checked in the browser — not assumed.
- Keyboard reachable: everything you added is tabbable, has a visible focus
  ring, and works without a mouse.
- Behaviour verified *live*, not inferred from the diff. Say in your summary
  which routes you actually loaded.

## Commits

No `Co-Authored-By` trailers and no Codex/Anthropic attribution of any kind.
One commit per work order, subject line `Phase D.<n>: <what changed>`.

## Running a work order as a loop

These orders are written to be run iteratively until a **command** goes green,
never until you judge the work finished. Self-assessment converges on "done";
a failing exit code doesn't.

Each iteration:

1. Run the gate for the current order, plus `npx tsc --noEmit` and `npm run build`.
2. If anything fails, fix the **first** reported failure and re-run. Don't
   batch speculative fixes across several failures at once — you lose track of
   which change fixed what.
3. When the gate is green, do the browser checks the order lists. Those are not
   machine-checkable, so state plainly which routes you loaded and what you saw.
4. Stop. Report. Do not start the next work order in the same run.

Three rules that make the loop safe:

- **Never modify a gate to make it pass.** If a check looks wrong, stop and say
  which one and why. A gate edited to match the implementation is worse than no
  gate, because it now certifies the bug.
- **Never `git checkout`/`reset`/`stash` to escape a failure.** Other work is
  happening in this repo in parallel, in files you are not touching. Discarding
  the tree destroys it.
- **If the same failure survives three iterations, stop and report.** Repeated
  identical failures mean the spec and the code disagree about something, and
  another attempt will not resolve it.

## When a work order is wrong

If the code doesn't match what the order describes, **stop and say so** rather
than making the description true. The orders were written against a specific
commit; drift is expected and a surprised report is more useful than a
compliant rewrite.
