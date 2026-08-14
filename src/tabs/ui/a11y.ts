// Accessibility and motion helpers — extracted from framework.ts (plan2 §7).
//
// These five have nothing to do with each other structurally, but they answer
// one question: what does this UI do for someone who is not using a mouse, not
// looking at a canvas, or has asked the OS to stop animating things. Keeping
// them together is the only way that question has a single place to be
// answered. framework.ts re-exports them, so no call site changed.

/**
 * Does this reader want motion kept to a minimum?
 *
 * Read live rather than cached: the setting can change while the page is open,
 * and the cost is a matchMedia lookup. `matchMedia` is guarded because it is
 * absent in some test environments, and the default there is "no preference" —
 * the same thing an unset OS preference reports.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Is this element off-screen — collapsed, or not in the document at all? The
 * one place the site asks that question, so a loop cannot be gated on a stale
 * idea of what "hidden" means.
 *
 * Two cases, and a simulation's animation loop must idle in both:
 *  - `details:not([open])`: a <details> the module nested itself.
 *  - `!isConnected`: the section is not the current route, so topicPage() has
 *    it detached. The rAF loop belongs to the TAB (its handle cancels it when
 *    the topic is left), so between sections of one topic the loop stays alive
 *    and this is what makes it stop painting.
 *
 * Either way a loop that reads this picks up again on the next frame after the
 * block comes back — no toggle or route listener to wire up.
 */
export function folded(el: Element): boolean {
  return !el.isConnected || !!el.closest('details:not([open])');
}

// ---- text alternatives for <canvas> ----
//
// A <canvas> is opaque to assistive tech: whatever it paints, the element
// exposes nothing. Most plots in the app go through plot() below, which knows
// its own axes and series and labels itself precisely. This is the fallback for
// the hand-drawn ones (orbital viewer, MO diagram, decay grid, gas box): name
// them from the nearest preceding heading, which in this codebase is the
// enclosing card's <h2> — the same words a sighted reader uses to identify the
// figure. role="img" also stops AT from wandering into the element.
function nearestHeading(el: Element): string | null {
  let node: Element | null = el;
  while (node) {
    for (let s = node.previousElementSibling; s; s = s.previousElementSibling) {
      if (/^H[1-6]$/.test(s.tagName)) {
        const t = s.textContent?.trim();
        if (t) return t;
      }
    }
    if (node.classList.contains('tab-root')) break;
    node = node.parentElement;
  }
  return null;
}

export function labelCanvases(root: HTMLElement): void {
  for (const c of Array.from(root.querySelectorAll('canvas'))) {
    // never override a label the tab (or plot()) set deliberately
    if (c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby') ||
        c.hasAttribute('aria-hidden')) continue;
    const name = nearestHeading(c);
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', name ?? 'Figure');
  }
}

/**
 * A table that scrolls sideways inside its card is unreachable by keyboard
 * unless something can focus the scroll container (WCAG 2.1.1 — Firefox does
 * this for you, Chrome does not). Give one a tab stop only while it actually
 * overflows: an unconditional tabindex would add ~20 dead stops per page for
 * tables that fit.
 */
export function markScrollableTables(root: ParentNode = document): void {
  for (const t of Array.from(root.querySelectorAll<HTMLElement>('.ref-table, .table-scroll'))) {
    const scrolls = t.scrollWidth > t.clientWidth + 1;
    if (scrolls === t.hasAttribute('tabindex')) continue;
    if (scrolls) {
      t.setAttribute('tabindex', '0');
      t.setAttribute('role', 'region');
      if (!t.hasAttribute('aria-label')) t.setAttribute('aria-label', `${nearestHeading(t) ?? 'Data'} table, scrollable`);
    } else {
      t.removeAttribute('tabindex');
      t.removeAttribute('role');
    }
  }
}
