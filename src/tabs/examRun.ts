// Timed exam simulation (ROADMAP G.4).
//
// ── ON THE TIMINGS ──────────────────────────────────────────────────────────
// This repo has never stated an official exam duration anywhere, and it should
// not start now: the mock papers claim to match STRUCTURE AND DIFFICULTY, never
// timing, and a made-up "60 minutes" printed next to a CCC logo would be the
// first unverified exam fact in the codebase — and would look authoritative.
//
// So the numbers below are PRACTICE PACING, derived from a per-question
// allowance, and every string in the UI says so. They are not a claim about any
// real contest. If real durations are ever sourced, replace ALLOWANCE with the
// official figures and change the wording in one place; nothing else depends on
// the arithmetic.
// ────────────────────────────────────────────────────────────────────────────
import { h, card, quiz, button, type QuizQ } from './framework';
import type { FRQ } from './bankPart2';
import type { OlympiadPaper } from './bankOlympiad';
import { MODE_SHORT, activeMode } from '../mode';

/**
 * Minutes allowed per question, by kind — the whole timing model.
 *
 * A multiple-choice item is a couple of minutes of work; a multi-part written
 * problem is a quarter of an hour. Deliberately coarse: this is a pacing aid,
 * and precision it cannot justify would be false precision.
 */
const ALLOWANCE = { mc: 2.5, written: 15 };

export interface ExamPlan {
  mcCount: number;
  writtenCount: number;
  minutes: number;
}

export function planFor(paper: OlympiadPaper): ExamPlan {
  const mcCount = paper.partA.length;
  const writtenCount = paper.partB.length;
  return {
    mcCount,
    writtenCount,
    minutes: Math.round(mcCount * ALLOWANCE.mc + writtenCount * ALLOWANCE.written),
  };
}

// h:mm:ss once past the hour. A full paper budgets over two hours, and "123:00"
// is a number a reader has to stop and divide.
const mmss = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor(total / 60) % 60, s = total % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
};

/**
 * A run of one paper against a clock.
 *
 * THE CLOCK NEVER BLOCKS ANYTHING. When it reaches zero the run is marked
 * over-time and keeps going — this is practice, and a timer that locks a
 * student out of the question they were mid-way through teaches nothing except
 * not to use the timer. What it does is report honestly: how long you took, and
 * whether that was inside the allowance.
 *
 * Wall-clock based (`Date.now()` deltas), not a tick counter: an interval that
 * misses ticks while the tab is backgrounded would silently hand out extra
 * time, which is the one thing a practice clock must not do.
 */
export function examRun(paper: OlympiadPaper, onExit: () => void): HTMLElement {
  const plan = planFor(paper);
  const budgetMs = plan.minutes * 60_000;

  let startedAt = 0;
  let finishedAt = 0;
  let ticker: number | undefined;

  const clock = h('span', { class: 'exam-clock' });
  const clockNote = h('span', { class: 'exam-clock-note' });
  const body = h('div', {});

  const startBtn = button('Start the clock', () => start(), 'primary');
  const finishBtn = button('Finish and stop the clock', () => finish());
  finishBtn.hidden = true;

  const head = card(`${paper.label} — timed practice`,
    h('p', { class: 'section-lede' },
      `${plan.mcCount} multiple choice and ${plan.writtenCount} written problem`
      + `${plan.writtenCount === 1 ? '' : 's'}. `
      + `Suggested pacing: ${plan.minutes} minutes.`),
    // The disclaimer is not fine print — it is the difference between a pacing
    // aid and a false claim about a real contest.
    h('p', { class: 'muted exam-disclaimer' },
      `This is a practice pace (${ALLOWANCE.mc} min per multiple-choice question, `
      + `${ALLOWANCE.written} min per written problem), not the official time limit for any contest. `
      + 'The mock papers match the structure and difficulty of real papers, not their timing.'),
    h('div', { class: 'exam-clock-row' }, clock, clockNote,
      h('span', { class: 'exam-clock-spacer' }), startBtn, finishBtn,
      button('Leave', () => { stop(); onExit(); }),
    ),
  );

  function paint(): void {
    if (!startedAt) { clock.textContent = mmss(budgetMs); clock.classList.remove('over'); clockNote.textContent = 'not started'; return; }
    const end = finishedAt || Date.now();
    const left = budgetMs - (end - startedAt);
    clock.textContent = mmss(Math.abs(left));
    clock.classList.toggle('over', left < 0);
    clockNote.textContent = finishedAt
      ? (left < 0 ? `over by ${mmss(-left)}` : `finished with ${mmss(left)} to spare`)
      : (left < 0 ? 'over the suggested pace — keep going' : 'remaining');
  }

  function start(): void {
    startedAt = Date.now();
    finishedAt = 0;
    startBtn.hidden = true;
    finishBtn.hidden = false;
    // 1 s is the display resolution; the value itself is a wall-clock delta, so
    // a missed tick costs a repaint, never time.
    ticker = window.setInterval(paint, 1000);
    paint();
    renderPaper();
  }

  function stop(): void {
    if (ticker !== undefined) { clearInterval(ticker); ticker = undefined; }
  }

  function finish(): void {
    finishedAt = Date.now();
    stop();
    finishBtn.hidden = true;
    paint();
  }

  function renderPaper(): void {
    body.replaceChildren(
      card(`Part A — ${plan.mcCount} multiple choice`, quiz(paper.partA as QuizQ[])),
      writtenCard(paper.partB),
    );
  }

  /**
   * Part B under the clock deliberately does NOT expose the worked solutions.
   *
   * The whole point of a timed run is to find out what you can do unaided; a
   * "Show solution" button beside every part turns it back into the ordinary
   * browser, which is one click away in the Olympiad tab whenever the student
   * wants it. The prompts are shown so the work is real; the answers wait.
   */
  function writtenCard(items: FRQ[]): HTMLElement {
    return card(`Part B — ${items.length} written problem${items.length === 1 ? '' : 's'}`,
      h('p', { class: 'muted' },
        'Work these on paper. Solutions are deliberately not shown during a timed run — '
        + 'open the paper in the Olympiad tab to check your answers afterwards.'),
      ...items.map((f, i) => h('div', { class: 'exam-frq' },
        h('h3', {}, `B${i + 1} — ${f.title}`),
        h('div', { class: 'result', html: f.prompt }),
        ...f.parts.map(p => h('p', { class: 'exam-frq-part', html: `<b>${p.q}</b>` })),
      )),
    );
  }

  paint();
  return h('div', { class: 'exam-run' },
    h('p', { class: 'exam-mode-note muted' },
      `Competition mode: ${MODE_SHORT[activeMode()]}. The mock papers follow the Canadian Chemistry `
      + 'Contest structure; the mode does not change a paper, because a paper is a fixed artefact.'),
    head, body);
}
