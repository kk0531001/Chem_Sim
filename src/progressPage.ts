// The /progress dashboard (ROADMAP Phase E) — a DISPLAY layer, nothing more.
//
// Every number here is a pure read over the attempt log and solved set in
// progress.ts; this file adds no state and records no attempts. It imports the
// registry, so it is lazily loaded by main.ts and never on the entry path.
//
// The one thing worth knowing before reading the layout: **accuracy and
// coverage are keyed on the same vocabulary**, the twelve ExamTopicIds. The
// attempt log records `toExamTopic(q.topic)`, so an accuracy figure for a
// MODULE cannot exist — thermo1 and thermo2 both write into `thermo`, and a
// per-module column would have shown the same percentage twice and called it
// two measurements. Modules get a coverage bar (on their topic cards, E.3);
// exam topics get both numbers, from one key.
import { h } from './tabs/framework';
import {
  solvedOf, attemptCount, accuracyByTopic, weakTopics, streakDays, bestStreak,
  dailyCounts, recentAttempts, wrongQuestionIds, bookmarkIds, toggleBookmark,
  repeatedlyMissed,
  onProgressChange, currentEmail, isCloudConfigured,
  accuracyBySkill,
  resetAllProgress,
} from './progress';
import { ALL_MC, ALL_FRQ, byTopic, byComp, questionById, QUIZ_BANKS, nextQuestion } from './content/registry';
import { DOMAINS, EXAM_TOPIC_LABEL, type ExamTopicId } from './content/topicIds';
import { skillLabel } from './content/skills';
import { TOPICS, topicById } from './topics';
import { TILE_HTML } from './home';
import { navigate } from './router';
import { activeMode, activeComp, onModeChange, MODE_SHORT } from './mode';
import { recommendNext } from './recommend';

// ---- shared marks ---------------------------------------------------------

/** Status is never colour alone: --green and --red are ΔE 3.0 apart under
 *  deuteranopia, so the glyph and the visually-hidden word carry it. */
const TICK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5"/></svg>`;
const CROSS = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>`;
const WARN = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 2.5 15 14H1L8 2.5Z" stroke-linejoin="round"/><path d="M8 6.5v3.2M8 11.6v.5" stroke-linecap="round"/></svg>`;

const pct = (x: number): string => `${Math.round(x * 100)}%`;

/** A coverage bar: fill grows from the left baseline, 4px rounded data-end. */
function bar(done: number, total: number): HTMLElement {
  const p = total ? Math.round((done / total) * 100) : 0;
  return h('div', { class: 'pbar', role: 'img', 'aria-label': `${done} of ${total} solved` },
    h('div', { class: `pbar-fill${done ? '' : ' zero'}`, style: `width:${done ? Math.max(p, 2) : 0}%` }),
  );
}

/**
 * Answers-per-day sparkline. Drawn against the element's real pixel width
 * rather than a stretched viewBox — `preserveAspectRatio="none"` turns the
 * end-dot into a clipped ellipse at narrow widths.
 */
function sparkline(days: { day: string; n: number }[]): HTMLElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const wrap = h('div', { class: 'spark' }, svg);
  svg.setAttribute('aria-hidden', 'true');
  const draw = (): void => {
    const w = Math.max(240, Math.round(svg.getBoundingClientRect().width));
    const hgt = 52, pad = 5;
    const max = Math.max(1, ...days.map(d => d.n));
    const x = (i: number): number => pad + i * ((w - pad * 2) / Math.max(1, days.length - 1));
    const y = (v: number): number => hgt - pad - (v / max) * (hgt - pad * 2);
    svg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    const d = days.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v.n).toFixed(1)}`).join(' ');
    svg.innerHTML =
      `<path d="${d}" fill="none" stroke="var(--accent-on-panel)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<circle cx="${x(days.length - 1).toFixed(1)}" cy="${y(days[days.length - 1].n).toFixed(1)}" r="3.5" fill="var(--accent-on-panel)" stroke="var(--panel)" stroke-width="2"/>`;
  };
  // First paint happens before layout has run, so the width read would be 0;
  // rAF puts it after. Redrawn on resize because the geometry is in pixels.
  requestAnimationFrame(draw);
  // ResizeObserver, not a window listener. sparkline() is called from render(),
  // which re-runs on every progress and mode change — a window listener per
  // render accumulated, each one holding a detached SVG alive, and answering
  // questions with this page open leaked one per answer. An observer bound to
  // the element goes away with the element, and it also catches the case a
  // window listener never did: the sidebar collapsing changes this element's
  // width without the window resizing at all.
  new ResizeObserver(draw).observe(wrap);
  return wrap;
}

