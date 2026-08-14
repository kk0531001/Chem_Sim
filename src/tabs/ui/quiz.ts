// The quiz widget and the simulation-mission ladder — the two pieces of the
// UI that get edited when a MODULE changes rather than when the framework
// does. Split out of framework.ts (revamp.md E1) purely so that editing them
// does not mean opening 1650 lines of unrelated plotting, tab-shell and DOM
// helpers.
//
// framework.ts re-exports everything here, so no call site imports this file
// directly and none needed changing. That makes the import cycle
// framework -> ui/quiz -> framework real but harmless: every binding this file
// takes back from framework (`h`, `card`, `button`, `theory`, `slider`,
// `plot`, `typesetMath`) is a hoisted FUNCTION DECLARATION, and nothing here
// calls one at module-evaluation time. Do not import a `const` from framework
// into this file — that one would be a temporal-dead-zone crash at load, and
// only on the module that happens to be imported first.
import { isSolved, markSolved, unmarkSolved, recordAttempt, onProgressChange,
         isBookmarked, toggleBookmark, weakTopics, solvedOf } from '../../progress';
import { toExamTopic, isExamTopicId, EXAM_TOPIC_LABEL } from '../../content/topicIds';
import { signal, registerQuizReporter } from '../../signals';
import { recommendNext } from '../../recommend';
import { navigate } from '../../router';
import { h, button, typesetMath, copyLinkButton } from '../framework';

// ---- quick-quiz widget: one question at a time, instant feedback ----
/**
 * `id` is EXPLICIT and PERMANENT — never derived from the question text.
 * Progress used to be keyed by a hash of `q`, which meant fixing a typo
 * silently orphaned every user's record for that question. Assign a new id
 * from scripts/backfill-ids.mjs; never renumber an existing one.
 *
 * `topic` is a ModuleId and optional only because the 125 olympiad Part A
 * questions span the whole syllabus and have no single topic. Everything else
 * carries one, and per-topic statistics skip the ones that don't.
 */
export interface QuizQ {
  id: string;
  topic?: string;
  /**
   * Difficulty tier (1 Bronze … 4 Platinum) and the competitions this question
   * is in scope for. Both are OPTIONAL OVERRIDES: `tierOf()` and `compsOf()` in
   * src/content/registry.ts derive a value for every question from where it
   * lives and its module's curated `difficulty`, so coverage is total without
   * 919 hand-tags. Set these only where the derived answer is wrong — a stored
   * value that merely restates the default is one more thing to go stale.
   */
  tier?: 1 | 2 | 3 | 4;
  comps?: readonly ('ccc' | 'usnco' | 'cco' | 'icho')[];
  /**
   * The specific sub-skill this question tests, within its topic
   * (`equilibrium/q-vs-k`, `equilibrium/ice-setup`). OPTIONAL and currently
   * sparse — see revamp.md A1.
   *
   * Why this is not derived like `tier` and `comps`: those have a defensible
   * default from where a question lives, and a skill does not. Two questions
   * in the same bank, at the same tier, can test completely different things,
   * which is the entire reason the field exists — "you are weak at
   * equilibrium" is not useful advice, "you set up ICE tables correctly but
   * miss Q vs K" is.
   *
   * Untagged questions are simply absent from the per-skill report rather than
   * bucketed as "other": a made-up bucket that grows to 800 questions would
   * dominate the very view it is meant to sharpen.
   *
   * An ARRAY when a question genuinely tests two things — `equ-012` needs the
   * ICE change row and the exponent, and calling it one or the other loses the
   * half a student actually got wrong. One field rather than `skill` plus
   * `skills`, because two fields would immediately disagree about which wins.
   */
  skill?: string | readonly string[];
  q: string;
  opts: string[];
  a: number;
  why: string;
  /** Wrong-answer mental-model correction — shown below `why` when the student misses. */
  misconception?: string;
  /**
   * A SECOND, handwritten explanation of the same answer from a different angle
   * (ROADMAP H.1) — revealed by the "Explain it differently" button, right or
   * wrong. It must re-derive the answer by another route (picture, limiting
   * case, analogy, unit argument), not restate `why` in new words: a student
   * who presses that button has already read `why` and it did not land.
   *
   * Deliberately not AI-generated. H.3's model-backed version needs a proxy
   * function, a rate limiter and a monthly bill for demand nobody has measured
   * yet; a string on the questions that actually get missed costs nothing.
   */
  why2?: string;
}

