# `src/content` — the question id vocabulary

Roadmap **Phase A** scaffolding. Two files matter:

| File | Role |
| --- | --- |
| [`topicIds.ts`](topicIds.ts) | The canonical vocabulary. Module ids, exam-topic ids, how they relate, the bank registry, the id prefixes. No imports — it compiles standalone. |
| [`../../scripts/backfill-ids.mjs`](../../scripts/backfill-ids.mjs) | The one-time codemod that writes `id:` (and `topic:`) into the question source files. |

Writing the questions themselves: [`AUTHORING.md`](AUTHORING.md) — the field
spec, the ship checklist, and why the distractors are the part to spend the
time on.

---

## The rule that outranks everything else

> **An id, once written into a question file and committed, is permanent.**

Progress records are keyed by these ids, locally and in Supabase. Changing an id
orphans every user's record for that question — silently, with no error, exactly
the bug Phase A exists to eliminate. So:

- Never edit an existing `id`.
- Never renumber a bank because questions were reordered, merged or deleted.
- Deleting a question **retires** its id. Do not reuse the number.
- `backfill-ids.mjs` enforces this: it skips any question that already has an
  `id`, and if a positionally-derived candidate collides with an id already in
  use, it allocates the next free number and prints a warning rather than
  touching the existing one.

## The vocabulary decision

There are two topic vocabularies in this codebase, and they stay separate.

**`ModuleId` — the fine-grained one (25 values).** One per route under
`/topic/:id`; the same strings as `TOPICS` in `src/topics.ts` and `DEFS` in
`src/main.ts`. `quantum`, `thermo1`, `organic3`, `advinorganic`, …

**`ExamTopicId` — the coarse one (12 values).** `stoich`, `states`, `thermo`,
`kinetics`, `equilibrium`, `acids`, `redox`, `atomic`, `bonding`,
`descriptive`, `organic`, `lab`. These were **already in the data** before
Phase A: every object in `bankPart1/2/3`, `bankCCO`, `bankIntegrated` and
`olympiadPaper*.partB` carries one, and `qbank.ts` groups its UI by them.

### Which one goes on a question

| Question family | `topic` field holds | Why |
| --- | --- | --- |
| `QuizQ` in `questions1–7.ts` | a **`ModuleId`** | Each quiz bank belongs to exactly one topic tab, so the module is known with certainty and needed zero judgement calls to backfill. It is also the finer of the two: the coarse exam topic is always derivable from it, never the reverse. |
| `BankMC` / `FRQ` in the exam banks | an **`ExamTopicId`** (unchanged) | It is what exam papers are organised by, and it is load-bearing in `qbank.ts` today. Rewriting 332 existing values to a different vocabulary would have been a semantic change disguised as a refactor. |

Yes, the same field name carries two vocabularies. That is deliberate and it is
type-safe: the two families are different interfaces, so `tsc` will not let you
pass one where the other belongs. `stoich`, `equilibrium` and `bonding` happen
to be spelled identically in both unions — that is a coincidence of naming, not
an identity. Bridge them through the maps, never by assignment.

### The bridge

One hand-maintained direction, because the relation is genuinely many-to-many —
`aek` is literally "Acids, Redox & Kinetics", and `atomic` is taught by both
`quantum` and `periodicity`:

```ts
MODULE_EXAM_TOPICS: Record<QuizModuleId, readonly ExamTopicId[]>
//   aek: ['acids', 'redox', 'kinetics']   ← first entry is the PRIMARY
```

Everything else is derived from it, so there is nothing to keep in sync:

```ts
examTopicsOf(m)            // ['acids','redox','kinetics']
primaryExamTopicOf(m)      // 'acids'        — when one value is needed
modulesForExamTopic(t)     // reverse index, computed
```

`QuizModuleId` excludes `sandbox` and `qbank`: both are real modules with real
routes, but one is a simulation and the other is a container for the exam banks,
so neither owns questions and neither needs an exam topic.

## How ids are formed

Always `<namespace>-<NNN>`, zero-padded to three digits, ASCII, lowercase.
Namespaces are disjoint across every table (`topicIds.ts` asserts it at import).

