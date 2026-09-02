// ROADMAP I.1 — make the site crawlable. Runs after `vite build`.
//
// #app starts `hidden` and every page is built by JS, so a crawler or a no-JS
// visitor sees an empty document, and every URL on the site shares one <title>
// and one og:image. This fixes both without a framework change: copy
// dist/index.html to dist/topic/<slug>/index.html with that topic's metadata
// swapped into the head and a <noscript> summary in the body. Netlify serves a
// real file in preference to the /* SPA rewrite in public/_redirects, so these
// are what a scraper gets — and the app boots on top of them exactly as before,
// because the router reads location.pathname either way.
//
// Deliberately NOT SSR: nothing here renders the app. src/topics.ts already
// holds the title, blurb, intro, group and difficulty the menu cards are built
// from, and that is all a search result or a link unfurl can show anyway.
//
// This is a separate step rather than a Vite plugin for one boring reason:
// importing src/topics.ts into vite.config.ts drags KaTeX's stylesheet into
// Node, which cannot load it. See scripts/load-topics.mjs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPICS, GUIDES, guideNoscript, compsForDifficulty } from './load-topics.mjs';
import { SITE_URL } from './site-url.mjs';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

// The site's own title and description. Kept identical to index.html and to the
// homepage lede in src/home.ts — a shared link and the page it opens must say
// the same thing. If you edit one, edit all three.
const BASE_TITLE = 'ChemPrep — Chemistry, from the basics to olympiad';
const BASE_DESCRIPTION = '25 interactive chemistry modules, from atoms and moles to enzyme kinetics, with 893 worked exam-style questions and 5 full mock papers. Start at the basics with no chemistry behind you, and the same modules carry on to contest level.';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Blurbs are plain, but intros carry inline markup — meta content cannot. */
const plain = s => esc(s.replace(/<[^>]+>/g, ''));

/** Swap the value of one <meta property|name="…" content="…"> in the shell. */
const meta = (html, key, value) =>
  html.replace(new RegExp(`(<meta (?:property|name)="${key}" content=")[^"]*`), (_m, h) => h + value);

function head(html, { title, description, url }) {
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*/, (_m, h) => h + url);
  for (const k of ['og:title', 'twitter:title']) out = meta(out, k, esc(title));
  for (const k of ['description', 'og:description', 'twitter:description']) out = meta(out, k, description);
  return meta(out, 'og:url', url);
}

/**
 * Strip the KaTeX font preloads from a page that cannot show a formula.
 *
 * vite.config.ts preloads the two faces every formula uses, which was right
 * when KaTeX was part of the entry bundle. It is now imported on demand, so on
 * the homepage, the menu and the guides those two `as="font"` links fetch 43 kB
 * at high priority, competing with the entry script, for a renderer that page
 * will never load. Topic pages and the bank keep them: there the formula is the
 * content, and `font-display: block` means the maths is invisible until the
 * face arrives.
 */
const noMathFonts = html => html.replace(/^.*rel="preload".*as="font".*\n/gm, '');

/**
 * JSON-LD for one page (plan2 §12).
 *
 * Only claims the page can back up: what the thing is, what it is called, what
 * it is about, and that it is free. No ratings, no author credentials, no
 * course duration — structured data that overstates gets the whole block
 * ignored, and there is nothing here worth risking that for.
 *
 * `esc` is not enough inside a <script> block: a literal "</script>" in any
 * field would close it early. JSON.stringify handles quoting, and the one
 * remaining escape is the closing tag itself.
 */
const jsonLd = obj => `    <script type="application/ld+json">${
  JSON.stringify({ '@context': 'https://schema.org', ...obj }).replace(/<\//g, '<\\/')
}</script>\n`;

const withLd = (html, obj) => html.replace('</head>', jsonLd(obj) + '</head>');

/** The topic list every prerendered page carries, so no page is a dead end. */
function topicLinks() {
  return [...new Set(TOPICS.map(t => t.group))].map(g =>
    `<h2>${esc(g)}</h2>\n<ul>\n` + TOPICS.filter(t => t.group === g)
      .map(t => `<li><a href="/topic/${t.slug}">${esc(t.title)}</a> — ${plain(t.blurb)}</li>`)
      .join('\n') + '\n</ul>').join('\n');
}

/** Put the summary before #app: first thing in the document for a parser that
 *  never runs the script, invisible to every browser that does. */
const body = (html, content) =>
  html.replace('<div id="app" hidden>', `<noscript>\n${content}\n</noscript>\n    <div id="app" hidden>`);

