// "Something wrong on this page?" (ROADMAP I.2) — the bug report and feedback
// box, reachable from the sidebar on every page of the app.
//
// A native <dialog>: it gives focus trapping, Escape-to-close, the backdrop and
// inertness of the rest of the page for free, all of which a hand-rolled modal
// gets wrong on the first pass. Nothing here is worth a component library.
//
// Per ROADMAP 0.5 the submitted text is only ever handled as `textContent` —
// it is never interpolated into HTML anywhere in this file, and nothing reads
// it back out of the database into the page. That is the whole XSS story for a
// free-text field, and it is why the acknowledgement below does not echo it.
import { h, button } from './tabs/framework';
import { signal, flush } from './signals';

/** Inserts the trigger immediately before `before` (the sidebar's home link). */
export function mountFeedback(before: HTMLElement): void {
  const open = h('button', { id: 'feedback-link', type: 'button' }, 'Send feedback');
  before.before(open);

  let dialog: HTMLDialogElement | null = null;

  open.addEventListener('click', () => {
    // Built on first use, then reused: the form keeps no state worth clearing,
    // and rebuilding it per open would drop focus handling on the floor.
    dialog ??= buildDialog();
    dialog.showModal();
    dialog.querySelector('textarea')?.focus();
  });
}

function buildDialog(): HTMLDialogElement {
  const area = h('textarea', {
    id: 'feedback-text', rows: 6, maxlength: 2000,
    placeholder: 'What went wrong, or what would help? A wrong answer, a broken simulation, a confusing explanation — all useful.',
  });
  const status = h('p', { class: 'feedback-status', role: 'status' });
  const send = button('Send', () => {
    const text = area.value.trim();
    if (!text) { status.textContent = 'Nothing to send yet.'; area.focus(); return; }
    // The page the reader was on is most of the context a report needs, and it
    // costs nothing to collect. location.search can carry a question id (?q=),
    // which is exactly the detail people forget to include.
    signal('feedback', location.pathname + location.search, { note: text });
    flush();
    area.value = '';
    status.textContent = 'Sent — thank you. There is no reply channel, so include what you can.';
  }, 'primary');

  const dialog = h('dialog', { id: 'feedback-dialog', 'aria-labelledby': 'feedback-title' },
    h('form', { method: 'dialog', class: 'feedback-form' },
      h('h2', { id: 'feedback-title' }, 'Send feedback'),
      h('label', { for: 'feedback-text' }, 'Tell me what you found'),
      area,
      h('p', { class: 'feedback-note' },
        'Sent anonymously with the page address. No account, no email, no reply — if you want an answer, this is the wrong channel.'),
      status,
      h('div', { class: 'feedback-actions' },
        // formmethod=dialog on the close button, so Escape and this button do
        // the same thing and neither submits anything.
        h('button', { type: 'submit', class: 'btn', value: 'close' }, 'Close'),
        send),
    ),
  );
  // The send button lives inside a method=dialog form and must not close it —
  // the acknowledgement is the point.
  send.type = 'button';
  document.body.append(dialog);
  return dialog;
}
