// Menu page — the full course directory, grouped by category, with search and
// filters (ROADMAP F.5).
// Reuses the homepage's card/grid visual language for consistency.
//
// Filter state lives in the QUERY STRING, both directions, exactly as the
// question bank's filters do (D.8): a filtered directory is a view worth
// sharing ("here's the CCC material you haven't started"), and a link that
// silently drops the filters sends the reader somewhere else. Defaults are
// omitted rather than written out, so a shared URL carries the filters someone
// chose and not the ones they didn't.
import { h } from './tabs/framework';
import { TOPICS, renderTopicCard, moduleProgress, type TopicMeta } from './topics';
import { TILE_HTML } from './home';
import { onProgressChange, solvedCount } from './progress';
import { activeMode, inScope, onModeChange, setMode, dismissAutoMode, isAutoMode, MODE_SHORT, type Mode } from './mode';
import { GUIDES } from './guides';
import { COMP_PLAIN, type Comp } from './content/topicIds';

const LEVELS = ['CCC', 'USNCO', 'CCO', 'IChO'] as const;
type Level = (typeof LEVELS)[number];

type Status = 'any' | 'todo' | 'doing' | 'done';
const STATUS_LABEL: Record<Status, string> = {
  any: 'Any progress',
  todo: 'Not started',
  doing: 'In progress',
  done: 'Complete',
};

/**
 * A module's state, from the same two tables the topic cards count with — no
 * corpus import, because this page is on the entry path.
 *
 * Modules with no quiz bank (the sandbox, the question bank) are always
 * 'none': they cannot be completed, so they must never be hidden by a progress
 * filter that has nothing to say about them.
 */
function statusOf(t: TopicMeta): Exclude<Status, 'any'> | 'none' {
  const p = moduleProgress(t.id);
  if (!p) return 'none';
  return p.done === 0 ? 'todo' : p.done >= p.total ? 'done' : 'doing';
}

