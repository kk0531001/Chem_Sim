import { defineConfig } from 'vite';

// Social scrapers (Facebook, Twitter/X, Slack, Discord, iMessage) do not
// resolve relative og:image paths — the URL has to be absolute in the served
// HTML, and they don't run JS, so it can't be filled in at runtime either.
// So index.html carries a %SITE_URL% placeholder that gets substituted here.
//
// Netlify sets URL to the site's primary address on every production build, so
// this is correct with no configuration. Set VITE_SITE_URL to override — e.g.
// when a custom domain is added, or to preview the real tags locally.
const SITE_URL = (
  process.env.VITE_SITE_URL ||
  process.env.URL ||
  'http://localhost:5174'
).replace(/\/+$/, '');

export default defineConfig({
  plugins: [
    {
      name: 'chemprep-site-url',
      transformIndexHtml: {
        order: 'pre',
        handler: (html: string) => html.replaceAll('%SITE_URL%', SITE_URL),
      },
    },
  ],
});