const shell = await readFile(join(DIST, 'index.html'), 'utf8');
// The head rewrites are regex over markup, which is fine on a file this build
// produced and fatal to debug if index.html is ever restructured. Assert the
// anchors exist rather than silently shipping 25 pages with identical tags.
for (const anchor of ['<title>', '<link rel="canonical"', 'property="og:url"', '<div id="app" hidden>'])
  if (!shell.includes(anchor)) throw new Error(`prerender: index.html no longer contains ${anchor}`);

const links = topicLinks();
let written = 0;

async function page(dir, html) {
  await mkdir(join(DIST, dir), { recursive: true });
  await writeFile(join(DIST, dir, 'index.html'), html);
  written++;
}

await writeFile(join(DIST, 'index.html'), noMathFonts(withLd(body(shell,
  `<h1>${BASE_TITLE}</h1>
<p>${TOPICS.length} interactive modules, worked exam-style questions and full mock papers. Start at
the basics with no chemistry behind you; the same modules carry on to contest level. The simulations
need JavaScript; the topic list does not.</p>
${links}`), {
  '@type': 'WebSite',
  name: 'ChemPrep',
  url: `${SITE_URL}/`,
  description: BASE_DESCRIPTION,
  inLanguage: 'en-CA',
  isAccessibleForFree: true,
})));

for (const t of TOPICS) {
  const url = `${SITE_URL}/topic/${t.slug}`;
  await page(join('topic', t.slug), withLd(body(
    head(shell, { title: `${t.title} — ChemPrep`, description: plain(t.blurb), url }),
    `<h1>${esc(t.title)}</h1>
<p><b>${esc(t.group)}</b> · ${esc(t.difficulty.join(', '))} · about ${t.estMinutes} minutes</p>
<p>${t.intro}</p>
<p><a href="/menu">All topics</a></p>
${links}`), {
    '@type': 'LearningResource',
    name: t.title,
    url,
    description: plain(t.blurb),
    learningResourceType: 'Interactive lesson',
    educationalLevel: t.difficulty.join(', '),
    timeRequired: `PT${t.estMinutes}M`,
    inLanguage: 'en-CA',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', name: 'ChemPrep', url: `${SITE_URL}/` },
  }));
}

// I.3 competition landing pages. These are the pages people arrive on FROM
// SEARCH, so of everything here they are the ones that most need to exist as
// real HTML with their own title and description.
for (const g of GUIDES) {
  const modules = TOPICS.filter(t =>
    compsForDifficulty(t.difficulty).includes(g.comp) && t.id !== 'sandbox' && t.id !== 'qbank');
  await page(join('guide', g.slug), noMathFonts(body(
    head(shell, { title: `${g.title} — ChemPrep`, description: plain(g.description), url: `${SITE_URL}/guide/${g.slug}` }),
    guideNoscript(g, modules) + '\n' + links)));
}

await page('menu', noMathFonts(body(
  head(shell, {
    title: 'All Topics — ChemPrep',
    description: `Every ChemPrep module: ${TOPICS.length} interactive chemistry topics, from atoms and moles to enzyme kinetics.`,
    url: `${SITE_URL}/menu`,
  }),
  `<h1>All Topics</h1>\n${links}`)));

// Point each prerendered URL at its own file EXPLICITLY, above the SPA
// catch-all. Netlify would probably resolve /topic/x to /topic/x/index.html on
// its own, but "probably" is not good enough for the one behaviour this whole
// step depends on — and it cannot be checked without deploying. Rules are
// first-match-wins, and these list only slugs that exist, so an unknown
// /topic/xyz still falls through to /* and gets the router's 404 page rather
// than a hard Netlify 404.
const redirects = await readFile(join(DIST, '_redirects'), 'utf8');
await writeFile(join(DIST, '_redirects'),
  '# Generated by scripts/prerender.mjs — edit public/_redirects, not this file.\n' +
  ['/menu', ...GUIDES.map(g => `/guide/${g.slug}`), ...TOPICS.map(t => `/topic/${t.slug}`)]
    .map(u => `${u}  ${u}/index.html  200`).join('\n') + '\n\n' + redirects);

// Only pages that are the same for everyone. /progress and /today are one
// student's own state; there is nothing there to index.
const urls = ['/', '/menu', ...GUIDES.map(g => `/guide/${g.slug}`), ...TOPICS.map(t => `/topic/${t.slug}`)];
await writeFile(join(DIST, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n') + '\n</urlset>\n');
await writeFile(join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /progress\nDisallow: /today\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`prerendered ${written} pages + sitemap.xml (${urls.length} urls) + robots.txt at ${SITE_URL}`);
