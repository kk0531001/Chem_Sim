// Shared account/sign-in widget: solved-question count plus email magic-link
// and Google OAuth sign-in. Rendered as an always-open panel in the app
// sidebar, and as a small popover off a "Sign in" trigger on the homepage.
import { h } from './tabs/framework';
import {
  isCloudConfigured, currentEmail, signInWithEmail, signInWithGoogle, signOut,
  solvedCount, onProgressChange,
} from './progress';

// Decorative: it always sits immediately before the words "Continue with
// Google", so announcing it would just duplicate the button's own label.
const GOOGLE_G = `<svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/>
<path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5l-6.6-5.6C29.6 35.1 27 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.6C39.5 37.5 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
</svg>`;

// The sign-in form shared by both variants: Google button, divider, email + link.
function buildSignInForm(): HTMLElement {
  // aria-label, not a placeholder: a placeholder is not an accessible name,
  // and it disappears the moment the field has content.
  const emailIn = h('input', {
    type: 'email', placeholder: 'you@email.com', autocomplete: 'email',
    'aria-label': 'Email address for a sign-in link',
  });
  // role=status: every sign-in outcome — 'Sending…', an empty-field nudge, a
  // magic-link error — lands here by textContent, which a screen reader would
  // otherwise never hear. Same job as search.ts and feedback.ts.
  const msg = h('div', { class: 'acc-msg', role: 'status' });
  const googleBtn = h('button', { class: 'acc-google-btn', html: `${GOOGLE_G}<span>Continue with Google</span>` });
  googleBtn.addEventListener('click', async () => {
    msg.textContent = '';
    const r = await signInWithGoogle();
    if (!r.ok) msg.textContent = r.msg;
  });
  const sendBtn = h('button', { class: 'btn primary' }, 'Send magic link');
  sendBtn.addEventListener('click', async () => {
    const val = (emailIn as HTMLInputElement).value.trim();
    if (!val) { msg.textContent = 'Enter an email first.'; return; }
    msg.textContent = 'Sending…';
    const r = await signInWithEmail(val);
    msg.textContent = r.msg;
  });
  return h('div', { class: 'acc-form' },
    googleBtn,
    h('div', { class: 'acc-divider' }, 'or'),
    emailIn,
    sendBtn,
    msg,
  );
}

// Always-open panel for the app sidebar.
export function mountSidebarAccountPanel(container: HTMLElement): void {
  render();
  onProgressChange(render);

  function render(): void {
    container.replaceChildren();
    // No solved count here: the mastery strip immediately above this panel
    // carries it, alongside the streak and the weakest topic. Two copies of the
    // same number in one footer is one copy too many.
    const rows: (Node | string)[] = [];
    if (!isCloudConfigured()) {
      rows.push(h('div', { class: 'pp-note' }, 'Saved on this device. Add Supabase keys to sync across devices.'));
      container.append(...rows);
      return;
    }
    const email = currentEmail();
    if (email) {
      rows.push(
        h('div', { class: 'pp-note' }, `Synced · ${email}`),
        h('button', { class: 'pp-btn', onclick: () => void signOut() }, 'Sign out'),
      );
    } else {
      rows.push(h('div', { class: 'pp-note' }, 'Sign in to sync across devices:'), buildSignInForm());
    }
    container.append(...rows);
  }
}

// Compact "Sign in" trigger + popover for the homepage top bar.
//
// The trigger is built ONCE and lives outside render(). It used to be rebuilt
// on every render, which meant opening the popover from the keyboard removed
// the very button that had focus — focus fell to <body> and the reader had to
// tab from the top of the document to reach the thing they had just opened.
export function mountHomepageAccountWidget(container: HTMLElement): void {
  let open = false;
  const wrap = h('div', { class: 'account-widget' });
  const trigger = h('button', { class: 'btn-ghost acc-trigger', 'aria-expanded': 'false', 'aria-haspopup': 'dialog' });
  const pop = h('div', { class: 'acc-dropdown', role: 'dialog', 'aria-label': 'Account' });
  pop.hidden = true;
  wrap.append(trigger, pop);
  container.append(wrap);

  const setOpen = (v: boolean, restoreFocus = false): void => {
    open = v;
    trigger.setAttribute('aria-expanded', String(v));
    pop.hidden = !v;
    if (v) render();
    // Only on a deliberate close (Escape, or toggling the trigger) — not when
    // an outside click already moved focus somewhere the user chose.
    else if (restoreFocus) trigger.focus();
  };

  trigger.addEventListener('click', e => { e.stopPropagation(); setOpen(!open, true); });
  render();
  onProgressChange(render);
  document.addEventListener('click', e => {
    if (open && !wrap.contains(e.target as Node)) setOpen(false);
  });
  wrap.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false, true); }
  });

  function render(): void {
    const email = currentEmail();
    trigger.textContent = !isCloudConfigured() ? `${solvedCount()} solved`
      : email ? email
        : 'Sign in';
    if (!open) return;
    pop.replaceChildren();
    if (!isCloudConfigured()) {
      pop.append(h('div', { class: 'pp-note' }, 'Progress is saved on this device only. Add Supabase keys to sync across devices.'));
    } else if (email) {
      pop.append(
        h('div', { class: 'pp-note' }, `${solvedCount()} solved · synced`),
        h('button', { class: 'btn', onclick: () => void signOut() }, 'Sign out'),
      );
    } else {
      pop.append(
        h('div', { class: 'pp-note' }, `${solvedCount()} solved on this device — sign in to sync:`),
        buildSignInForm(),
      );
    }
    // Focus the first thing in the popover, so opening it with the keyboard
    // lands where the user is going rather than leaving them at the trigger.
    (pop.querySelector('input, button') as HTMLElement | null)?.focus();
  }
}
