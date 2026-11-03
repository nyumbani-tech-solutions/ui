/**
 * Keep number inputs from changing by accident: the mouse wheel, the up and down arrow keys, and the
 * characters a number never needs (`e`, `E` and `+`) do nothing. Opt an input back in with `data-allow-spin`.
 * The listeners sit on the document, so inputs rendered later by Alpine, Livewire or a modal are covered.
 */

/**
 * Find the guarded number input an event came from
 */
const guardedInput = (target) => target instanceof HTMLInputElement
    && target.type === 'number'
    && !('allowSpin' in target.dataset)
    ? target
    : null;

/**
 * Blur a focused number input on the wheel, so it keeps its value and the page scrolls on
 */
document.addEventListener('wheel', () => {
    //  Get the focused field
    const input = guardedInput(document.activeElement);

    //  Let it go, so the wheel scrolls the page instead of the value
    if (input) input.blur();
}, { passive: true });

/**
 * Refuse the arrow keys and the characters that turn a number into notation
 */
document.addEventListener('keydown', (event) => {
    //  Get the field
    const input = guardedInput(event.target);

    //  Skip any other element
    if (!input) return;

    //  Refuse the steppers and the exponent and plus characters, but never a shortcut such as Ctrl+C
    const blocked = ['ArrowUp', 'ArrowDown', 'e', 'E', '+'].includes(event.key);

    if (blocked && !event.ctrlKey && !event.metaKey) event.preventDefault();
});

/**
 * Strip an exponent or a plus sign from pasted text
 */
document.addEventListener('paste', (event) => {
    //  Get the field
    const input = guardedInput(event.target);

    //  Skip any other element
    if (!input) return;

    //  Read the pasted text
    const text = event.clipboardData.getData('text');

    //  Let a plain number through
    if (!/[eE+]/.test(text)) return;

    //  Refuse the notation
    event.preventDefault();
});
