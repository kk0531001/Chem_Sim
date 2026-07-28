// Minimal client-side router: three page kinds, real URLs via the History
// API. Netlify needs a SPA fallback (public/_redirects) so deep links and
// refreshes on /topic/:id resolve to index.html.
export type Route = { kind: 'home' } | { kind: 'menu' } | { kind: 'topic'; id: string };

export function parseRoute(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { kind: 'home' };
  if (clean === '/menu') return { kind: 'menu' };
  const m = clean.match(/^\/topic\/([a-z0-9]+)$/i);
  if (m) return { kind: 'topic', id: m[1] };
  return { kind: 'home' };
}

function routeToPath(route: Route): string {
  if (route.kind === 'home') return '/';
  if (route.kind === 'menu') return '/menu';
  return `/topic/${route.id}`;
}

type Listener = (route: Route) => void;
const listeners: Listener[] = [];

export function navigate(route: Route, replace = false): void {
  const path = routeToPath(route);
  if (location.pathname !== path) {
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