export function buildMenuPage(
  onOpen: (id: string) => void, onHome: () => void, onGuide: (slug: string) => void,
): HTMLElement {
  const groupsOrder: string[] = [];
  const groups = new Map<string, typeof TOPICS>();
  for (const t of TOPICS) {
    if (!groups.has(t.group)) { groups.set(t.group, []); groupsOrder.push(t.group); }
    groups.get(t.group)!.push(t);
  }

  // The Level row IS the mode picker, so it opens on whatever mode is active
  // when that mode was chosen FOR the reader — otherwise the note below would
  // say "showing high-school level" over a directory showing everything.
  // A URL that carries ?level= still wins, in readUrl().
  let level: Level | 'any' = isAutoMode() ? 'CCC' : 'any';
  let status: Status = 'any';
  let group = 'any';
  // Off-syllabus modules are SHOWN by default even in a competition mode —
  // marked, not hidden (see scopeMark in topics.ts). This chip is how a student
  // asks for them to go away, which is a different thing from the site deciding
  // it for them.
  let onlyInScope = false;

  // aria-label as well as the placeholder — the placeholder is not an
  // accessible name (it vanishes on the first keystroke), and this is the only
  // field on the page, so there is nothing else for AT to infer one from.
  // The site search dialog (src/search.ts) already does this; it was the one
  // input that didn't.
  const searchIn = h('input', {
    type: 'search', placeholder: 'Search topics…', class: 'menu-search',
    'aria-label': 'Search topics',
  });
  const body = h('div', {});
  const countNote = h('p', { class: 'menu-count' });

  // ---- URL <-> filter state ----
  function readUrl(): void {
    const p = new URLSearchParams(location.search);
    const lv = p.get('level');
    if (lv && (LEVELS as readonly string[]).includes(lv)) level = lv as Level;
    const st = p.get('status');
    if (st && st in STATUS_LABEL) status = st as Status;
    const g = p.get('group');
    if (g && groupsOrder.includes(g)) group = g;
    if (p.get('syllabus') === '1') onlyInScope = true;
    const q = p.get('q');
    if (q) searchIn.value = q;
  }
  function writeUrl(): void {
    // Only touch the URL while the menu is the page being shown. buildMenuPage
    // runs at startup on every route, and a render triggered by a progress sync
    // must not rewrite the address of a topic page the reader is on.
    if (location.pathname.replace(/\/+$/, '') !== '/menu') return;
    const p = new URLSearchParams();
    if (level !== 'any') p.set('level', level);
    if (status !== 'any') p.set('status', status);
    if (group !== 'any') p.set('group', group);
    if (onlyInScope) p.set('syllabus', '1');
    if (searchIn.value.trim()) p.set('q', searchIn.value.trim());
    const qs = p.toString();
    history.replaceState({}, '', location.pathname + (qs ? '?' + qs : ''));
  }

  // ---- the filter row ----
  //
  // `.pill` is the site's existing filter chip; `active` paints it and
  // aria-pressed states it. Both, always together — the paint alone is
  // invisible to a screen reader, and the attribute alone is invisible to
  // everyone else.
  //
  // Every row is built TWICE — as pills and as one native <select> over the same
  // options, wired to the same setter — and a media query shows exactly one of
  // them. Below 700px the four rows were 17 pills stacked ahead of the first
  // topic card; a <select> is one line, and the platform already draws the
  // picker, the keyboard handling and the touch target for it.
  const chipRows: HTMLElement[] = [];
  function chipRow<T extends string>(
    label: string, options: readonly { value: T; label: string; plain?: string }[],
    get: () => T, set: (v: T) => void,
  ): HTMLElement {
    const apply = (v: T): void => { set(v); syncChips(); render(); };
    const btns = options.map(o => {
      // `plain` is the acronym said in words (COMP_PLAIN). On the pill it is a
      // tooltip; in the select it has to be part of the option text, because a
      // native option has nowhere else to put it.
      const b = h('button', { type: 'button', class: 'pill', ...(o.plain ? { title: o.plain } : {}) }, o.label);
      b.addEventListener('click', () => apply(o.value));
      b.dataset.value = o.value;
      return b;
    });
    // aria-label rather than a wrapping <label>: the row's own caption is the
    // visible name on desktop, and it is hidden when the select is showing.
    const sel = h('select', { class: 'menu-filter-select', 'aria-label': label },
      ...options.map(o => h('option', { value: o.value }, o.plain ? `${o.label} — ${o.plain}` : o.label)));
    sel.addEventListener('change', () => apply(sel.value as T));
    const row = h('div', { class: 'menu-filter-row' },
      h('span', { class: 'menu-filter-label' }, label),
      h('div', { class: 'menu-filter-pills' }, ...btns),
      sel);
    (row as HTMLElement & { sync?: () => void }).sync = () => {
      for (const b of btns) {
        const on = b.dataset.value === get();
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      }
      sel.value = get();
    };
    chipRows.push(row);
    return row;
  }
  function syncChips(): void {
    for (const r of chipRows) (r as HTMLElement & { sync?: () => void }).sync?.();
  }

  // The Level filter is also the site's mode picker now (the sidebar's five
  // buttons are gone, plan3 §1.3): everything that reads `activeMode()` — the
  // syllabus chip below, the scope marks on the cards, the next-lesson
  // recommendation — follows the level you are browsing at.
  const levelRow = chipRow<Level | 'any'>('Level',
    [{ value: 'any', label: 'All levels' },
     ...LEVELS.map(l => ({ value: l, label: l, plain: COMP_PLAIN[l.toLowerCase() as Comp] }))],
    () => level, v => { level = v; setMode(v === 'any' ? 'all' : v.toLowerCase() as Mode); });
  // The pills are four acronyms. This says the chosen one in words, once,
  // under the row — a tooltip is not readable on a phone and not discoverable
  // anywhere. Empty (and gone) at "All levels", where there is nothing to gloss.
  const levelNote = h('p', { class: 'muted', style: 'margin:0' });
  const statusRow = chipRow<Status>('Progress',
    (Object.keys(STATUS_LABEL) as Status[]).map(s => ({ value: s, label: STATUS_LABEL[s] })),
    () => status, v => { status = v; });
  const groupRow = chipRow<string>('Area',
    [{ value: 'any', label: 'All areas' }, ...groupsOrder.map(g => ({ value: g, label: g }))],
    () => group, v => { group = v; });
  // Only meaningful in a competition mode — in "All competitions" every module
  // is in scope, so the chip would be a control that does nothing.
  const scopeRow = chipRow<'all' | 'scope'>('Syllabus',
    [{ value: 'all', label: 'Everything' }, { value: 'scope', label: 'On syllabus only' }],
    () => (onlyInScope ? 'scope' : 'all'), v => { onlyInScope = v === 'scope'; });

  // One line, above the filters, and ONLY while the CCC default is one the
  // reader never chose (mode.ts's isAutoMode). Anything they do — pressing
  // either button here, or touching the Level row — retires it for good.
  const autoNote = h('p', { class: 'menu-guides' }, 'Showing high-school level. ');
  autoNote.append(
    h('button', {
      type: 'button', class: 'link-btn',
      onclick: () => { level = 'any'; setMode('all'); syncChips(); render(); },
    }, 'Show everything'),
    ' · ',
    h('button', {
      type: 'button', class: 'link-btn',
      onclick: () => { dismissAutoMode(); render(); },
    }, 'Dismiss'),
  );

  const clearBtn = h('button', { type: 'button', class: 'btn menu-clear' }, 'Clear filters');
  clearBtn.addEventListener('click', () => {
    level = 'any'; status = 'any'; group = 'any'; onlyInScope = false; searchIn.value = '';
    syncChips(); render();
  });

  function matches(t: TopicMeta): boolean {
    const f = searchIn.value.trim().toLowerCase();
    if (f && !(t.title.toLowerCase().includes(f) || t.blurb.toLowerCase().includes(f) || t.tag.toLowerCase().includes(f))) return false;
    if (level !== 'any' && !t.difficulty.includes(level)) return false;
    if (onlyInScope && !inScope(t.difficulty, activeMode())) return false;
    if (group !== 'any' && t.group !== group) return false;
    if (status !== 'any') {
      const s = statusOf(t);
      // A module with no quiz bank has no progress to filter on, so a progress
      // filter simply doesn't apply to it rather than excluding it silently.
      if (s !== 'none' && s !== status) return false;
      if (s === 'none') return false;
    }
    return true;
  }

  function render(): void {
    writeUrl();
    body.replaceChildren();
    let shownTotal = 0;
    for (const g of groupsOrder) {
      const shown = groups.get(g)!.filter(matches);
      if (!shown.length) continue;
      shownTotal += shown.length;
      body.append(
        h('div', { class: 'sect-head', style: 'margin-top:34px' }, h('h2', {}, g)),
        h('div', { class: 'topic-grid' },
          ...shown.map(t => renderTopicCard(t, onOpen, '', '', true)),
        ),
      );
    }
    autoNote.hidden = !isAutoMode();
    levelNote.textContent = level === 'any' ? '' : COMP_PLAIN[level.toLowerCase() as Comp];
    levelNote.hidden = level === 'any';
    // The syllabus chip only exists in a competition mode; in "All" it would be
    // a control with nothing to filter.
    scopeRow.hidden = activeMode() === 'all';
    const scopeLabel = `${MODE_SHORT[activeMode()]} only`;
    (scopeRow.querySelectorAll('.pill')[1] as HTMLElement).textContent = scopeLabel;
    (scopeRow.querySelectorAll('option')[1] as HTMLElement).textContent = scopeLabel;
    // A progress filter is noise for someone with no progress: nothing it can
    // be set to would change the list. It comes back with the first solved
    // question — and stays if a shared URL arrived with it already set, or the
    // reader would be looking at a filtered directory with no visible cause.
    statusRow.hidden = solvedCount() === 0 && status === 'any';
    const filtered = level !== 'any' || status !== 'any' || group !== 'any' || onlyInScope || !!searchIn.value.trim();
    countNote.textContent = filtered
      ? `${shownTotal} of ${TOPICS.length} modules match`
      : `${TOPICS.length} modules`;
    clearBtn.hidden = !filtered;
    if (!shownTotal) {
      body.append(h('p', { class: 'muted' },
        'No modules match these filters. ',
        h('button', { type: 'button', class: 'btn', onclick: () => clearBtn.click() }, 'Clear filters')));
    }
  }

  searchIn.addEventListener('input', render);
  readUrl();
  syncChips();
  render();
  // The progress filters and the cards' own bars both read the progress store,
  // which finishes loading (and can sync from the cloud) after this is built.
  onProgressChange(render);
  // A mode switch changes both the syllabus chip and the "Beyond CCC" marks the
  // cards carry, so the directory repaints with it.
  onModeChange(() => { syncChips(); render(); });

  return h('div', { id: 'menu-page' },
    h('main', { class: 'home-wrap' },
      h('div', { class: 'home-top' },
        h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b><small>Chemistry, running</small>` }),
        h('button', { class: 'btn-ghost', onclick: onHome }, '← Home'),
      ),
      h('section', { style: 'padding:44px 0 10px' },
        h('h1', { style: 'font-family:var(--serif);font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:700;margin-bottom:var(--s-4)' }, 'All Topics'),
        h('p', { class: 'section-lede' }, `Every module on the site — ${TOPICS.length} of them, starting from the basics and going as far as the hardest contest material.`),
        // I.3: the contest guides are entry points from search, but they are
        // also the best answer to "where do I start" — so the directory names
        // them rather than leaving them reachable only from Google.
        h('p', { class: 'menu-guides' }, 'Preparing for one contest? ',
          ...GUIDES.flatMap((g, i) => [
            i ? ' · ' : '',
            h('button', { type: 'button', class: 'link-btn', onclick: () => onGuide(g.slug) },
              `${MODE_SHORT[g.comp]} study guide`),
          ])),
        searchIn,
        h('div', { class: 'menu-filters' }, autoNote, levelRow, levelNote, statusRow, groupRow, scopeRow),
        h('div', { class: 'menu-count-row' }, countNote, clearBtn),
      ),
      body,
      h('div', { style: 'height:60px' }),
    ),
  );
}
