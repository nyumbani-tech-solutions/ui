/**
 * Turn a `<select data-searchable>` into a field the user types in to find an option, for the long lists of
 * customers, agents or units no one should scroll. The select stays in the page, hidden but focusable, and
 * keeps doing the work: it is what the form posts, what x-model, wire:model, @selected and old() set, and
 * what the modal's review reads. A text field that opens a filtered list takes its place on screen.
 *
 * Every word typed must appear in an option's text, in any order, ignoring case and accents, so "wanjiru
 * gmail" finds "Jane Wanjiru - jane@gmail.com". Put words to match that the option does not show, such as
 * a phone number, in its `data-search` attribute. Groups show as headings. Selects rendered later by Alpine,
 * Livewire or a modal, options added after the page loads, and values set by code are all followed.
 */

/**
 * The most options the list draws at once: typing narrows the rest
 */
const LIMIT = 100;

/**
 * The tallest the list grows, in pixels, before it scrolls
 */
const MAX_HEIGHT = 288;

/**
 * Every enhanced select, with the parts the script made for it
 */
const enhanced = new Map();

/**
 * A number for the ids of the list and its options
 */
let sequence = 0;

/**
 * Translate a text when the translate script is loaded, as in ui.js, or return it as it is
 */
const translate = (text, replace = {}) => window.__ ? window.__(text, replace) : text;

/**
 * Lower-case a text, drop its accents and squash its spaces, so the search ignores all three
 */
const normalize = (text) => text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Get the text an option shows, on one line
 */
const optionText = (option) => option.text.replace(/\s+/g, ' ').trim();

/**
 * Read the options of a select: its placeholder (the first option with an empty value) and every other option, with its group
 */
const readOptions = (select) => {
    //  Collect the placeholder and the options
    let placeholder = null;
    const options = [];

    //  Go through every option, inside a group or not
    for (const option of select.options) {
        //  Skip an option the page hides
        if (option.hidden) continue;

        //  Keep the first empty option as the placeholder
        if (option.value === '' && placeholder === null) {
            placeholder = option;

            continue;
        }

        //  Get the group the option sits in, if any
        const group = option.parentElement instanceof HTMLOptGroupElement ? option.parentElement.label : null;

        //  Keep what the list shows and what the search reads
        const text = optionText(option);

        options.push({ option, text, group, haystack: normalize(`${text} ${option.dataset.search ?? ''} ${group ?? ''}`) });
    }

    return { placeholder, options };
};

/**
 * Enhance a select: hide it, put the search field after it, and follow it from then on
 */
const enhance = (select) => {
    //  Get the ids the field and the list point at
    const id = `searchable-select-${++sequence}`;

    //  Create the field the user types in, styled as the select was
    const input = document.createElement('input');

    input.type = 'text';
    input.className = select.className;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.dataset.searchableInput = '';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', `${id}-list`);

    //  Create the list, which floats over the page so a modal or a card never clips it
    const list = document.createElement('div');

    list.id = `${id}-list`;
    list.hidden = true;
    list.dataset.searchableList = '';
    list.setAttribute('role', 'listbox');

    //  Keep the state of this select
    const state = { select, input, list, id, open: false, active: -1, shown: [], dirty: true, data: null, lastIndex: null, observer: null };

    //  Read the options again whenever they change, such as an x-for adding them or a quick-create appending one
    state.observer = new MutationObserver(() => {
        state.dirty = true;
        sync(state);

        if (state.open) render(state);
    });

    state.observer.observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['label', 'hidden', 'disabled'] });

    //  Wire up the field and the list
    listen(state);

    //  Put them in the page and hide the select
    attach(state);

    enhanced.set(select, state);
};

/**
 * Put the field and the list right after the select and hide the select, again after Livewire morphs them away
 */
