import { defineConfig } from 'vite';
// Social scrapers (Facebook, Twitter/X, Slack, Discord, iMessage) do not
// resolve relative og:image paths — the URL has to be absolute in the served
// HTML, and they don't run JS, so it can't be filled in at runtime either.
// So index.html carries a %SITE_URL% placeholder that gets substituted here.
// scripts/prerender.mjs bakes the same value into the per-topic pages, which is
// why it is defined once, outside this file.
import { SITE_URL } from './scripts/site-url.mjs';

// KaTeX ships each of its 20 faces three times — woff2, woff and ttf — and its
// stylesheet lists all three as fallbacks. Every browser this app supports has
// had woff2 since 2016, so the woff and ttf copies are 876 kB of deploy that no
// visitor ever requests. This drops them and removes their src() entries, so
// the CSS doesn't point at files that aren't there.
//
// It also preloads the two faces that essentially every formula uses. Font
// files are hashed, so the names are only knowable here, at bundle time — which
// is why this is a plugin rather than two <link> tags in index.html.
const PRELOAD_FACES = ['KaTeX_Main-Regular', 'KaTeX_Math-Italic'];

function katexFonts() {
  return {
    name: 'chemprep-katex-fonts',
    enforce: 'post' as const,
    generateBundle(_options: unknown, bundle: Record<string, { type: string; source?: unknown; fileName: string }>) {
      for (const [name, item] of Object.entries(bundle)) {
        if (item.type !== 'asset') continue;
        if (/KaTeX_.*\.(woff|ttf)$/.test(name)) { delete bundle[name]; continue; }
        if (name.endsWith('.css') && typeof item.source === 'string') {
          // ,url(...)format("woff") and the truetype twin — the woff2 entry
          // comes first in KaTeX's own @font-face rules, so this leaves it.
          item.source = item.source.replace(/,url\([^)]*\)format\("(woff|truetype)"\)/g, '');
        }
      }
    },
    transformIndexHtml: {
      order: 'post' as const,
      // The emitted asset names are read off ctx.bundle rather than a field set
      // in generateBundle: plugin hook order between the two is not guaranteed,
      // and an empty preload list fails silently, which is the worst kind.
      handler: (html: string, ctx: { bundle?: Record<string, unknown> }) => {
        const names = Object.keys(ctx.bundle ?? {})
          .filter(n => n.endsWith('.woff2') && PRELOAD_FACES.some(f => n.includes(f)));
        return html.replace('</head>', names
          .map(f => `    <link rel="preload" href="/${f}" as="font" type="font/woff2" crossorigin>\n`)
          .join('') + '</head>');
      },
    },
  };
}

export default defineConfig({
  plugins: [
    {
      name: 'chemprep-site-url',
      transformIndexHtml: {
        order: 'pre',
        handler: (html: string) => html.replaceAll('%SITE_URL%', SITE_URL),
      },
    },
    katexFonts(),
  ],
});
