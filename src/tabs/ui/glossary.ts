// Glossary annotation (plan3 §2.4): underline the first occurrence of each
// defined term in a block of prose and show its one-sentence definition.
//
// Loaded LAZILY (framework.ts does the dynamic import) so GLOSSARY's ~14 kB of
// text never reaches the entry chunk — home.ts and menu.ts import `h` from
// framework, and a static import here would ride along into the bundle a
// first-time reader downloads to look at a grid of topic cards.
import { GLOSSARY } from '../../content/glossary';

/**
 * Where a term is NOT a term: equations, code, drawings, controls, links,
 * headings, and the readouts/ladders whose text is generated rather than
 * written. Underlining a word inside `.eq` would put a dotted rule through a
 * formula, and inside a <button> it would sit under a control the student is
 * meant to press.
 */
const SKIP = '.eq, code, pre, canvas, svg, button, a, h1, h2, h3, h4, summary, .result, .mission-ladder, .quiz-opt';

// One popover for the whole document, not one per term. It lives on <body>
// (position: absolute, page coordinates) so no scrolling or overflow:hidden
// ancestor of the term can clip it.
const POP_ID = 'glossary-pop';
let pop: HTMLElement | null = null;
let anchor: HTMLElement | null = null;
let matcher: RegExp | null = null;

// Straight and curly apostrophes both appear in the corpus, so a key's ' has to
// match either. Everything else is escaped literally.
function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['\u2019]");
}

function regex(): RegExp {
  // Longest first: at the position of "equilibrium constant" the alternation
  // must not settle for "equilibrium".
  matcher ??= new RegExp(
    '\\b(?:' + Object.keys(GLOSSARY).sort((a, b) => b.length - a.length).map(esc).join('|') + ')(?:e?s)?\\b',
    'gi',
  );
  return matcher;
}

/**
 * The GLOSSARY key a matched run of text belongs to, undoing the plural the
 * regex allowed: "moles" -> mole, "atomic masses" -> atomic mass. Irregular
 * plurals no rule reaches (nuclei, half-lives) are their own keys instead.
 */
function keyOf(match: string): string | undefined {
  const k = match.toLowerCase().replace(/\u2019/g, "'");
  for (const c of [k, k.replace(/s$/, ''), k.replace(/es$/, '')]) if (c in GLOSSARY) return c;
  return undefined;
}

function popover(): HTMLElement {
  if (!pop) {
    pop = document.createElement('div');
    pop.id = POP_ID;
    pop.className = 'term-pop';
    pop.setAttribute('role', 'tooltip');
    pop.hidden = true;
    document.body.append(pop);
  }
  return pop;
}

function show(d: HTMLElement): void {
  const def = d.dataset.def;
  if (!def) return;
  const p = popover();
  p.textContent = def;
  p.hidden = false;
  anchor?.removeAttribute('aria-describedby');
  anchor = d;
  d.setAttribute('aria-describedby', POP_ID);
  const r = d.getBoundingClientRect();
  const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - p.offsetWidth - 8));
  // Flip above when the term is near the bottom of the window.
  const under = window.innerHeight - r.bottom > p.offsetHeight + 12;
  p.style.left = `${left + window.scrollX}px`;
  p.style.top = `${(under ? r.bottom + 6 : r.top - p.offsetHeight - 6) + window.scrollY}px`;
}

function hide(): void {
  if (!pop || pop.hidden) return;
  pop.hidden = true;
  anchor?.removeAttribute('aria-describedby');
  anchor = null;
}

let wired = false;
function wire(): void {
  if (wired) return;
  wired = true;
  const at = (e: Event): HTMLElement | null =>
    (e.target as Element | null)?.closest?.('dfn.term') as HTMLElement | null ?? null;
  // Delegated once on the document: annotateTerms runs on every theory block
  // and every graded answer, and per-element listeners would be thousands.
  document.addEventListener('pointerover', e => { const d = at(e); if (d) show(d); });
  document.addEventListener('pointerout', e => { if (at(e)) hide(); });
  document.addEventListener('focusin', e => { const d = at(e); if (d) show(d); else hide(); });
  document.addEventListener('focusout', e => { if (at(e)) hide(); });
  document.addEventListener('click', e => { if (!at(e)) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  // Page coordinates go stale the moment anything scrolls, including an
  // overflow container between the term and the body — hence capture.
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
}

/**
 * Wrap the first occurrence of each glossary term under `root` in
 * `<dfn class="term" tabindex="0">`, hover/focus/tap showing its definition.
 *
 * Called from `theory()` and from the quiz's `why` renderer, and nowhere else:
 * first contact with a word is what needs a definition, and a page that
 * underlines the same term in six places is noise.
 */
export function annotateTerms(root: HTMLElement): void {
  const re = regex();
  const seen = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const el = n.parentElement;
      if (!el || !n.nodeValue || !/[a-z]/i.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      const skip = el.closest(SKIP);
      // `closest` can walk out past `root`; only a match INSIDE the annotated
      // block is one of ours.
      return skip && root.contains(skip) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  // Collect first, replace after: swapping a text node out from under a live
  // TreeWalker is how you get a half-walked tree.
  const texts: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) texts.push(n as Text);

  for (const t of texts) {
    const text = t.data;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      const key = keyOf(m[0]);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      frag.append(text.slice(last, m.index));
      const d = document.createElement('dfn');
      d.className = 'term';
      d.tabIndex = 0;
      d.textContent = m[0];
      d.dataset.def = GLOSSARY[key];
      frag.append(d);
      last = m.index + m[0].length;
    }
    if (!last) continue;
    frag.append(text.slice(last));
    t.replaceWith(frag);
  }
  if (seen.size) wire();
}
