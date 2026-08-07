import { topicById, topicBySlug } from './topics';

// Minimal client-side router: page kinds, real URLs via the History
// API. Netlify needs a SPA fallback (public/_redirects) so deep links and
// refreshes on /topic/:id resolve to index.html.
export type Route =
  | { kind: 'home' }
  | { kind: 'menu' }
  | { kind: 'progress' }
  | { kind: 'topic'; id: string }
  | { kind: 'notfound'; path: string };

export function parseRoute(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { kind: 'home' };
  if (clean === '/menu') return { kind: 'menu' };
  if (clean === '/progress') return { kind: 'progress' };
  const m = clean.match(/^\/topic\/([a-z0-9-]+)$/i);
  const topic = m && topicBySlug(m[1].toLowerCase());
  if (topic) return { kind: 'topic', id: topic.id };
  return { kind: 'notfound', path: pathname };
}

export function routeToPath(route: Route): string {
  if (route.kind === 'home') return '/';
  if (route.kind === 'menu') return '/menu';
  if (route.kind === 'progress') return '/progress';
  if (route.kind === 'notfound') return route.path;
  return `/topic/${topicById(route.id)?.slug ?? route.id}`;
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
