// Site search (ROADMAP F.1) — modules and questions, keyboard first.
//
// THE DESIGN CONSTRAINT IS THE CORPUS. There are 25 modules and 972 questions;
// the modules are already in the entry chunk, the questions are a 563 kB
// on-demand one (D.10). A search box that indexed everything at startup would
// undo the whole performance phase for a feature most visits never use. So:
// module hits answer instantly, and opening the overlay kicks off the corpus
// import — question hits fill in a moment later, in the same list.
//
// No search dependency. At this size a scored substring match is genuinely
// enough, and the ranking below (prefix > word-start > mid-word) is what makes
// it feel like search rather than a filter.
//
// The overlay is a native <dialog> opened with showModal(): focus trapping,
// Escape-to-close, the top layer and a ::backdrop are all things it would
// otherwise be this file's job to reimplement, and get subtly wrong.
import { h } from './tabs/framework';
import { TOPICS, topicById } from './topics';
import { isModuleId, toExamTopic } from './content/topicIds';
import { navigate } from './router';

interface Hit {
  kind: 'module' | 'question';
  id: string;
  /** What the row shows. */
  title: string;
  /** The small grey line under it — a module's blurb, a question's home. */
  context: string;
  score: number;
}

const MAX_MODULES = 5;
const MAX_QUESTIONS = 12;

/**
 * Where a match sits in the text decides how good a match it is.
 *
 * A query that starts the title is almost certainly what you meant; one that
 * starts a word inside it is probably right; one that lands mid-word ("ester"
 * inside "polyester") usually isn't. Without this the list is alphabetical
 * noise and every search needs reading.
 */
function score(text: string, q: string): number {
  const t = text.toLowerCase();
  const at = t.indexOf(q);
  if (at < 0) return 0;
  if (at === 0) return 100;
  return /[\s(\-—·,/]/.test(t[at - 1]) ? 60 : 22;
}

/**
 * Question prompts are authoring source, not display text: they carry KaTeX
 * delimiters, mhchem and inline HTML. Strip enough that a result row reads as a
 * sentence — the destination page renders it properly.
 */
function plain(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/\\ce\{([^}]*)\}/g, '$1')
    .replace(/\\[()[\]]|\$\$?/g, '')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

type CorpusIndex = { id: string; text: string; home: string; homeLabel: string }[];

