# Writing a question

One page on purpose. A standard nobody reads is a standard nobody follows.

## The fields

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Permanent, namespaced (`coo-014`). Get it from `scripts/backfill-ids.mjs`. **Never renumber one** — progress is keyed on it. |
| `topic` | yes | A `ModuleId` (`thermo1`), not an `ExamTopicId`. `toExamTopic()` is the one collapse between the two vocabularies. |
| `q` | yes | The stem. HTML allowed; it is a build-time literal (see the `html:` comment in framework.ts). |
| `opts` | yes | Usually four. See *Distractors* below — this is where the corpus is weakest. |
| `a` | yes | Index into `opts`. Exactly one defensible answer. |
| `why` | yes | The reason the question exists. Teaches; does not merely assert. |
| `misconception` | ≥4 per module | A mistake a real student really makes, not a restatement of `why`. |
| `why2` | rare | A second angle for a question students actually get wrong. Evidence, not a hunch. |
| `tier`, `comps` | no | **Derived** (`tierOf()`, `compsOf()`). Only override with a reason; a stored copy of the default goes stale. |

Register the bank in `registry.ts` (`BANKS`/`QUIZ_BANKS`) or its questions
vanish from every filtered view. `auditCorpus()` catches that.

## Distractors — the part that is currently wrong

`npm run audit` prints this every run:

> Length clueing: correct option is the longest in 59% of 616 questions
> (chance is ~25% at 4 options).

That is the house defect. It happens because the right answer gets written
first, carefully and with its qualifiers, and then three wrong ones get written
quickly. A student who spots the pattern outscores one who knows the chemistry.

So:

- **A distractor states a specific wrong idea**, and stating one takes about as
  many words as stating the right one. "Increases" is not a distractor;
  "increases, because raising the temperature always shifts equilibrium toward
  products" is — it names the error being tested.
- Each wrong option should be **the answer a student gets by making one
  identifiable mistake**: the reciprocal, the un-squared coefficient, the
  Celsius/kelvin slip, the sign flip. If you cannot say which mistake produces
  an option, it is filler.
- **No "all/none of the above"**, no joke options. They reduce a 4-way question
  to a 3-way one.
- Do not fix clueing by shortening the correct answer if it needs its words.
  Bring the distractors up.
- **Do not write the correct answer at index 1.** The corpus keyed 68% of its
  questions there before `scripts/deskew-answers.mjs` flattened it to 25% per
  position. It is the natural place to put the right answer — first draft, one
  wrong option above it — and it is worth resisting. Run the script after
  adding questions and it will place them for you.

## Before it ships

```text
□ chemically correct — checked against a textbook, not from memory
□ numerically verified — worked through, not estimated
□ exactly one defensible answer
□ units correct and stated
□ sig figs consistent with the data given
□ every distractor traces to one identifiable student mistake
□ correct option is not the longest (or the length is genuinely necessary)
□ nothing in the stem clues the answer
□ `why` teaches the method, not just the result
□ the misconception is one students actually hold
□ level matches the tier claimed
```

`npm run audit` covers the mechanical subset — ids, answer-index range,
duplicate options, KaTeX that fails to parse, tables that overflow, answer keys
that disagree with their own explanation. It cannot check chemistry, units, or
significant figures. Those are the human items above and there is no script
coming that will do them for you.

## Editing a shipped question

Allowed. Progress keys on the explicit `id`, not on a hash of the text, and
`migrateLegacyProgress()` already moved old records across. Changing the text
of a question does not orphan anyone's history.

Changing an `id` still does. Don't.