// `lead` is the one oversized figure on the page. NOT called `hero` — that
// class already belongs to the homepage's hero grid, and a `.readout.hero` here
// silently inherited its 128px padding and blew the panel to 549px tall.
function readout(label: string, value: string, unit: string, sub: string, lead = false): HTMLElement {
  return h('div', { class: `readout${lead ? ' readout-lead' : ''}` },
    h('div', { class: 'readout-label' }, label),
    h('div', { class: 'readout-value' }, value, h('small', {}, unit)),
    h('div', { class: 'readout-sub' }, sub),
  );
}

// ---- the page -------------------------------------------------------------

export function buildProgressPage(): HTMLElement {
  // Same page shell as the menu directory (#menu-page / .home-wrap / .home-top)
  // so the dashboard reads as another page of the site rather than a console
  // bolted onto it.
  const body = h('div', {});
  const page = h('div', { id: 'progress-page' },
    h('main', { class: 'home-wrap' },
      h('div', { class: 'home-top' },
        h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b><small>Chemistry, running</small>` }),
        h('button', { class: 'btn-ghost', onclick: () => navigate({ kind: 'home' }) }, '← Home'),
      ),
      body,
      h('div', { style: 'height:60px' }),
    ),
  );

  // Corpus totals are computed once: the arrays are static for the session.
  const allIds = [...ALL_MC.map(q => q.id), ...ALL_FRQ.map(f => f.id)];
  // One readable line per stored id, through the registry's shared lookup —
  // an MC is named by its prompt, a written problem by its title.
  const label = (id: string): string | undefined => {
    const q = questionById(id);
    if (!q) return undefined;
    return 'parts' in q ? q.title : q.q;
  };

  /** Open the question bank on a prepared results view — qbank restores the
   *  filters from the query string, so this needs no new UI over there. */
  const openBank = (params: Record<string, string>): void =>
    navigate({ kind: 'topic', id: 'qbank' }, false, '?' + new URLSearchParams({ part: 'results', ...params }));
  const openReview = (): void =>
    navigate({ kind: 'topic', id: 'qbank' }, false, '?part=review');

  /** Outcome of the last reset. Lives OUTSIDE render() because a successful
   *  reset calls render(), which rebuilds the danger zone from scratch and
   *  would otherwise throw away the very message confirming it worked. */
  let resetNotice: { text: string; ok: boolean } | null = null;

  function render(): void {
    const acc = accuracyByTopic();
    const seen = Object.values(acc).reduce((n, t) => n + t.seen, 0);
    const correct = Object.values(acc).reduce((n, t) => n + t.correct, 0);
    const solvedTotal = solvedOf(allIds);
    // Readiness is scoped by the registry's own comp index, so it can never
    // disagree with what the question bank shows for the same mode.
    const mode = activeMode();
    const comp = activeComp();
    const scopedIds = comp ? byComp(comp).map(q => q.id) : allIds;
    const scopedDone = solvedOf(scopedIds);
    const readiness = scopedIds.length ? scopedDone / scopedIds.length : 0;
    const wrong = wrongQuestionIds();
    const marks = bookmarkIds();
    const modulesTouched = TOPICS.filter(t => {
      const bank = (QUIZ_BANKS as Record<string, { id: string }[] | undefined>)[t.id];
      return bank && solvedOf(bank.map(q => q.id)) > 0;
    }).length;
    const moduleCount = Object.keys(QUIZ_BANKS).length;

    body.replaceChildren(
      // ---- head ----
      h('h1', { class: 'progress-title' }, 'Your progress'),
      h('p', { class: 'progress-lede' },
        'Everything you have answered, where it is going well, and the topics worth an hour this week.'),
      h('p', { class: 'progress-note' },
        h('b', {}, 'Accuracy covers multiple choice only. '),
        'Written problems and simulation missions are self-marked, so they count toward questions solved but never toward a percentage — a mark you gave yourself is not a graded answer.'),
      ...(isCloudConfigured() && !currentEmail()
        ? [h('p', { class: 'progress-signedout' },
            'This is your progress on this device. Sign in from the sidebar to sync it across devices.')]
        : []),

      // ---- the one thing to do next ----
      nextAction(),

      // ---- instrument panel ----
      h('div', { class: 'readout-panel' },
        readout('Questions solved', String(solvedTotal), `/${allIds.length}`,
          `${pct(solvedTotal / allIds.length)} of the corpus`, true),
        readout('MC accuracy', seen ? String(Math.round((correct / seen) * 100)) : '—', seen ? '%' : '',
          seen ? `${seen} graded answer${seen === 1 ? '' : 's'}` : 'answer a quiz to start'),
        readout('Current streak', String(streakDays()), 'd', `best ${bestStreak()} days`),
        // In a competition mode the fourth readout becomes READINESS: what
        // fraction of the questions actually in scope for that exam you have
        // solved. "72% CCC-ready" is a far better motivator than a raw count,
        // and unlike the corpus-wide figure it stops counting material the
        // student will never be asked (ROADMAP G).
        mode === 'all'
          ? readout('Modules started', String(modulesTouched), `/${moduleCount}`,
              `${moduleCount - modulesTouched} not yet opened`)
          : readout(`${MODE_SHORT[mode]} ready`, String(Math.round(readiness * 100)), '%',
              `${scopedDone} of ${scopedIds.length} in scope`),
        h('div', { class: 'spark-wrap' },
          h('div', { class: 'spark-head' },
            h('span', {}, 'Answers per day · last 30'),
            h('span', {}, `${attemptCount()} lifetime`)),
          sparkline(dailyCounts(30)),
        ),
      ),

      ...weakSection(acc),
      masterySection(),
      ...nextQuestionSection(),
      ...skillSection(),
      ...stickySection(),
      historySection(),
      ...bookmarkSection(marks),
      dangerZone(),
    );

    /**
     * ONE sentence and ONE button, above the numbers.
     *
     * The rest of this page answers "how am I doing". A student arriving at it
     * mid-revision is asking something narrower — what should I do right now —
     * and four readouts, a sparkline, three weak-topic cards and a mastery
     * grid make them infer the answer. This states it.
     *
     * Deliberately ONE action, not a ranked list: a list is the same
     * interpretation problem in a smaller box. The order below is the tutor's
     * order, not the data's:
     *   1. questions you got wrong and have not retried — the highest-yield
     *      study there is, and completely concrete
     *   2. otherwise your weakest topic, which is a pattern rather than a
     *      handful of slips
     *   3. otherwise the next lesson, which is also what a brand-new student
     *      with no history sees
     *
     * Everything here is already computed for the sections below; this adds no
     * new state and no new derived statistic.
     */
    function nextAction(): HTMLElement {
      const say = (sentence: string, label: string, go: () => void): HTMLElement =>
        h('section', { class: 'next-action' },
          h('p', { class: 'next-action-line' }, sentence),
          h('button', { type: 'button', class: 'btn primary', onclick: go }, label));

      if (wrong.length) {
        const n = wrong.length;
        return say(
          `You have ${n} question${n === 1 ? '' : 's'} you answered wrong and haven't come back to. Start there.`,
          'Review your mistakes', openReview);
      }
      const worst = weakTopics(1)[0];
      if (worst) {
        const t = worst.topic as ExamTopicId;
        const label = EXAM_TOPIC_LABEL[t] ?? worst.topic;
        return say(
          `${label} is your weakest topic — ${Math.round(worst.accuracy * 100)}% across ${worst.seen} answers.`,
          `Practise ${label}`, () => openBank({ topic: t }));
      }
      const rec = recommendNext('');
      if (rec) {
        return say(`Next lesson — ${rec.reason}.`, `Open ${rec.topic.title}`,
          () => navigate({ kind: 'topic', id: rec.topic.id }));
      }
      return say('Nothing outstanding. Pick anything from the bank and keep the streak going.',
        'Open the question bank', () => openBank({}));
    }

    // ---- weak topics ----
    function weakSection(a: ReturnType<typeof accuracyByTopic>): HTMLElement[] {
      const weak = weakTopics(3);
      if (!weak.length) {
        return [section('Focus here', 'Needs at least four answers in a topic',
          h('p', { class: 'muted' },
            'Nothing to flag yet — answer a few more questions and the weakest topics will surface here. ',
            h('button', { type: 'button', class: 'btn', onclick: () => openBank({}) }, 'Open the question bank')))];
      }
      return [section('Focus here', 'Lowest accuracy, at least four answers logged',
        h('div', { class: 'weak-grid' }, ...weak.map((w, i) => {
          const t = w.topic as ExamTopicId;
          const stat = a[w.topic];
          const n = byTopic(t).length;
          return h('article', { class: 'weak-card' },
            h('span', { class: 'weak-flag' }, h('span', { class: 'weak-flag-icon', html: WARN }), i === 0 ? 'Weakest' : 'Weak'),
            h('h3', {}, EXAM_TOPIC_LABEL[t] ?? w.topic),
            h('div', { class: 'weak-num' }, String(Math.round(w.accuracy * 100)), h('small', {}, '%')),
            h('p', { class: 'weak-sub' }, `${stat.correct} of ${stat.seen} correct`),
            h('div', { class: 'weak-cta' },
              h('button', {
                type: 'button', class: 'btn',
                onclick: () => openBank({ topic: t }),
              }, `Practice ${n} questions`)),
          );
        })))];
    }

    /**
     * Per-SKILL accuracy — the sub-skill level under a topic (revamp.md A1).
     *
     * "You are weak at equilibrium" is a label; "you set up ICE tables fine but
     * miss Q vs K" is something a student can act on this afternoon. That is
     * the whole difference this section is here to prove out.
     *
     * Only equilibrium is tagged so far, so this section HIDES ITSELF when
     * there is nothing to show rather than rendering an empty frame that
     * implies the feature is broken. It also states the window it covers: the
     * numbers come from the capped attempt log, so they are the last N answers
     * and not a lifetime record (see accuracyBySkill).
     */
    function skillSection(): HTMLElement[] {
      const skillOf = (id: string): string | undefined => {
        const q = questionById(id);
        return q && 'skill' in q ? (q as { skill?: string }).skill : undefined;
      };
      const rows = accuracyBySkill(skillOf).filter(r => r.seen >= 2);
      if (!rows.length) return [];
      const pretty = skillLabel;
      return [section('Where inside a topic', 'Recent answers only — sub-skills, worst first',
        h('div', { class: 'skill-list' }, ...rows.map(r => h('div', { class: 'skill-row' },
          h('span', { class: 'skill-name' }, pretty(r.skill)),
          h('span', { class: 'skill-bar' },
            h('span', { class: 'skill-fill', style: `width:${Math.round(r.accuracy * 100)}%` })),
          h('span', { class: 'skill-num' }, `${Math.round(r.accuracy * 100)}%`),
          h('span', { class: 'skill-seen' }, `${r.correct}/${r.seen}`),
        ))))];
    }

    // ---- mastery by exam topic ----
    function masterySection(): HTMLElement {
      const rows = h('div', { class: 'mastery' });
      for (const domain of DOMAINS) {
        const inDomain = domain.topics.filter(t => byTopic(t).length > 0);
        if (!inDomain.length) continue;
        rows.append(h('div', { class: 'mastery-group' }, domain.name));
        for (const t of inDomain) {
          const ids = byTopic(t).map(q => q.id);
          const done = solvedOf(ids);
          const a = acc[t];
          rows.append(h('div', { class: 'mastery-row' },
            h('div', { class: 'mastery-name' },
              h('button', { type: 'button', class: 'mastery-link', onclick: () => openBank({ topic: t }) }, EXAM_TOPIC_LABEL[t])),
            bar(done, ids.length),
            h('div', { class: 'mastery-frac' }, `${done}/${ids.length}`),
            h('div', { class: `mastery-acc${!a ? ' none' : a.accuracy < 0.6 ? ' low' : ''}` },
              a ? pct(a.accuracy) : '—'),
          ));
        }
      }
      return section('By topic', 'Bar = questions solved · figure at right = MC accuracy', rows);
    }

    // ---- recent answers ----
    /**
     * One question, chosen for this student, with the reason (plan2 §6).
     *
     * The page already shows weak topics, weak skills and a review queue — a
     * student can work out what to do from them. This does it in one click.
     * It renders nothing when there is no evidence to reason from: a card
     * saying "start anywhere" is worse than the browse button already there.
     */
    function nextQuestionSection(): HTMLElement[] {
      const next = nextQuestion();
      if (!next) return [];
      const text = label(next.id);
      return [section('Answer this next', next.reason,
        h('button', {
          type: 'button', class: 'btn primary',
          onclick: () => openBank({ q: next.id }),
        }, text ? `Open: ${text.slice(0, 70)}${text.length > 70 ? '…' : ''}` : 'Open the question'),
      )];
    }

    /**
     * Questions missed REPEATEDLY and still outstanding (plan2 §6).
     *
     * Deliberately separate from "Review your mistakes". One wrong answer is a
     * slip and belongs in the general queue; the same question wrong twice is a
     * gap in what the student believes, and the fix is to read that specific
     * explanation again rather than to grind the whole queue.
     *
     * Hides itself when empty — a nagging "0 questions you keep missing" panel
     * is noise on the page of a student who is doing fine.
     */
    function stickySection(): HTMLElement[] {
      const rows = repeatedlyMissed().slice(0, 8);
      if (!rows.length) return [];
      return [section('You keep missing these', 'Wrong at least twice and still outstanding',
        h('div', { class: 'history' }, ...rows.map(r => {
          const text = label(r.id);
          return h('div', { class: 'history-row' },
            text
              ? h('button', {
                  type: 'button', class: 'history-q link-btn',
                  onclick: () => openBank({ q: r.id }),
                }, text)
              : h('span', { class: 'history-q' }, r.id),
            h('span', { class: 'history-topic' }, `${r.wrong} wrong of ${r.seen}`),
          );
        })),
      )];
    }

    function historySection(): HTMLElement {
      let onlyWrong = false;
      const list = h('div', { class: 'history' });
      const paint = (): void => {
        const items = recentAttempts(200).filter(at => !onlyWrong || !at.correct).slice(0, 50);
        list.replaceChildren(...(items.length ? items.map(at => h('div', { class: 'history-row' },
          h('span', { class: `history-mark ${at.correct ? 'ok' : 'no'}`, html: at.correct ? TICK : CROSS },
            h('span', { class: 'sr-only' }, at.correct ? 'Correct' : 'Incorrect')),
          h('span', { class: 'history-q' }, label(at.questionId) ?? at.questionId),
          h('span', { class: 'history-topic' },
            at.topic ? EXAM_TOPIC_LABEL[at.topic as ExamTopicId] ?? at.topic : ''),
          h('span', { class: 'history-when' }, ago(at.at)),
        )) : [h('p', { class: 'muted history-empty' }, onlyWrong ? 'Nothing wrong in the recent log.' : 'No answers logged yet.')]));
      };
      // `.pill` is the site's existing filter-chip; `active` is what styles it
      // and `aria-pressed` is what says so out loud. Both, always together.
      const allBtn = h('button', { type: 'button', class: 'pill active', 'aria-pressed': 'true' }, 'All');
      const wrongBtn = h('button', { type: 'button', class: 'pill', 'aria-pressed': 'false' }, 'Wrong only');
      const setFilter = (w: boolean): void => {
        onlyWrong = w;
        allBtn.classList.toggle('active', !w);
        wrongBtn.classList.toggle('active', w);
        allBtn.setAttribute('aria-pressed', String(!w));
        wrongBtn.setAttribute('aria-pressed', String(w));
        paint();
      };
      allBtn.onclick = () => setFilter(false);
      wrongBtn.onclick = () => setFilter(true);
      paint();
      return section('Recent answers', 'Last 50 · the log is capped, so the oldest rotate out',
        h('div', { class: 'progress-filters' },
          allBtn, wrongBtn,
          h('span', { class: 'spacer' }),
          wrong.length
            // The review queue, not a `status=wrong` filter: same questions,
            // but ordered oldest-mistake-first instead of corpus order.
            ? h('button', { type: 'button', class: 'btn primary', onclick: () => openReview() },
                `Review the ${wrong.length} you got wrong`)
            : null,
        ),
        list);
    }

    // ---- bookmarks ----
    /**
     * Erase everything. Two-step, because it cannot be undone and it reaches
     * the account as well as this browser.
     *
     * The confirm step names REAL COUNTS rather than saying "are you sure":
     * "412 solved, 1,203 answers, 18 bookmarks" is a sentence someone can
     * actually check against what they expected to lose, and it is the
     * difference between a confirmation and a speed bump.
     */
    function dangerZone(): HTMLElement {
      const signedIn = !!currentEmail();
      const counts = `${solvedTotal} solved · ${attemptCount()} answer${attemptCount() === 1 ? '' : 's'} · ${marks.length} bookmark${marks.length === 1 ? '' : 's'}`;
      // role=status: this carries the result of the one irreversible action on
      // the site, including the multi-sentence failure text below. Announcing it
      // is not optional.
      const status = h('p', {
        class: `danger-status${resetNotice ? (resetNotice.ok ? ' good' : ' bad') : ''}`,
        role: 'status',
      }, resetNotice?.text ?? '');
      const row = h('div', { class: 'danger-row' });

      const armed = (): void => {
        row.replaceChildren(
          h('p', { class: 'danger-confirm' },
            `Delete ${counts}${signedIn ? ', on this device and in your account' : ''}? This cannot be undone.`),
          h('div', { class: 'danger-actions' },
            h('button', { type: 'button', class: 'btn danger', onclick: run }, 'Yes, erase it all'),
            h('button', { type: 'button', class: 'btn', onclick: idle }, 'Cancel')),
        );
        (row.querySelector('button') as HTMLButtonElement | null)?.focus();
      };
      const idle = (): void => {
        // ALWAYS offered, and never relabelled. An earlier version disabled
        // this and showed "Nothing to reset" when the local counts were zero,
        // which was wrong twice over. It hid the control from anyone who came
        // looking for it — a disabled button with a different name is not
        // findable — and the emptiness test only saw LOCAL state, so a signed-in
        // student on a fresh browser was refused the one button that clears
        // their account. Pressing it with nothing to erase costs nothing.
        row.replaceChildren(
          h('button', { type: 'button', class: 'btn', onclick: armed }, 'Reset all progress'));
      };
      async function run(): Promise<void> {
        row.replaceChildren(h('p', { class: 'danger-confirm' }, 'Erasing…'));
        const res = await resetAllProgress();
        if (res.cloud === 'failed') {
          // Local data is untouched — resetAllProgress leaves it alone when the
          // server refuses. The CLOUD side is not all-or-nothing though: the
          // three deletes are separate PostgREST requests, so solved rows can
          // be gone while attempts failed. Hence "may already have been
          // removed" rather than the flat "nothing was deleted" this used to
          // claim.
          // No render() here: nothing changed, so repainting would only
          // discard the explanation the student needs to read.
          resetNotice = null;
          status.textContent = `The reset did not complete: ${res.error ?? 'unknown error'}. Some of your account data may already have been removed — try again, or sign out to clear this device only.`;
          status.className = 'danger-status bad';
          idle();
          return;
        }
        resetNotice = {
          ok: true,
          text: res.cloud === 'cleared'
            ? 'Everything erased, here and in your account.'
            : 'Everything on this device erased.',
        };
        render();   // repaint against the now-empty state; dangerZone re-reads the notice
      }
      idle();

      return section('Reset', 'Permanent — there is no undo',
        h('p', { class: 'danger-lede' },
          'Clears every solved question and simulation mission, the whole answer history behind your accuracy and streaks, your bookmarks, and where you left off in each module. ',
          signedIn
            ? h('b', {}, 'You are signed in, so this also deletes them from your account and from every other device.')
            : h('span', {}, 'This browser only — you are not signed in.')),
        row, status);
    }

    function bookmarkSection(ids: string[]): HTMLElement[] {
      if (!ids.length) return [];
      const list = h('div', { class: 'history' },
        ...ids.map(id => {
          const topic = topicById(id);
          const name = topic ? topic.title : label(id);
          if (!name) return null;   // a bookmark whose question has since been removed
          // The name is a BUTTON when it navigates: the row's own onclick below
          // is a mouse convenience, and a div click has no keyboard path at all.
          // Same split topics.ts uses for its cards.
          const nameEl = topic
            ? h('button', { type: 'button', class: 'history-q link-btn', onclick: () => navigate({ kind: 'topic', id }) }, name)
            : h('span', { class: 'history-q' }, name);
          const row = h('div', { class: 'history-row bookmark-row' },
            nameEl,
            h('span', { class: 'history-topic' }, topic ? 'Module' : 'Question'),
            h('button', {
              // N identical "Remove" buttons are indistinguishable in a screen
              // reader's button list without the item name.
              type: 'button', class: 'btn', 'aria-label': `Remove bookmark: ${name}`,
              onclick: () => { toggleBookmark(id); row.remove(); },
            }, 'Remove'),
          );
          if (topic) {
            row.classList.add('clickable');
            row.onclick = e => { if (!(e.target as HTMLElement).closest('button')) navigate({ kind: 'topic', id }); };
          }
          return row;
        }).filter((r): r is HTMLDivElement => !!r));
      return [section('Saved', `${ids.length} bookmarked`, list)];
    }
  }

  function section(title: string, note: string, ...body: (Node | null)[]): HTMLElement {
    return h('section', { class: 'progress-section' },
      h('div', { class: 'progress-section-head' }, h('h2', {}, title), h('p', {}, note)),
      ...body,
    );
  }

  render();
  // The dashboard is a live view of the same store the quizzes write to, so a
  // bookmark toggled here (or an answer synced in from another device) repaints
  // rather than going stale behind the user's back.
  onProgressChange(() => { if (!page.hidden) render(); });
  onModeChange(() => { if (!page.hidden) render(); });
  return page;
}

/** Coarse relative time — the exact clock time of an attempt is never the point. */
function ago(at: number): string {
  const s = Math.max(0, (Date.now() - at) / 1000);
  if (s < 90) return 'just now';
  if (s < 5400) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
