// Menu page — the full course directory, grouped by category with search.
// Reuses the homepage's card/grid visual language for consistency.
import { h } from './tabs/framework';
import { TOPICS } from './topics';
import { TILE_HTML } from './home';

export function buildMenuPage(onOpen: (id: string) => void, onHome: () => void): HTMLElement {
  const groupsOrder: string[] = [];
  const groups = new Map<string, typeof TOPICS>();
  for (const t of TOPICS) {
    if (!groups.has(t.group)) { groups.set(t.group, []); groupsOrder.push(t.group); }
    groups.get(t.group)!.push(t);
  }

  const searchIn = h('input', { type: 'text', placeholder: 'Search topics…', class: 'menu-search' });
  const body = h('div', {});

  function render(): void {
    const f = searchIn.value.trim().toLowerCase();
    body.replaceChildren();
    let any = false;
    for (const group of groupsOrder) {
      const shown = groups.get(group)!.filter(t =>
        !f || t.title.toLowerCase().includes(f) || t.blurb.toLowerCase().includes(f) || t.tag.toLowerCase().includes(f));
      if (!shown.length) continue;
      any = true;
      body.append(
        h('div', { class: 'sect-head', style: 'margin-top:34px' }, h('h2', {}, group)),
        h('div', { class: 'topic-grid' },
          ...shown.map(t => h('article', { class: `topic-card${t.wide ? ' span2' : ''}`, onclick: () => onOpen(t.id) },
            h('div', { class: 'topic-tag' }, t.tag),
            h('h3', {}, t.title),
            h('p', {}, t.blurb),
            h('span', { class: 'topic-open' }, 'Open module →'),
          )),
        ),
      );
    }
    if (!any) body.append(h('p', { class: 'muted' }, 'No topics match your search.'));
  }
  searchIn.addEventListener('input', render);
  render();

  return h('div', { id: 'menu-page' },
    h('div', { class: 'home-wrap' },
      h('div', { class: 'home-top' },
        h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b><small>CCC Trainer</small>` }),
        h('button', { class: 'btn-ghost', onclick: onHome }, '← Home'),
      ),
      h('section', { style: 'padding:44px 0 10px' },
        h('h1', { style: 'font-family:var(--serif);font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:700;margin-bottom:10px' }, 'All Topics'),
        h('p', { class: 'section-lede' }, `Browse the full syllabus — ${TOPICS.length} modules from foundations through the advanced CCO problem sets.`),
        searchIn,
      ),
      body,
      h('div', { style: 'height:60px' }),
    ),
  );
}
