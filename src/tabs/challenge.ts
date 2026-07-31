// Challenge Mode (ROADMAP Phase C.3): an end-of-lesson Bronze -> Silver ->
// Gold -> Platinum ladder pulled straight from the registry's ladderFor(),
// so it needs no new content and can never drift from tierOf()/compsOf().
// A tier unlocks once every item in the tier below it is solved; the
// Platinum tier is framed as the payoff, per the roadmap's own wording.
import { h, card, quiz, button, typesetMath, type QuizQ } from './framework';
import type { FRQ } from './bankPart2';
import { ladderFor, type Indexable } from '../content/registry';
import type { Tier } from '../content/topicIds';
import { isSolved, markSolved, unmarkSolved, onProgressChange } from '../progress';

const TIER_LABEL: Record<Tier, string> = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum' };
const TIER_CLASS: Record<Tier, string> = { 1: 'tier-bronze', 2: 'tier-silver', 3: 'tier-gold', 4: 'tier-platinum' };
const TIERS: Tier[] = [1, 2, 3, 4];

function isFRQ(item: Indexable): item is FRQ {
  return 'parts' in item;
}

function tierSolved(items: Indexable[]): boolean {
  return items.length > 0 && items.every(q => isSolved(q.id));
}

// Small single-problem FRQ renderer (Platinum/Gold items are usually one-offs
// pulled from the CCO/Integrated/Part II banks) — deliberately not the
// Prev/Next browser in qbank.ts, since a challenge tier is a handful of
// items shown at once, not a set to page through.
function frqItem(f: FRQ): HTMLElement {
  const solveBtn = button('', () => { isSolved(f.id) ? unmarkSolved(f.id) : markSolved(f.id); syncBtn(); });
  function syncBtn(): void {
    const done = isSolved(f.id);
    solveBtn.textContent = done ? '✓ Solved — click to unmark' : 'Mark as solved';
    solveBtn.className = done ? 'btn primary' : 'btn';
  }
  syncBtn();
  const el = h('div', { class: 'challenge-frq' },
    h('h4', {}, f.title),
    h('div', { class: 'result', html: f.prompt }),
    ...f.parts.map(p => {
      const sol = h('div', { class: 'result', html: p.a });
      sol.style.display = 'none';
      const btn = button('Show solution', () => {
        const hidden = sol.style.display === 'none';
        sol.style.display = hidden ? '' : 'none';
        btn.textContent = hidden ? 'Hide solution' : 'Show solution';
      });
      return h('div', { style: 'margin-top:12px' }, h('p', { html: `<b>${p.q}</b>` }), btn, sol);
    }),
    h('div', { style: 'margin-top:12px' }, solveBtn),
  );
  typesetMath(el);
  return el;
}

/**
 * Card for one module's challenge ladder, or null if the module has nothing
 * to build one from (e.g. it has no Silver/Gold items of its own yet).
 * Mount it once, next to the module's "Quick quiz" card — it re-renders on
 * every progress change so credit for solving a tier's item elsewhere (the
 * exam question bank, another topic's shared pool) still unlocks the next
 * rung here.
 */
export function challengeLadder(moduleId: string): HTMLElement | null {
  const ladder = ladderFor(moduleId);
  if (TIERS.every(t => ladder[t].length === 0)) return null;

  const body = h('div', { class: 'challenge-ladder' });

  function render(): void {
    body.replaceChildren();
    let unlocked = true;
    let prevLabel = '';
    for (const t of TIERS) {
      const items = ladder[t];
      if (items.length === 0) continue; // most modules have no Platinum item yet — skip, don't dead-end the ladder on it
      const done = tierSolved(items);
      const frqs = items.filter(isFRQ);
      const mcs = items.filter((q): q is QuizQ => !isFRQ(q));
      const tierEl = h('div', { class: `challenge-tier ${TIER_CLASS[t]} ${unlocked ? '' : 'challenge-locked'} ${done ? 'challenge-done' : ''}` },
        h('h4', {},
          h('span', { class: 'challenge-badge' }, TIER_LABEL[t]),
          t === 4 ? ' — the payoff' : '',
          ' ',
          h('span', { class: 'muted' }, `(${items.length} question${items.length === 1 ? '' : 's'})`),
        ),
        unlocked
          ? h('div', {}, ...frqs.map(frqItem), mcs.length ? quiz(mcs) : '')
          : h('p', { class: 'muted' }, `Solve every ${prevLabel} question above to unlock.`),
      );
      body.append(tierEl);
      unlocked = unlocked && done;
      prevLabel = TIER_LABEL[t];
    }
  }

  render();
  onProgressChange(render);

  return card('Challenge ladder',
    h('p', { class: 'section-lede', style: 'margin-bottom:14px' },
      'Bronze → Silver → Gold → Platinum, clearing each tier to unlock the next. The Platinum problem is a full olympiad-style challenge.'),
    body,
  );
}
