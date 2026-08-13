import { topicById, topicBySlug } from './topics';
import { guideBySlug } from './guides';

// Minimal client-side router: page kinds, real URLs via the History
// API. Netlify needs a SPA fallback (public/_redirects) so deep links and
// refreshes on /topic/:id resolve to index.html.
export type Route =
  | { kind: 'home' }
  | { kind: 'menu' }
  | { kind: 'progress' }
  // "What should I do right now" — the Continue block and three ways out.
  // A route of its own rather than a homepage anchor so it can be bookmarked
  // and pinned; personal, so it is kept out of the sitemap like /progress.
  | { kind: 'today' }
  // `section` is the named slug of one block of the topic page
  // (`/topic/chemical-equilibrium/practice`). Absent means "the topic's entry
  // point" — the spine resolves that to its first section on arrival, which is
  // what keeps every pre-existing /topic/<slug> link and bookmark working.
  //
  // Never an index: reordering a topic's blocks must not silently repoint
  // somebody's bookmark at a different section.
  | { kind: 'topic'; id: string; section?: string }
  // I.3 competition landing pages. Keyed by SLUG, not by comp: the slug is the
  // search phrase ("ccc-study-guide") and it is the reason the page exists.
  | { kind: 'guide'; slug: string }
  | { kind: 'notfound'; path: string };

export function parseRoute(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { kind: 'home' };
  if (clean === '/menu') return { kind: 'menu' };
  if (clean === '/progress') return { kind: 'progress' };
  if (clean === '/today') return { kind: 'today' };
  const g = clean.match(/^\/guide\/([a-z0-9-]+)$/i);
  if (g && guideBySlug(g[1].toLowerCase())) return { kind: 'guide', slug: g[1].toLowerCase() };
  const m = clean.match(/^\/topic\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/i);
  const topic = m && topicBySlug(m[1].toLowerCase());
  // The section is NOT validated here: this file has no way to know a topic's
  // sections without loading its module, and it must not start. An unknown
  // section is handled by the spine, which falls back to the topic's first
  // section — a renamed block gives you the right topic, not a 404.
  if (topic) return m[2] ? { kind: 'topic', id: topic.id, section: m[2].toLowerCase() } : { kind: 'topic', id: topic.id };
  return { kind: 'notfound', path: pathname };
}

export function routeToPath(route: Route): string {
  if (route.kind === 'home') return '/';
  if (route.kind === 'menu') return '/menu';
  if (route.kind === 'progress') return '/progress';
  if (route.kind === 'today') return '/today';
  if (route.kind === 'guide') return `/guide/${route.slug}`;
  if (route.kind === 'notfound') return route.path;
  return `/topic/${topicById(route.id)?.slug ?? route.id}${route.section ? `/${route.section}` : ''}`;
}

type Listener = (route: Route) => void;
const listeners: Listener[] = [];

/**
 * `search` is how one page hands a prepared VIEW to another — the progress
 * dashboard's "practice these" links open the question bank on a filtered
 * results view, which qbank.ts already knows how to restore from the query
 * string. Without it the destination would open on its default view, because
 * pushing a bare pathname discards whatever search was there.
 *
 * Pass it including the leading '?'. Omitted means "no query string", not
 * "keep the current one": navigating away from a filtered view must clear it.
 */
export function navigate(route: Route, replace = false, search = ''): void {
  const path = routeToPath(route) + search;
  if (location.pathname + location.search !== path) {
    if (replace) history.replaceState({}, '', path);
    else history.pushState({}, '', path);
  }
  for (const l of listeners) l(route);
}

export function onRouteChange(cb: Listener): void { listeners.push(cb); }

export function initRouter(): Route {
  window.addEventListener('popstate', () => {
    const r = parseRoute(location.pathname);
    for (const l of listeners) l(r);
  });
  return parseRoute(location.pathname);
}
