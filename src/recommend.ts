// What to study next (ROADMAP F.3).
//
// The footer used to be `TOPICS[idx + 1]` — correct, and useless to anyone who
// isn't reading the site front to back. This ranks the same list against what
// the student has actually done.
//
// TWO CONSTRAINTS SHAPE THIS FILE.
//
// It runs on the ENTRY PATH (main.ts builds the topic footer on every topic
// route), so it may not import the question corpus. Everything here comes from
// TOPICS, the id-prefix table, the stated bank sizes and the progress store —
// the same four sources the topic-card bars use, and none of them is heavy.
//
// And every recommendation CARRIES ITS REASON. A card that silently stops
// following the obvious order reads as a bug; one that says "because
// Equilibrium is your weakest topic" is advice you can agree or disagree with.
// `reason` is not decoration, it is the feature.
import { TOPICS, topicById, moduleProgress, moduleCompletion, type TopicMeta } from './topics';
import { modulesForExamTopic, examTopicsOf, EXAM_TOPIC_LABEL, isExamTopicId, type QuizModuleId } from './content/topicIds';
import { weakTopics } from './progress';
import { activeMode, inScope } from './mode';

export interface Recommendation {
  topic: TopicMeta;
  /** Sentence fragment completing "Next lesson — …". Always present. */
  reason: string;
}

/**
 * A prerequisite counts as MET at half its bank, not all of it.
 *
 * Demanding 100% would make the recommendation nag about a module the student
 * has demonstrably worked through, and nothing on the site claims a quiz must
 * be finished to move on. Half is enough evidence that the material was met.
 */
const PREREQ_MET = 0.5;

/** Re-exported so the rules check can assert on it without importing topics. */
export const completion = moduleCompletion;

/**
 * Does this module have a quiz bank AND belong on the active syllabus (G)?
 *
 * Scope is a hard filter here, unlike on the cards where it is only a mark:
 * a recommendation is the site telling you what to do next, and pointing a CCC
 * student at coordination chemistry is simply wrong advice. Browsing to it
 * deliberately stays possible; being sent there does not.
 */
const isLesson = (t: TopicMeta): boolean =>
  moduleProgress(t.id) !== null && inScope(t.difficulty, activeMode());

const prereqsMet = (t: TopicMeta): boolean =>
  t.prereqs.every(p => completion(p) >= PREREQ_MET);

/**
 * The next lesson for someone currently on `currentId`, or null if there is no
 * sensible answer (only when TOPICS is empty).
 *
 * Rules, in priority order:
 *
 *  1. **An unmet prerequisite of the module they are reading.** The most useful
 *     thing you can tell someone struggling with coordination chemistry is to
 *     go and finish bonding. Suppressed for a brand-new visitor, for whom every
 *     prerequisite is unmet and this would fire on all 25 modules.
 *  2. **An unfinished module covering a weak exam topic**, weakest first. This
 *     is the attempt log paying for itself.
 *  3. **The next unfinished module in sequence** — the old behaviour, minus the
 *     modules already completed.
 *  4. **The literal next module in TOPICS order.** Nothing scored (everything is
 *     finished, or the student is new), so the sequence is as good an answer as
 *     any, and the footer must never be empty.
 */
export function recommendNext(currentId: string): Recommendation | null {
  const idx = TOPICS.findIndex(t => t.id === currentId);
  const current = TOPICS[idx];
  const lessons = TOPICS.filter(isLesson);
  if (!lessons.length) return null;

  const started = lessons.some(t => completion(t.id) > 0);
  const unfinished = (t: TopicMeta): boolean => t.id !== currentId && completion(t.id) < 1;

  // 1. a prerequisite of the current module that hasn't been met
  //
  // Scope-checked like every other rule, and NOT hypothetically: `equilibrium`
  // is pitched at CCC but lists `thermo2` (USNCO-only) as a prerequisite, so
  // without this a CCC student was sent to a module outside their contest by
  // the one rule meant to be the most helpful.
  if (started && current) {
    const gap = current.prereqs
      .map(topicById)
      .find((p): p is TopicMeta => !!p && isLesson(p) && completion(p.id) < PREREQ_MET);
    if (gap) {
      return { topic: gap, reason: `${current.title} builds on it, and you haven't worked through it yet` };
    }
  }

  // 2. an unfinished module covering one of the weakest exam topics
  //
  // Gated on having FINISHED the current module, and that gate is not a
  // detail — without it every page recommends the same thing. A student with
  // one dominant weak topic saw the identical card on 25 modules, which reads
  // as a broken footer rather than as advice and erases any sense that the
  // modules are a sequence. Half a bank was not a strict enough gate either:
  // most modules sit above half for anyone who has been studying a while.
  //
  // Finished is the honest signal, and it makes the card mean something
  // specific: you are done here, so go where you are weakest. Anywhere else,
  // "next" means the next one.
  if (started && completion(currentId) >= 1) {
    for (const weak of weakTopics(3)) {
      if (!isExamTopicId(weak.topic)) continue;
      const candidates = modulesForExamTopic(weak.topic)
        .map(topicById)
        .filter((t): t is TopicMeta => !!t && isLesson(t) && unfinished(t) && prereqsMet(t))
        // Keep TOPICS order within a topic so the choice is stable and
        // still reads as "the next one", not a random pick.
        .sort((a, b) => TOPICS.indexOf(a) - TOPICS.indexOf(b));
      if (candidates.length) {
        return {
          topic: candidates[0],
          reason: `${EXAM_TOPIC_LABEL[weak.topic]} is your weakest topic — ${Math.round(weak.accuracy * 100)}% across ${weak.seen} answers`,
        };
      }
    }
  }

  // 3. the next unfinished module in reading order whose prerequisites are met
  const after = [...TOPICS.slice(idx + 1), ...TOPICS.slice(0, Math.max(idx, 0))];
  const nextUp = after.find(t => isLesson(t) && unfinished(t) && prereqsMet(t));
  if (nextUp) {
    return {
      topic: nextUp,
      reason: started ? 'next in the sequence, and you have what it needs' : 'next in the sequence',
    };
  }

  // 4. whatever comes next in the list, finished or not — but still in scope.
  // The last resort is allowed to recommend something already completed; it is
  // NOT allowed to recommend material the student's contest doesn't cover.
  const fallback = after.find(isLesson) ?? TOPICS[idx + 1] ?? TOPICS.find(t => t.id !== currentId);
  return fallback ? { topic: fallback, reason: 'next in the sequence' } : null;
}

/**
 * Which exam topics a module covers, as display labels — used by the footer to
 * explain a recommendation without the caller needing the topic vocabulary.
 */
export function moduleTopicLabels(id: string): string[] {
  const mod = id as QuizModuleId;
  if (!moduleProgress(id)) return [];
  try {
    return examTopicsOf(mod).map(t => EXAM_TOPIC_LABEL[t]);
  } catch {
    return [];
  }
}
