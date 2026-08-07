// The site's absolute address, resolved once for everything that has to bake a
// full URL into a static file: the %SITE_URL% substitution in vite.config.ts
// and the canonical/og/sitemap URLs written by prerender.mjs. Two copies of
// this rule would eventually disagree, and the failure is invisible until a
// link someone shared unfurls with the wrong host.
//
// Netlify sets URL to the site's primary address on every production build, so
// this is correct with no configuration. Set VITE_SITE_URL to override — e.g.
// when a custom domain is added, or to preview the real tags locally.
export const SITE_URL = (
  process.env.VITE_SITE_URL ||
  process.env.URL ||
  'http://localhost:5174'
).replace(/\/+$/, '');