export function initSearch(): { open: () => void } {
  const input = h('input', {
    type: 'search', class: 'search-input', placeholder: 'Search modules and questions…',
    autocomplete: 'off', spellcheck: 'false',
    role: 'combobox', 'aria-expanded': 'false', 'aria-controls': 'search-results',
    'aria-autocomplete': 'list', 'aria-label': 'Search modules and questions',
  });
  const list = h('div', { id: 'search-results', class: 'search-results', role: 'listbox', 'aria-label': 'Search results' });
  const status = h('p', { class: 'search-status', role: 'status' });
  const dialog = h('dialog', { class: 'search-dialog', 'aria-label': 'Search' },
    h('div', { class: 'search-box' },
      input,
      h('button', { type: 'button', class: 'search-close', 'aria-label': 'Close search', onclick: () => dialog.close() }, 'Esc'),
    ),
    list, status,
  ) as HTMLDialogElement;
  document.body.appendChild(dialog);

  let corpus: CorpusIndex | null = null;
  let loading = false;
  let hits: Hit[] = [];
  let active = 0;

  /**
   * Build the question index once, off the registry.
   *
   * A question's HOME is where opening it should go: module questions live on
   * their module page, and everything else (the exam banks, the mock papers) is
   * reachable through the question bank's results view, which renders a whole
   * topic slice through the same `quiz()` that honours `?q=`.
   */
  async function loadCorpus(): Promise<void> {
    if (corpus || loading) return;
    loading = true;
    status.textContent = 'Loading questions…';
    try {
      const reg = await import('./content/registry');
      corpus = [...reg.ALL_MC, ...reg.ALL_FRQ].map(q => {
        const isModule = !!q.topic && isModuleId(q.topic);
        const meta = isModule ? topicById(q.topic!) : undefined;
        const examTopic = toExamTopic(q.topic);
        return {
          id: q.id,
          text: plain('parts' in q ? q.title : q.q),
          home: meta
            ? `/topic/${meta.slug}?q=${encodeURIComponent(q.id)}`
            : `/topic/exam-question-bank?part=results${examTopic ? `&topic=${examTopic}` : ''}&q=${encodeURIComponent(q.id)}`,
          homeLabel: meta ? meta.title : 'Question bank',
        };
      });
    } catch (err) {
      // A failed chunk must leave module search working, not blank the overlay.
      console.warn('[search] question index unavailable:', err);
      status.textContent = 'Questions could not be loaded — searching modules only.';
      loading = false;
      return;
    }
    loading = false;
    render();
  }

  function search(raw: string): Hit[] {
    const q = raw.trim().toLowerCase();
    if (q.length < 2) return [];

    const modules: Hit[] = [];
    for (const t of TOPICS) {
      const s = Math.max(score(t.title, q), score(t.tag, q) - 15, score(t.blurb, q) - 30);
      if (s > 0) modules.push({ kind: 'module', id: t.id, title: t.title, context: t.group, score: s });
    }
    modules.sort((a, b) => b.score - a.score);

    const questions: Hit[] = [];
    for (const c of corpus ?? []) {
      const s = score(c.text, q);
      if (s > 0) questions.push({ kind: 'question', id: c.id, title: c.text, context: c.homeLabel, score: s });
    }
    // Shorter matching text ranks higher at equal score: a 12-word question
    // that contains the query is more likely to be about it than a 60-word one.
    questions.sort((a, b) => b.score - a.score || a.title.length - b.title.length);

    return [...modules.slice(0, MAX_MODULES), ...questions.slice(0, MAX_QUESTIONS)];
  }

  function go(hit: Hit): void {
    dialog.close();
    if (hit.kind === 'module') { navigate({ kind: 'topic', id: hit.id }); return; }
    const entry = corpus?.find(c => c.id === hit.id);
    if (!entry) return;
    const [path, qs] = entry.home.split('?');
    // navigate() takes the search separately so the destination tab can read it
    // when it mounts — see the note on the router.
    const slug = path.replace('/topic/', '');
    const topic = TOPICS.find(t => t.slug === slug);
    if (topic) navigate({ kind: 'topic', id: topic.id }, false, '?' + qs);
  }

  function render(): void {
    hits = search(input.value);
    active = 0;
    input.setAttribute('aria-expanded', String(hits.length > 0));
    list.replaceChildren(...hits.map((hit, i) => {
      const row = h('div', {
        class: 'search-hit', role: 'option', id: `search-hit-${i}`,
        'aria-selected': String(i === active),
      },
        h('span', { class: `search-kind kind-${hit.kind}` }, hit.kind === 'module' ? 'Module' : 'Question'),
        h('span', { class: 'search-hit-body' },
          h('span', { class: 'search-hit-title' }, hit.title),
          h('span', { class: 'search-hit-context' }, hit.context),
        ),
      );
      // mousedown, not click: the input keeps focus and the dialog closes
      // before a click would land somewhere else.
      row.addEventListener('mousedown', e => { e.preventDefault(); go(hit); });
      return row;
    }));
    syncActive();

    const q = input.value.trim();
    status.textContent =
      q.length < 2 ? 'Type at least two characters.'
        : hits.length === 0 ? (corpus ? 'Nothing matches.' : 'No modules match — still loading questions…')
          : corpus ? `${hits.length} result${hits.length === 1 ? '' : 's'}`
            : `${hits.length} so far — still loading questions…`;
  }

  function syncActive(): void {
    const rows = Array.from(list.children) as HTMLElement[];
    rows.forEach((r, i) => {
      const on = i === active;
      r.classList.toggle('active', on);
      r.setAttribute('aria-selected', String(on));
    });
    // The input keeps focus throughout; this is what tells a screen reader
    // which option the arrow keys have landed on.
    if (rows[active]) {
      input.setAttribute('aria-activedescendant', rows[active].id);
      rows[active].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!hits.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length;
      syncActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hits[active]) go(hits[active]);
    }
  });

  /**
   * Where focus goes when the overlay closes.
   *
   * <dialog> restores focus itself only when there was a focusable element to
   * restore TO. Opened by the `/` shortcut there usually isn't — focus is on
   * <body> — so focus stayed on the now-hidden input: `/` silently stopped
   * working (the shortcut ignores keys typed in a field, and it believed the
   * user was in one), and a keyboard user was left inside a closed dialog.
   */
  let returnFocus: HTMLElement | null = null;

  function open(): void {
    if (dialog.open) return;
    const prev = document.activeElement;
    returnFocus = prev instanceof HTMLElement && prev !== document.body && !dialog.contains(prev) ? prev : null;
    input.value = '';
    render();
    dialog.showModal();
    input.focus();
    void loadCorpus();
  }

  dialog.addEventListener('close', () => {
    input.blur();
    returnFocus?.focus();
    returnFocus = null;
  });

  // `/` is the convention (GitHub, GitLab, MDN) and ⌘K/Ctrl-K is the other one;
  // both, because people reach for whichever they learned first. `/` is ignored
  // while typing — otherwise it is unusable inside every field on the site.
  document.addEventListener('keydown', e => {
    const el = document.activeElement as HTMLElement | null;
    const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      || el.tagName === 'SELECT' || el.isContentEditable);
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); open(); }
    else if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
  });

  // Clicking the backdrop closes. The dialog element itself fills the top layer,
  // so a click lands on it directly only when it missed the panel inside.
  dialog.addEventListener('mousedown', e => { if (e.target === dialog) dialog.close(); });

  return { open };
}