const attach = (state) => {
    //  Hide the select but keep it focusable, so the browser can still point at it when a required one is empty
    state.select.dataset.searchableReady = '';
    state.select.tabIndex = -1;

    //  Put the field and the list after the select
    if (!state.input.isConnected) state.select.after(state.input, state.list);

    //  Name the field after the select's label
    const label = [...(state.select.labels ?? [])].map((element) => element.textContent.trim()).join(' ');

    if (label) state.input.setAttribute('aria-label', label);

    //  Show the chosen option
    state.lastIndex = null;
    sync(state);
};

/**
 * Get the options of a select, read again only when they changed
 */
const data = (state) => {
    //  Read them again when they changed
    if (state.dirty || !state.data) {
        state.data = readOptions(state.select);
        state.dirty = false;
    }

    return state.data;
};

/**
 * Show what the select holds in the closed field: the chosen option, or the placeholder
 */
const sync = (state) => {
    //  Get the select and its field
    const { select, input } = state;

    //  Follow the select's disabled and invalid states
    input.disabled = select.disabled;
    input.setAttribute('aria-invalid', select.getAttribute('aria-invalid') ?? 'false');

    //  Keep the field as it is while the user is typing in it
    if (state.open) return;

    //  Show the placeholder's text as the field's placeholder
    const { placeholder } = data(state);

    input.placeholder = placeholder ? optionText(placeholder) : translate('Search');

    //  Show the chosen option, or nothing when the placeholder is chosen
    const chosen = select.selectedOptions[0];

    input.value = chosen && chosen.value !== '' ? optionText(chosen) : '';
    state.lastIndex = select.selectedIndex;
};

/**
 * Draw the options that match what was typed
 */
const render = (state) => {
    //  Get the parts, the options and the words typed
    const { select, input, list, id } = state;
    const { placeholder, options } = data(state);
    const words = normalize(input.value).split(' ').filter(Boolean);

    //  Keep the options holding every word, and the placeholder of a select that may be left empty
    const matches = options.filter((entry) => words.every((word) => entry.haystack.includes(word)));
    const clearable = placeholder && !select.required && !words.length;

    //  Draw the first few, so a long list stays quick
    state.shown = [...(clearable ? [{ option: placeholder, text: optionText(placeholder), group: null, clear: true }] : []), ...matches.slice(0, LIMIT)];
    list.replaceChildren();

    //  Draw each option, under a heading each time the group changes
    let group = null;

    state.shown.forEach((entry, index) => {
        //  Draw the heading of a new group
        if (entry.group && entry.group !== group) {
            const heading = document.createElement('div');

            heading.dataset.searchableGroup = '';
            heading.setAttribute('role', 'presentation');
            heading.textContent = entry.group;
            list.append(heading);
        }

        group = entry.group;

        //  Draw the option
        const item = document.createElement('div');

        item.id = `${id}-option-${index}`;
        item.dataset.searchableOption = '';
        item.dataset.index = index;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(entry.option.selected && !entry.clear));
        item.textContent = entry.text;

        if (entry.clear) item.dataset.clear = '';

        if (entry.option.disabled) item.setAttribute('aria-disabled', 'true');

        list.append(item);
    });

    //  Say so when nothing matches, or when typing would show more
    if (!state.shown.length || matches.length > LIMIT) {
        const note = document.createElement('div');

        note.dataset.searchableNote = '';
        note.textContent = state.shown.length
            ? translate('Keep typing to see :count more', { count: matches.length - LIMIT })
            : translate('No matches');
        list.append(note);
    }

    //  Start on the chosen option, or the first one that can be picked
    const chosen = state.shown.findIndex((entry) => entry.option.selected && !entry.clear && !entry.option.disabled);

    highlight(state, chosen >= 0 && !words.length ? chosen : state.shown.findIndex((entry) => !entry.option.disabled));
};

/**
 * Mark an option as the one Enter picks, and scroll it into view
 */