let quizSeq = 0;

/**
 * "Was this explanation helpful?" (ROADMAP I.2) — one verdict per question id.
 *
 * A one-shot control: it asks once, records once, and replaces itself with the
 * acknowledgement. There is no undo and no second vote, because the value of
 * this data is in which explanations get flagged at all, not in a running
 * tally that one irritated reader can drive.
 */
export function helpfulBar(questionId: string): HTMLElement {
  const bar = h('div', { class: 'helpful' }, h('span', { class: 'helpful-q' }, 'Did this explanation help?'));
  const vote = (verdict: 'yes' | 'no') => () => {
    signal('explain', questionId, { note: verdict });
    bar.replaceChildren(h('span', { class: 'helpful-q' },
      verdict === 'yes' ? 'Thanks — noted.' : 'Thanks — this one is on the list to rewrite.'));
  };
  bar.append(
    h('button', { type: 'button', class: 'helpful-btn', onclick: vote('yes') }, 'Helpful'),
    h('button', { type: 'button', class: 'helpful-btn', onclick: vote('no') }, 'Not helpful'),
  );
  return bar;
}

/*
 * Accessibility notes on the pattern used here, because the obvious choice is
 * the wrong one.
 *
 * `role="radiogroup"` looks right and is wrong. A radio group models a
 * *revisable* choice: arrow keys move between options, only one is in the tab
 * order, and `aria-checked` tracks a selection the user can still change before
 * committing it. This quiz has none of that — the first click is final, it is
 * graded on the spot, and the option you pressed is not a "selection" but an
 * answer already scored. Announcing "radio button, 2 of 4, not checked" would
 * describe an interaction that does not exist here.
 *
 * So the options stay real <button>s (correct: each one is a distinct,
 * immediate action) inside a `role="group"` named by the question, which is
 * what gives the set its context. What the buttons then need is for the
 * *result* to survive the loss of colour: `.correct` / `.wrong` are green and
 * red backgrounds and nothing else, so each graded button also gets an
 * .sr-only suffix, and the verdict is prepended to the live explanation.
 */
/**
 * Every live quiz's "jump to this question id" handler (F.1).
 *
 * Bounded by construction: tabs mount at most once each, so this holds one
 * entry per quiz on the site (~30), not one per navigation. Question ids are
 * unique corpus-wide, so at most one entry can ever claim a given id.
 */
const QUIZZES: ((id: string, repaint: boolean) => boolean)[] = [];

/** Move whichever quiz owns this question id onto it. True if one did. */
export function focusQuestion(id: string): boolean {
  for (const jump of QUIZZES) if (jump(id, true)) return true;
  return false;
}

/**
 * `noteFor` appends a per-question note to the progress line — the Question
 * Bank uses it to show the tier and competition scope of the question on
 * screen. It is a CALLBACK rather than a lookup here on purpose: tierOf and
 * compsOf live in content/registry.ts, which pulls the whole corpus, and a
 * topic page must not pay for that (D.10). qbank.ts already has the registry
 * loaded, so it supplies the string.
 */
/** Option text for the contrast line: options carry inline markup (sub/sup,
 *  <b>), which belongs in the sentence, but a stray block tag would break the
 *  flex row it sits in. */
function plainOpt(html: string): string {
  return String(html).replace(/<\/?(?:div|p|ul|li|table)[^>]*>/gi, ' ').trim();
}