| Source | Pattern | Examples |
| --- | --- | --- |
| Quiz banks | `<ID_PREFIX[module]>-NNN` | `qua-001`, `equ-014`, `lbt-029` |
| `bankPart1.ts` (Part I MC) | `p1-<examTopic>-NNN` | `p1-stoich-003` |
| `bankPart2.ts` (Part II FRQ) | `p2-<examTopic>-NNN` | `p2-thermo-002` |
| `bankPart3.ts` (Part III lab) | `p3-<examTopic>-NNN` | `p3-acids-001` |
| `bankCCO.ts` | `cco-<setId>-NNN` | `cco-ps1-001` |
| `bankIntegrated.ts` | `<setId>-NNN` (set ids already start `int-`) | `int-thermo-eq-002` |
| `olympiadPaper1–5.ts` | `<paperId>-a-NNN` / `<paperId>-b-NNN` | `mock3-a-017`, `mock3-b-002` |

`ID_PREFIX` is three lowercase alphanumerics per module, unique, permanent
(`quantum → qua`, `thermo1 → th1`, `advinorganic → ain`). Numbering is derived
from a question's **position** in its array, not from a counter over how many
ids already exist — that is what makes the codemod idempotent.

For the topic-grouped banks the counter runs within `(bank, exam topic)`, so
`p1-stoich-001…010` reads as a block and stays independent of neighbouring
topics.

## Adding a new bank

1. Add the module to `src/topics.ts` (`TOPICS`) and `src/main.ts` (`DEFS`), per
   the rules in `CLAUDE.md`.
2. In `topicIds.ts`: add the id to `ModuleId` **and** `MODULE_IDS`, give it an
   `ID_PREFIX` (three chars, not already taken), and add its exam topic(s) to
   `MODULE_EXAM_TOPICS`.
3. Add one line to `BANKS`:
   ```ts
   { exportName: 'NEWTOPIC_QUIZ', module: 'newtopic', file: 'src/tabs/questions8.ts' },
   ```
4. Write the questions **without** `id` — leave the field off entirely.
5. `node scripts/backfill-ids.mjs` (dry run), read the counts, then
   `--write`. Existing questions are untouched; only the new ones get ids.

Adding a new *exam* bank is the same, via `EXAM_BANKS`, choosing an `idPrefix`
no module prefix or other bank already uses.

> `backfill-ids.mjs` cannot import TypeScript, so it parses `BANKS`,
> `EXAM_BANKS`, `ID_PREFIX` and `EXAM_TOPIC_IDS` out of `topicIds.ts` as text —
> one entry per line, fixed shape. The `EXTRACTION CONTRACT` comments mark
> those blocks. Reformat them and the script fails loudly with a count
> mismatch; it will not silently skip a bank.

## Known gap: `olympiadPaper*.partA`

The 125 Part A multiple-choice questions (5 papers × 25) are typed `QuizQ[]` and
have **never** carried a topic. A mock paper deliberately spans the whole
syllabus, so the topic is not derivable from file, position or export name. The
codemod gives them an `id` and **refuses to guess a topic** — it reports them
instead.

This is the desired end state, not an oversight: once `topic` becomes required
on `QuizQ`, `tsc --noEmit` enumerates exactly those 125 objects
(`mock1-a-001` … `mock5-a-025`) and nothing else, which is precisely the
"make `tsc` list what still needs backfill" mechanism Roadmap A.2 asks for.
Tag them by hand — a `ModuleId` each, since they are `QuizQ`.

## Not in scope here

`topicIds.ts` is vocabulary only. Still to come in Phase A:

- extending `QuizQ` / `BankMC` / `FRQ` with `id`, `topic`, `tier`, `comps`,
  `misconception`
- `src/content/registry.ts` — `ALL_QUESTIONS` plus `byTopic()` / `byTier()` /
  `byComp()` indexes
- the `legacyHash → newId` migration shim in `src/progress.ts`, which must ship
  **in the same commit** as the id backfill or users lose progress