const highlight = (state, index) => {
    //  Keep the index
    state.active = index;

    //  Move the mark
    for (const item of state.list.querySelectorAll('[data-searchable-option]')) {
        item.toggleAttribute('data-active', Number(item.dataset.index) === index);
    }

    //  Point the field at it, for screen readers
    const item = index >= 0 ? state.list.querySelector(`#${state.id}-option-${index}`) : null;

    if (item) {
        state.input.setAttribute('aria-activedescendant', item.id);

        //  Scroll the list alone, since scrollIntoView would also scroll the page or the modal under it
        const { list } = state;

        if (item.offsetTop < list.scrollTop) {
            list.scrollTop = item.offsetTop;
        } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
            list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
        }
    } else {
        state.input.removeAttribute('aria-activedescendant');
    }
};

/**
 * Move the mark up or down, past options that cannot be picked
 */
const move = (state, step) => {
    //  Find the next option that can be picked
    let index = state.active;

    for (let tries = 0; tries < state.shown.length; tries++) {
        index = (index + step + state.shown.length) % state.shown.length;

        if (!state.shown[index].option.disabled) return highlight(state, index);
    }
};

/**
 * Place the list under the field, or above it when there is no room below
 */
const place = (state) => {
    //  Find where the field is on the screen
    const box = state.input.getBoundingClientRect();

    //  Open where there is more room, below unless the list would not fit
    const below = window.innerHeight - box.bottom - 8;
    const above = box.top - 8;
    const opensBelow = below >= Math.min(MAX_HEIGHT, 160) || below >= above;

    //  Float the list the width of the field
    Object.assign(state.list.style, {
        left: `${box.left}px`,
        width: `${box.width}px`,
        top: opensBelow ? `${box.bottom + 4}px` : 'auto',
        bottom: opensBelow ? 'auto' : `${window.innerHeight - box.top + 4}px`,
        maxHeight: `${Math.max(120, Math.min(MAX_HEIGHT, (opensBelow ? below : above) - 4))}px`,
    });
};

/**
 * Open the list with every option, the field emptied for typing and the chosen option as its placeholder
 */
const open = (state) => {
    //  Skip a disabled select or an open list
    if (state.open || state.select.disabled) return;

    //  Show the chosen option as the placeholder while the user types
    const current = state.input.value;

    state.open = true;
    state.input.value = '';

    if (current) state.input.placeholder = current;

    //  Draw and place the list
    render(state);
    place(state);

    state.list.hidden = false;
    state.input.setAttribute('aria-expanded', 'true');

    //  Bring the chosen option into view
    highlight(state, state.active);
};

/**
 * Close the list and show the chosen option again
 */
const close = (state) => {
    //  Skip a closed list
    if (!state.open) return;

    //  Hide the list
    state.open = false;
    state.list.hidden = true;
    state.input.setAttribute('aria-expanded', 'false');
    state.input.removeAttribute('aria-activedescendant');

    //  Show the chosen option
    sync(state);
};

/**
 * Pick an option: set it on the select and tell the page, as a change made on the select itself would
 */
