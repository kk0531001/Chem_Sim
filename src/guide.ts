// The competition landing pages (ROADMAP I.3) — /guide/ccc-study-guide and
// /guide/usnco-study-guide.
//
// Assembled from what already exists: the prose in guides.ts, the in-scope
// modules from TOPICS, the corpus totals from counts.ts. No new content type,
// no second copy of any lesson — the whole argument for these pages is that
// the material is already here and nothing links to it by the name people
// search for.
//
// Visual language is the menu page's, deliberately: same wrap, same card grid,
// same heading scale. A landing page that looks like a different product is a
// landing page that reads as an ad.
import { h } from './tabs/framework';
import { TOPICS, renderTopicCard } from './topics';
import { TILE_HTML } from './home';
import { CORPUS_COUNTS } from './content/counts';
import { setMode, inScope, MODE_SHORT } from './mode';
import type { Guide } from './guides';

export function buildGuidePage(
  guide: Guide,
  onOpen: (id: string) => void,
  onHome: () => void,
  onMenu: () => void,
): HTMLElement {
  // Modules a student preparing for THIS contest should work through. The
  // sandbox and the question bank are listed separately below — neither is a
  // lesson, and putting them in a "start here, in this order" list would be
  // telling someone to begin their CCC preparation by playing with a particle
  // box.
  const modules = TOPICS.filter(t => inScope(t.difficulty, guide.comp) && t.id !== 'sandbox' && t.id !== 'qbank');

  const enter = h('button', {
    type: 'button', class: 'btn primary guide-cta',
    onclick: () => { setMode(guide.comp); onMenu(); },
  }, `Start in ${MODE_SHORT[guide.comp]} mode →`);

  const stat = (n: string, label: string) =>
    h('div', { class: 'guide-stat' }, h('b', {}, n), h('span', {}, label));

  return h('div', { class: 'guide-page' },
    h('div', { class: 'home-wrap' },
      h('div', { class: 'home-top' },
        h('div', { class: 'wordmark', html: `${TILE_HTML}<b>ChemPrep</b><small>${MODE_SHORT[guide.comp]} Trainer</small>` }),
        h('button', { class: 'btn-ghost', onclick: onHome }, '← Home'),
      ),

      h('section', { class: 'guide-head' },
        h('h1', {}, guide.title),
        h('p', { class: 'section-lede', html: guide.lede }),
        h('div', { class: 'guide-stats' },
          stat(String(modules.length), 'modules in scope'),
          stat(String(CORPUS_COUNTS.mc + CORPUS_COUNTS.frq), 'practice questions'),
          stat(String(CORPUS_COUNTS.papers), 'full mock papers'),
        ),
        enter,
        h('p', { class: 'guide-free' }, 'Free, no account needed. Signing in only syncs your progress between devices.'),
      ),

      h('section', { class: 'guide-sect' },
        h('h2', {}, `What the ${MODE_SHORT[guide.comp]} is`),
        h('p', { html: guide.about }),
        h('p', {},
          // The one outward link per page, and it is the authority — this site
          // deliberately states no dates, scoring or eligibility rules of its own.
          h('a', { href: guide.official.href, class: 'guide-link', target: '_blank', rel: 'noopener' },
            guide.official.label, ' ↗'),
        ),
        h('p', { class: 'guide-caveat' },
          `Format, dates and eligibility are the organiser's to publish and change — check the official page for the current year. `,
          `Everything on this site is original practice written to match the style and difficulty; no real ${MODE_SHORT[guide.comp]} question is reproduced here.`),
      ),

      h('section', { class: 'guide-sect' },
        h('h2', {}, `How to prepare with this site`),
        h('ol', { class: 'guide-plan' },
          ...guide.plan.map(s => h('li', {}, h('b', {}, s.heading), h('p', {}, s.body))),
        ),
      ),

      h('section', { class: 'guide-sect' },
        h('h2', {}, `The ${modules.length} modules in scope`),
        h('p', { class: 'section-lede' },
          'In syllabus order — each one is a lesson, a simulation with missions, and a 25-question quiz.'),
        // Compact, like the homepage catalogue: this list supports the guide's
        // own hero ("Start in <comp> mode") rather than competing with it.
        h('div', { class: 'topic-grid' }, ...modules.map(t => renderTopicCard(t, onOpen, ' compact', '', true))),
        h('p', { class: 'guide-more' },
          h('button', { type: 'button', class: 'btn', onclick: onMenu }, 'Browse all topics'),
          ' — including the material beyond ', MODE_SHORT[guide.comp], ', if you are aiming past it.'),
      ),
    ),
  );
}
