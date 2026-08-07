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
  onProgressChange, currentEmail, isCloudConfigured,
} from './progress';
import { ALL_MC, ALL_FRQ, byTopic, byComp, questionById, QUIZ_BANKS } from './content/registry';
import { DOMAINS, EXAM_TOPIC_LABEL, type ExamTopicId } from './content/topicIds';
import { TOPICS, topicById } from './topics';
import { TILE_HTML } from './home';
import { navigate } from './router';
import { activeMode, activeComp, onModeChange, MODE_SHORT } from './mode';

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
  window.addEventListener('resize', draw);
  return h('div', { class: 'spark' }, svg);
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
    h('div', { class: 'home-wrap' },
      h('div', { class: 'home-top' },
        h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b><small>CCC Trainer</small>` }),
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
      historySection(),
      ...bookmarkSection(marks),
    );

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
    function bookmarkSection(ids: string[]): HTMLElement[] {
      if (!ids.length) return [];
      const list = h('div', { class: 'history' },
        ...ids.map(id => {
          const topic = topicById(id);
          const name = topic ? topic.title : label(id);
          if (!name) return null;   // a bookmark whose question has since been removed
          const row = h('div', { class: 'history-row bookmark-row' },
            h('span', { class: 'history-q' }, name),
            h('span', { class: 'history-topic' }, topic ? 'Module' : 'Question'),
            h('button', {
              type: 'button', class: 'btn', onclick: () => { toggleBookmark(id); row.remove(); },
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