const choose = (state, index) => {
    //  Get the option, skipping one that cannot be picked
    const entry = state.shown[index];

    if (!entry || entry.option.disabled) return;

    //  Set it on the select and tell x-model, wire:model and any listener
    const { select } = state;
    const changed = select.value !== entry.option.value;

    select.value = entry.option.value;

    if (changed) {
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    //  Clear a required error the choice fixed
    if (select.checkValidity() && select.getAttribute('aria-invalid') === 'true') select.setAttribute('aria-invalid', 'false');

    //  Close the list on the chosen option
    close(state);
};

/**
 * Wire up the field, the list and the select
 */
const listen = (state) => {
    //  Get the parts
    const { select, input, list } = state;

    //  Open the list on a click, and close it on a second one
    input.addEventListener('mousedown', () => {
        if (state.open) {
            close(state);
        } else {
            requestAnimationFrame(() => open(state));
        }
    });

    //  Filter the list as the user types
    input.addEventListener('input', () => {
        if (!state.open) open(state);

        render(state);
    });

    //  Close the list when the field loses focus
    input.addEventListener('blur', () => close(state));

    //  Drive the list from the keyboard
    input.addEventListener('keydown', (event) => {
        //  Open the list with the arrow keys or Enter, without submitting the form
        if (!state.open) {
            if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) && !event.altKey) {
                event.preventDefault();
                open(state);
            }

            return;
        }

        //  Move, pick or close
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                move(state, 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                move(state, -1);
                break;
            case 'Home':
                event.preventDefault();
                state.active = -1;
                move(state, 1);
                break;
            case 'End':
                event.preventDefault();
                state.active = state.shown.length;
                move(state, -1);
                break;
            case 'Enter':
                event.preventDefault();
                choose(state, state.active);
                break;
            case 'Escape':
                //  Close the list only, leaving a modal around it open
                event.preventDefault();
                event.stopPropagation();
                close(state);
                break;
            case 'Tab':
                close(state);
                break;
        }
    });

    //  Keep the focus in the field while an option is clicked, then pick it
    list.addEventListener('mousedown', (event) => event.preventDefault());

    list.addEventListener('click', (event) => {
        const item = event.target.closest('[data-searchable-option]');

        if (item) choose(state, Number(item.dataset.index));
    });

    //  Send the focus to the field when the select gets it, such as from its label
    select.addEventListener('focus', () => input.focus());

    //  Show a change made on the select, such as a form reset or a listener of the page
    select.addEventListener('change', () => sync(state));

    //  Mark the field when the form refuses an empty required select, and let the user pick at once
    select.addEventListener('invalid', () => {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
    });
};

/**
 * Enhance every searchable select in the page that is not enhanced yet
 */
const scan = (root = document) => {
    //  Look in the root and under it
    const selects = root instanceof HTMLSelectElement ? [root] : root.querySelectorAll?.('select[data-searchable]') ?? [];

    for (const select of selects) {
        if (select.matches('[data-searchable]') && !select.multiple && !enhanced.has(select)) enhance(select);
    }
};

/**
 * Follow every enhanced select: forget one that left the page, put back what Livewire morphed away, and show a value set by code
 */
const follow = () => {
    for (const [select, state] of enhanced) {
        //  Forget a select that left the page, with its list
        if (!select.isConnected) {
            state.observer.disconnect();
            state.list.remove();
            enhanced.delete(select);

            continue;
        }

        //  Put back the field, or the hidden state, when a morph removed them
        if (!state.input.isConnected || !('searchableReady' in select.dataset)) attach(state);

        //  Show a value or a disabled state that code set without a change event, such as x-model
        if (select.selectedIndex !== state.lastIndex || select.disabled !== state.input.disabled) sync(state);
    }
};

/**
 * Enhance the selects of the page, and every one added later
 */
const start = () => {
    //  Enhance the selects already here
    scan();

    //  Enhance the ones Alpine, Livewire or a modal add later
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) scan(node);
            }
        }
    }).observe(document.documentElement, { childList: true, subtree: true });

    //  Follow values set by code, which fire no event
    setInterval(follow, 250);

    //  Keep an open list on its field when the page scrolls or resizes, such as when a phone's keyboard opens, and close it once the field leaves the screen
    const keepPlaced = (event) => {
        for (const state of enhanced.values()) {
            //  Skip a closed list, and a scroll inside the list itself
            if (!state.open || state.list.contains(event.target)) continue;

            //  Close the list when its field scrolled out of sight
            const box = state.input.getBoundingClientRect();

            if (box.bottom < 0 || box.top > window.innerHeight) {
                close(state);
            } else {
                place(state);
            }
        }
    };

    window.addEventListener('scroll', keepPlaced, true);
    window.addEventListener('resize', keepPlaced);
};

//  Start once the page is parsed
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}