export function quiz(qs: QuizQ[], warmupCount = 0, noteFor?: (q: QuizQ) => string): HTMLElement {
  let i = 0, score = 0, answered = false;
  // What the student picked, per index. Going BACK restores the answered state
  // from this rather than re-grading: a second recordAttempt for a question
  // they are only re-reading would count as a fresh answer and skew every
  // statistic derived from the log.
  const chosen: (number | null)[] = qs.map(() => null);
  // Explicit ids, not qid(q.q). Keying progress on a hash of the prompt meant
  // that fixing a typo silently orphaned every user's record for the question.
  const ids = qs.map(q => q.id);
  const uid = `quiz-${++quizSeq}`;
  const progress = h('div', { class: 'quiz-progress' });
  const qEl = h('div', { class: 'quiz-q', id: `${uid}-q` });
  // Progress + question move together and take focus after "Next question", so
  // a screen reader reads "Question 7 of 25 · olympiad …" and then the new
  // question. That is why the progress line needs no live region of its own —
  // it is never announced out of context, and never mid-typing.
  // Bookmarking is a toggle button, not a link or a checkbox: aria-pressed is
  // what states "on", and the label has to change with it or a screen-reader
  // user hears "Bookmark" on a question that already is one.
  const bmBtn = h('button', { type: 'button', class: 'bookmark-btn', 'aria-pressed': 'false' });
  bmBtn.addEventListener('click', () => { toggleBookmark(ids[i]); syncBookmark(); });
  function syncBookmark(): void {
    const on = i < qs.length && isBookmarked(ids[i]);
    bmBtn.classList.toggle('on', on);
    bmBtn.setAttribute('aria-pressed', String(on));
    bmBtn.innerHTML = BOOKMARK_ICON + `<span class="sr-only">${on ? 'Bookmarked, click to remove' : 'Bookmark this question'}</span>`;
  }
  // The bank already restores ?q=<id>, so the shareable URL is just this
  // question's id on the current page.
  const shareBtn = copyLinkButton(() => {
    const u = new URL(location.href);
    u.searchParams.set('q', ids[Math.min(i, ids.length - 1)]);
    return u.toString();
  }, 'link to this question');
  const head = h('div', { class: 'quiz-head', tabindex: -1 },
    h('div', { class: 'quiz-head-row' }, progress, shareBtn, bmBtn), qEl);
  const optsEl = h('div', { class: 'quiz-opts' });
  const whyEl = h('div', { class: 'quiz-why', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const nextBtn = button('Next question', () => { i++; render(true); }, 'primary');
  // Backwards was not possible at all before: a student who wanted to re-read
  // the explanation they had just clicked past had to restart the set.
  const prevBtn = button('← Previous', () => { if (i > 0) { i--; render(true); } }, 'btn-quiet');
  const nav = h('div', { class: 'quiz-nav' }, prevBtn, nextBtn);
  const wrap = h('div', { class: 'quiz' }, head, optsEl, whyEl, nav);
  onProgressChange(() => { if (i < qs.length) updateProgressLine(); });

  /**
   * `?q=<id>` opens the quiz ON that question (ROADMAP F.1).
   *
   * `jump` is registered globally rather than read only at construction,
   * because TABS MOUNT ONCE. Searching for a question in a module you have
   * already opened re-shows the existing tab — no constructor runs, so a
   * link-time-only read landed on the page but not the question. Both paths now
   * end up here: a fresh mount jumps before its first paint (no flash of
   * question 1), and a re-show is driven by initTabs calling focusQuestion.
   *
   * The parameter is NOT cleared as the student advances. It records where the
   * link pointed, so a refresh lands in the same place; treating it as live
   * position would mean rewriting the URL on every "Next question".
   */
  const jump = (id: string, repaint: boolean): boolean => {
    const at = ids.indexOf(id);
    if (at < 0) return false;
    i = at;
    if (repaint) render(true);
    // After layout, or the scroll target has no position yet.
    requestAnimationFrame(() => wrap.scrollIntoView({ block: 'center', behavior: 'auto' }));
    return true;
  };
  QUIZZES.push(jump);

  // I.2: where students stop. Reported on leaving the page, not per question —
  // the interesting number is the LAST position reached, and one row per quiz
  // per visit says that. `reported` guards against a second identical row when
  // a tab is hidden and shown again without the student answering anything.
  let answeredCount = 0, reported = -1;
  registerQuizReporter(() => {
    if (answeredCount === 0 || answeredCount === reported) return null;
    reported = answeredCount;
    return { ref: ids[Math.min(i, qs.length - 1)], answered: answeredCount };
  });

  // Options are a named group while they are options; on the "Done" screen the
  // container holds a single Restart button and must not claim to be one.
  function setOptsGrouped(on: boolean): void {
    if (on) {
      optsEl.setAttribute('role', 'group');
      optsEl.setAttribute('aria-labelledby', `${uid}-q`);
    } else {
      optsEl.removeAttribute('role');
      optsEl.removeAttribute('aria-labelledby');
    }
  }

  /**
   * The end of a quiz is the one moment a student has nothing to do, so it has
   * to hand them the next thing rather than only offering the same 25 questions
   * again. Order of preference:
   *   1. their weakest exam topic — the bank, filtered to it;
   *   2. failing enough data for that (weakTopics needs 4 attempts in a topic),
   *      the ordinary next-lesson recommendation, which always has an answer.
   * Restart drops to quiet: it is available, but it is not the advice.
   */
  function doneActions(): (HTMLElement | string)[] {
    const restart = button('Restart quiz', () => { i = 0; score = 0; render(true); }, 'btn-quiet');
    const weak = weakTopics(1)[0];
    if (weak && isExamTopicId(weak.topic)) {
      const label = EXAM_TOPIC_LABEL[weak.topic];
      const go = button(`Practise ${label}`, () => navigate({ kind: 'topic', id: 'qbank' }, false,
        '?' + new URLSearchParams({ part: 'results', topic: weak.topic })), 'primary');
      return [h('p', { class: 'quiz-next-line' },
        `Weakest area so far: ${label} — ${Math.round(weak.accuracy * 100)}% of ${weak.seen} answered right.`),
        go, restart];
    }
    const rec = recommendNext(qs[0]?.topic ?? '');
    if (!rec) return [restart];
    return [h('p', { class: 'quiz-next-line' }, `Next: ${rec.topic.title} — ${rec.reason}.`),
      button(`Open ${rec.topic.title}`, () => navigate({ kind: 'topic', id: rec.topic.id }), 'primary'),
      restart];
  }

  function render(moveFocus = false): void {
    answered = false;
    whyEl.innerHTML = '';
    whyEl.className = 'quiz-why';
    nextBtn.style.display = 'none';
    prevBtn.style.display = i > 0 && i <= qs.length ? '' : 'none';
    syncBookmark();
    // Nothing to bookmark on the "Done" screen — it is not a question.
    bmBtn.hidden = i >= qs.length;
    if (i >= qs.length) {
      setProgress('');
      qEl.innerHTML = `Done — score <b>${score}/${qs.length}</b> ` +
        (score === qs.length ? '— perfect!' : score >= Math.ceil(qs.length * 0.7) ? '— solid!' : '— review the theory panel and retry.');
      setOptsGrouped(false);
      optsEl.replaceChildren(...doneActions());
      if (moveFocus) head.focus();
      return;
    }
    const q = qs[i];
    updateProgressLine();
    setOptsGrouped(true);
    qEl.innerHTML = q.q + (isSolved(ids[i]) ? ' <span class="solved-tag">✓ solved</span>' : '');
    optsEl.replaceChildren(...q.opts.map((o, j) => {
      const b = h('button', { type: 'button', class: 'quiz-opt' }, o);
      b.addEventListener('click', () => {
        if (answered) return;
        grade(j, true);
      });
      return b;
    }));
    // Replay a question the student has already answered — they navigated
    // BACK to re-read it. `record: false` is the whole point: a second
    // recordAttempt here would log a fresh answer for a question they only
    // looked at, and every statistic derived from the log would drift.
    if (chosen[i] !== null) grade(chosen[i]!, false);

    function grade(j: number, record: boolean): void {
        answered = true;
        if (record) { answeredCount++; chosen[i] = j; }
        const b = optsEl.children[j] as HTMLElement;
        const right = j === q.a;
        if (right) {
          b.classList.add('correct');
          // Score and solved-state are also once-only: a replay is a re-read,
          // not a second correct answer.
          if (record) { score++; markSolved(ids[i]); }
        }
        else {
          b.classList.add('wrong');
          (optsEl.children[q.a] as HTMLElement).classList.add('correct');
        }
        // Log the attempt whether it was right or wrong — the wrong ones are
        // the entire point (weak topics, personalised review). Topics are
        // normalised to the coarse exam vocabulary so that a module-tagged
        // quiz and an exam-bank question about the same chemistry land in the
        // same bucket instead of two half-populated ones.
        if (record) recordAttempt(ids[i], right, { topic: toExamTopic(q.topic), chosen: j });
        // The grading is over: keep the buttons focusable (so they can still be
        // read) but tell AT they no longer do anything, and spell out in text
        // what the red/green only shows visually.
        for (const el of Array.from(optsEl.children)) el.setAttribute('aria-disabled', 'true');
        srSuffix(optsEl.children[q.a], right ? 'correct answer, your answer' : 'correct answer');
        if (!right) srSuffix(b, 'your answer, incorrect');
        // aria-live on whyEl announces this; leading with the verdict means the
        // outcome is heard first and does not depend on the colour change.
        // Lead a WRONG answer with the contrast in words. The option colours
        // already say it, but only to someone who can see them and who then
        // scans back up to work out which one they pressed — and the `why`
        // itself explains the right answer without ever naming the wrong one.
        const contrast = right ? '' :
          `<div class="quiz-contrast"><span>You chose <b>${plainOpt(q.opts[j])}</b></span>`
          + `<span>Answer: <b>${plainOpt(q.opts[q.a])}</b></span></div>`;
        let whyHtml = `<span class="sr-only">${right ? 'Correct. ' : 'Incorrect. '}</span>${contrast}${q.why}`;
        if (!right && q.misconception) {
          // The text goes in ONE span: .misconception is a flex row, so any
          // bare text nodes and inline tags in the copy would each become a
          // separate flex item and stack up as narrow columns.
          whyHtml += `<div class="misconception" role="note">${MISCON_ICON}<span><strong>Common misconception:</strong> ${q.misconception}</span></div>`;
        }
        whyEl.innerHTML = whyHtml;
        whyEl.classList.add(right ? 'good' : 'bad');
        if (q.why2) {
          // Offered whether or not they got it right: a lucky guess is exactly
          // the case where one explanation has not landed. Hidden until asked
          // for, because two explanations side by side read as noise to the
          // student who already understood the first.
          const alt = h('div', { class: 'why2', role: 'note', hidden: '' });
          alt.innerHTML = `<strong>Another way to see it:</strong> ${q.why2}`;
          const ask = button('Explain it differently', () => {
            alt.hidden = false;
            ask.remove();
            typesetMath(alt);
          }, 'why2-btn');
          whyEl.append(ask, alt);
        }
        whyEl.append(helpfulBar(ids[i]));
        typesetMath(whyEl);
        updateProgressLine();
        nextBtn.style.display = '';
    }
    // Typeset any LaTeX/mhchem in the question and options now, rather than
    // depending on the rAF-based observer (which can flash raw \( … \)).
    typesetMath(qEl);
    typesetMath(optsEl);
    if (moveFocus) head.focus();
  }

  // Rewriting the text node is what triggers a live-region announcement, so
  // only touch it when the string actually changed (onProgressChange can fire
  // from a cloud sync with nothing new to say).
  function setProgress(s: string): void {
    if (progress.textContent !== s) progress.textContent = s;
  }

  function updateProgressLine(): void {
    if (i >= qs.length) return;
    const tier = warmupCount === 0 ? '' : i < warmupCount ? ' · warm-up' : ' · olympiad';
    const note = noteFor?.(qs[i]);
    const done = solvedOf(ids);
    setProgress(`Question ${i + 1} of ${qs.length}${tier}${note ? ' · ' + note : ''}`
      + ` · score ${score} · ${done}/${qs.length} solved`);
  }

  jump(new URLSearchParams(location.search).get('q') ?? '', false);
  render();
  return wrap;
}

// ---- interactive simulation missions ----
const CHECK_ICON = '<svg class="mission-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.5 11.5 3 8l1.1-1.1 2.4 2.4 5.4-5.4L13 5.1z"/></svg>';
const BOOKMARK_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 2.5h8a.5.5 0 0 1 .5.5v10.2a.3.3 0 0 1-.47.25L8 10.6l-4.03 2.85a.3.3 0 0 1-.47-.25V3a.5.5 0 0 1 .5-.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';

const MISCON_ICON ='<svg class="miscon-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-.75 2.5h1.5v4.5h-1.5V7.5Z"/></svg>';

export interface MissionMeter {
  label: string;
  pct: number; // 0–100 proximity to goal
}

export interface MissionDef {
  id: string;
  prompt: string;
  hints?: string[];
  explain?: string;
  /** Live feedback while the student experiments (progress bar + label). */
  meter?: () => MissionMeter | null;
  /**
   * Reads the simulation's live state. Optional because a `choices` or
   * `numeric` mission asks the student to interpret what the sim shows rather
   * than to drive it to a particular state, so it has nothing to poll.
   */
  check?: () => boolean;
  /** If true, the student must click "Check my setup" — no auto-complete on tick. */
  verify?: boolean;
  /** Pick-one challenge (e.g. reaction order, phase name). */
  choices?: { label: string; value: string }[];
  validateChoice?: (value: string) => boolean;
  /** Typed numeric answer (e.g. node count, crossover T). */
  numeric?: { label: string; placeholder?: string; step?: number; validate: (n: number) => boolean };
}

export interface MissionLadderHandle {
  el: HTMLElement;
  tick: () => void;
}

/** Sequential mission ladder — one shared helper for every simulation tab. */
export function missionLadder(defs: MissionDef[]): MissionLadderHandle {
  const solved = defs.map(d => isSolved(d.id));
  const hintIdx = defs.map(() => 0);
  const announce = h('div', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });

  // ---- pager ----
  // One mission on screen at a time. A card with three missions stacked was
  // taller than the simulation it belonged to, which pushed the actual controls
  // below the fold — the ladder was crowding out the thing it teaches.
  const pageLabel = h('span', { class: 'mission-page-label' });
  const prevBtn = h('button', { type: 'button', class: 'btn mission-page-btn', 'aria-label': 'Previous mission' }, '‹');
  const nextBtn = h('button', { type: 'button', class: 'btn mission-page-btn', 'aria-label': 'Next mission' }, '›');
  const dots = h('div', { class: 'mission-dots' });
  const pager = h('div', { class: 'mission-pager' }, prevBtn, pageLabel, dots, nextBtn);
  let view = 0;

  const wrap = h('div', { class: 'mission-ladder', role: 'region', 'aria-label': 'Missions' }, announce, pager);

  interface Row {
    def: MissionDef;
    root: HTMLElement;
    meterWrap: HTMLElement;
    meterBar: HTMLElement;
    meterLabel: HTMLElement;
    hintBox: HTMLElement;
    feedback: HTMLElement;
    success: HTMLElement;
    verifyBtn: HTMLButtonElement | null;
    choiceBar: HTMLElement | null;
    numInput: HTMLInputElement | null;
  }
  const rows: Row[] = [];

  function firstOpen(): number {
    const i = solved.findIndex(s => !s);
    return i < 0 ? defs.length : i;
  }

  // Show a row as complete and retire its controls. Split out from setSolved
  // because a mission can also become solved WITHOUT being solved here — a
  // second tab, or a cloud sync landing, fires onProgressChange instead.
  function paintSolved(i: number): void {
    const r = rows[i];
    r.success.replaceChildren(
      h('span', { html: `${CHECK_ICON}<span><strong>Mission complete.</strong> ${defs[i].explain ?? ''}</span>` }),
      // Replay exists because a mission could previously complete itself: any
      // tick where check() happened to pass marked it solved, so a student who
      // simply dragged a slider across the target arrived at a finished mission
      // they never attempted. That is fixed going forward, but the stored
      // completions it already created are permanent without a way out.
      button('Replay', () => replay(i), 'mission-replay'),
    );
    r.success.hidden = false;
    r.meterWrap.hidden = true;
    typesetMath(r.success);
    if (r.verifyBtn) r.verifyBtn.disabled = true;
    if (r.choiceBar) for (const b of r.choiceBar.querySelectorAll('button')) b.disabled = true;
    if (r.numInput) r.numInput.disabled = true;
  }

  /** Put a solved mission back into play, and forget that it was solved. */
  function replay(i: number): void {
    const r = rows[i];
    solved[i] = false;
    unmarkSolved(defs[i].id);
    r.success.hidden = true;
    r.feedback.textContent = '';
    r.hintBox.hidden = true;
    r.hintBox.replaceChildren();
    hintIdx[i] = 0;
    if (r.verifyBtn) r.verifyBtn.disabled = false;
    if (r.choiceBar) for (const b of r.choiceBar.querySelectorAll('button')) b.disabled = false;
    if (r.numInput) { r.numInput.disabled = false; r.numInput.value = ''; }
    view = i;
    refreshLocks();
  }

  function setSolved(i: number): void {
    if (solved[i]) return;
    solved[i] = true;
    markSolved(defs[i].id);
    paintSolved(i);
    announce.textContent = `Mission complete: ${defs[i].prompt.replace(/<[^>]+>/g, '')}`;
    refreshLocks();
    // Stay on the mission just solved so its explanation can be read — the
    // explanation IS the teaching — but tell the reader where to go next.
    nextBtn.classList.toggle('mission-next-ready', i === view && view < defs.length - 1);
  }

  // Redraw one row's proximity meter. Separated from tick() so unlocking a
  // mission can fill its meter immediately — otherwise a newly opened mission
  // shows an empty bar until the student next touches a control, which on a
  // slider-driven tab means it looks broken until they guess what to move.
  function paintMeter(i: number): void {
    const r = rows[i];
    if (solved[i] || i > firstOpen()) { r.meterWrap.hidden = true; return; }
    const m = r.def.meter?.();
    if (!m) { r.meterWrap.hidden = true; return; }
    r.meterBar.style.width = `${Math.max(0, Math.min(100, m.pct))}%`;
    r.meterLabel.textContent = m.label;
    r.meterWrap.hidden = false;
  }

  function refreshLocks(): void {
    const open = firstOpen();
    rows.forEach((r, i) => {
      r.root.classList.toggle('mission-locked', !solved[i] && i > open);
      r.root.classList.toggle('mission-active', !solved[i] && i === open);
      r.root.classList.toggle('mission-solved', solved[i]);
      paintMeter(i);
    });
    paintPager();
  }

  /** Show only the mission being viewed, and update the pager chrome. */
  function paintPager(): void {
    view = Math.max(0, Math.min(defs.length - 1, view));
    rows.forEach((r, i) => { r.root.hidden = i !== view; });
    pageLabel.textContent = `Mission ${view + 1} of ${defs.length}`;
    prevBtn.disabled = view === 0;
    nextBtn.disabled = view === defs.length - 1;
    // A dot per mission: filled when solved, ringed for the one you are on.
    // Cheaper to read at a glance than the label, and it restores the sense of
    // a LADDER that showing one mission at a time would otherwise lose.
    dots.replaceChildren(...defs.map((_, i) => {
      const d = h('button', {
        type: 'button',
        class: `mission-dot${solved[i] ? ' done' : ''}${i === view ? ' current' : ''}`,
        'aria-label': `Mission ${i + 1}${solved[i] ? ', complete' : ''}`,
        'aria-current': i === view ? 'true' : 'false',
        onclick: () => { view = i; paintPager(); },
      });
      return d;
    }));
    // The pager is noise on a single-mission card.
    pager.hidden = defs.length < 2;
  }

  function wrongFeedback(i: number, msg: string): void {
    const r = rows[i];
    r.feedback.textContent = msg;
    r.root.classList.add('mission-shake');
    setTimeout(() => r.root.classList.remove('mission-shake'), 400);
  }

  defs.forEach((def, i) => {
    const meterWrap = h('div', { class: 'mission-meter-wrap' },
      h('div', { class: 'mission-meter-track' }, h('div', { class: 'mission-meter-fill' })),
      h('span', { class: 'mission-meter-label' }, ''),
    );
    const meterBar = meterWrap.querySelector('.mission-meter-fill') as HTMLElement;
    const meterLabel = meterWrap.querySelector('.mission-meter-label') as HTMLElement;
    const hintBox = h('div', { class: 'mission-hint', hidden: '' });
    const feedback = h('div', { class: 'mission-feedback', 'aria-live': 'polite' });
    const success = h('div', { class: 'mission-success', hidden: '' });
    const actions = h('div', { class: 'mission-actions' });

    let verifyBtn: HTMLButtonElement | null = null;
    let choiceBar: HTMLElement | null = null;
    let numInput: HTMLInputElement | null = null;

    if (def.verify || (!def.choices && !def.numeric)) {
      verifyBtn = button(def.verify ? 'Check my setup' : 'Check answer', () => {
        if (solved[i] || i > firstOpen()) return;
        feedback.textContent = '';
        if (def.check?.()) setSolved(i);
        else wrongFeedback(i, 'Not quite — adjust the controls and try again.');
      }, 'mission-check');
      actions.appendChild(verifyBtn);
    }

    if (def.choices?.length) {
      choiceBar = h('div', { class: 'mission-choices', role: 'group' });
      for (const c of def.choices) {
        const cb = button(c.label, () => {
          if (solved[i] || i > firstOpen()) return;
          feedback.textContent = '';
          if (def.validateChoice?.(c.value)) setSolved(i);
          else wrongFeedback(i, 'That choice doesn\'t match what the sim shows — try again.');
        }, 'mission-choice');
        choiceBar.appendChild(cb);
      }
      actions.appendChild(choiceBar);
    }

    if (def.numeric) {
      numInput = h('input', {
        type: 'number', class: 'mission-num', step: def.numeric.step ?? 1,
        placeholder: def.numeric.placeholder ?? '', autocomplete: 'off',
        'aria-label': def.numeric.label,
      });
      const numBtn = button('Submit', () => {
        if (solved[i] || i > firstOpen()) return;
        feedback.textContent = '';
        const n = Number(numInput!.value);
        if (!Number.isFinite(n)) { wrongFeedback(i, 'Enter a number.'); return; }
        if (def.numeric!.validate(n)) setSolved(i);
        else wrongFeedback(i, 'That value doesn\'t match — count again or re-read the prompt.');
      }, 'mission-check');
      actions.appendChild(h('label', { class: 'mission-num-row' },
        h('span', { class: 'ctl-label' }, def.numeric.label), numInput, numBtn));
    }

    if (def.hints?.length) {
      actions.appendChild(button('Hint', () => {
        if (solved[i] || i > firstOpen()) return;
        const hi = hintIdx[i];
        if (hi >= def.hints!.length) return;
        hintBox.hidden = false;
        hintBox.appendChild(h('p', {}, `Hint ${hi + 1}: ${def.hints![hi]}`));
        hintIdx[i]++;
        typesetMath(hintBox);
      }, 'mission-hint-btn'));
    }

    const promptEl = h('div', { class: 'mission-prompt', html: `<span class="mission-badge">Mission ${i + 1}</span> ${def.prompt}` });
    const root = h('div', { class: 'mission-strip' },
      promptEl, meterWrap, actions, hintBox, feedback, success,
    );
    rows.push({ def, root, meterWrap, meterBar, meterLabel, hintBox, feedback, success, verifyBtn, choiceBar, numInput });
    wrap.appendChild(root);
  });

  // Progress can also arrive from elsewhere — a cloud sync completing after
  // sign-in, or the same mission solved in another open tab.
  onProgressChange(() => {
    defs.forEach((d, i) => {
      if (!solved[i] && isSolved(d.id)) { solved[i] = true; paintSolved(i); }
    });
    refreshLocks();
  });

  /**
   * Repaint the live meters. It does NOT complete anything.
   *
   * It used to: any mission without `choices`/`numeric` was marked solved the
   * instant `check()` returned true on a tick. That sounds generous and is
   * actually the "missions are already finished" bug — a student dragging a
   * slider to see what it does sweeps THROUGH the target value, the tick fires
   * mid-drag, and the mission completes before they have understood, or even
   * read, what it asked. Measured on a clean profile: sweeping every control
   * once, as anyone exploring would, self-completed **16 of 68 missions** with
   * no answer ever submitted. Worse, completion is permanent, so every later
   * visit shows a mission the student never actually did.
   *
   * Completing a mission is now always a deliberate act — "Check answer", a
   * choice, or a submitted number. The meter still gives live feedback while
   * you experiment, which is the part that was genuinely useful.
   */
  function tick(): void {
    rows.forEach((_, i) => paintMeter(i));
  }

  prevBtn.addEventListener('click', () => { view--; paintPager(); });
  nextBtn.addEventListener('click', () => {
    view++;
    nextBtn.classList.remove('mission-next-ready');
    paintPager();
  });

  typesetMath(wrap);
  // Paint the missions this student already finished in an earlier session.
  // `solved` was read from storage at the top, so the test is on `solved[i]`
  // itself — testing `isSolved(id) && !solved[i]` can never fire, which left a
  // returning student looking at a solved mission with its controls still live.
  solved.forEach((s, i) => { if (s) paintSolved(i); });
  // Open on the first UNSOLVED mission: a returning student wants the one they
  // still owe, not a wall of things they already did.
  view = Math.min(firstOpen(), defs.length - 1);
  refreshLocks();
  tick();
  return { el: wrap, tick };
}

// Append screen-reader-only text to an element, once.
function srSuffix(el: Element, text: string): void {
  if (el.querySelector('.sr-only')) return;
  el.appendChild(h('span', { class: 'sr-only' }, ` — ${text}`));
}
