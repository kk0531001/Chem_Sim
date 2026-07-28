// Minimal line-art icon set (24x24, currentColor stroke) matching the Lab
// Journal aesthetic — used on topic cards, meta rows, and page chrome.
// No emoji anywhere: every visual glyph here is an inline SVG.
const svg = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

export const TOPIC_ICONS: Record<string, string> = {
  atom: svg(`
    <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
    <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" stroke-width="1.3"/>
    <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" stroke-width="1.3" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" stroke-width="1.3" transform="rotate(120 12 12)"/>`),
  molecule: svg(`
    <line x1="7" y1="7" x2="12" y2="16" stroke="currentColor" stroke-width="1.4"/>
    <line x1="17" y1="7" x2="12" y2="16" stroke="currentColor" stroke-width="1.4"/>
    <line x1="7" y1="7" x2="17" y2="7" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="7" cy="7" r="2.3" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="17" cy="7" r="2.3" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="12" cy="16" r="2.3" stroke="currentColor" stroke-width="1.4"/>`),
  flask: svg(`
    <path d="M10 3h4M10 3v5.2L4.6 18a2 2 0 001.7 3h11.4a2 2 0 001.7-3L14 8.2V3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 14h9" stroke="currentColor" stroke-width="1.2"/>`),
  thermo: svg(`
    <path d="M13 14.5V5.5a1.8 1.8 0 10-3.6 0v9a3.6 3.6 0 103.6 0z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="11.2" cy="17" r="1.1" fill="currentColor"/>`),
  equilibrium: svg(`
    <path d="M4 9h14M14.5 9l-3-3M14.5 9l-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 15H6M9.5 15l3-3M9.5 15l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`),
  bolt: svg(`
    <path d="M13 2 5 14h6l-2 8 9-13h-6l1-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>`),
  gas: svg(`
    <circle cx="7" cy="8" r="1.5" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="14" cy="6" r="1" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="17" cy="11" r="1.3" stroke="currentColor" stroke-width="1.3"/>
    <path d="M4 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`),
  crystal: svg(`
    <path d="M12 3 4 9l8 12 8-12-8-6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M4 9h16M9 9l3 12M15 9l-3 12" stroke="currentColor" stroke-width="1"/>`),
  dna: svg(`
    <path d="M7 3c0 6 10 6 10 12s-10 6-10 12" stroke="currentColor" stroke-width="1.3"/>
    <path d="M17 3c0 6-10 6-10 12s10 6 10 12" stroke="currentColor" stroke-width="1.3"/>
    <path d="M8 8h8M7.4 12h9.2M7 16h10" stroke="currentColor" stroke-width="1"/>`),
  book: svg(`
    <path d="M4 5.5A2.5 2.5 0 016.5 3H12v18H6.5A2.5 2.5 0 004 18.5v-13z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M20 5.5A2.5 2.5 0 0017.5 3H12v18h5.5a2.5 2.5 0 002.5-2.5v-13z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>`),
  scale: svg(`
    <path d="M12 3v18M6 21h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M4 7h16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M4 7l-2.4 5h4.8L4 7zM20 7l-2.4 5h4.8L20 7z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>`),
};

export const CLOCK_ICON = svg(`
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/>
  <path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`);

export const ARROW_ICON = svg(`
  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);

export function topicIconSVG(key: string): string {
  return TOPIC_ICONS[key] ?? TOPIC_ICONS.molecule;
}
