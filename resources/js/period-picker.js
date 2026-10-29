/**
 * Register the `periodPicker` Alpine component used by `<x-nyumbani::period-picker>`: it keeps one period
 * string in the format `$request->period()` reads (2026, 2026-03, 2026-03-14 or a range of them such as
 * 2026-01 to 2026-03), writes it to a hidden input and announces every change with a `period-changed` event.
 * The day and month ends of a range are picked on a Vanilla Calendar Pro calendar that opens under the field.
 */
import { Calendar } from 'vanilla-calendar-pro';
import 'vanilla-calendar-pro/styles/layout.css';
import 'vanilla-calendar-pro/styles/themes/light.css';

/**
 * Get the month number and year of a month or year part such as "2026-03" or "2026"
 */
const parts = (part) => part.split('-').map(Number);

/**
 * Get the name of a month in the Kenyan locale, long or short
 */
const monthName = (year, month, style) => new Date(year, month - 1, 1).toLocaleDateString('en-KE', { month: style });

/**
 * Describe one day, month or year, such as "14 Mar 2026", "March 2026" or "2026"
 */
const describe = (part, unit) => {
    //  Read the numbers out of the part
    const [year, month, day] = parts(part);

    //  A year is shown as it is
    if (unit === 'year') return String(year);

    //  A month shows its full name and year
    if (unit === 'month') return `${monthName(year, month, 'long')} ${year}`;

    //  A day shows the short date, built from local numbers so no time zone moves it
    return new Date(year, month - 1, day).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Describe a range of months, dropping the year from the first end when both fall in the same year
 */
const describeMonths = (from, to) => {
    //  Read the numbers out of each end
    const [fromYear, fromMonth] = parts(from);
    const [toYear, toMonth] = parts(to);

    //  Share the year when both months are in it
    if (fromYear === toYear) return `${monthName(fromYear, fromMonth, 'short')} – ${monthName(toYear, toMonth, 'short')} ${toYear}`;

    return `${monthName(fromYear, fromMonth, 'short')} ${fromYear} – ${monthName(toYear, toMonth, 'short')} ${toYear}`;
};

/**
 * Describe a period or a range of them in plain words, such as "March 2026", "Jan – Mar 2026" or "2024 – 2026"
 */
const describePeriod = (period, unit) => {
    //  Split the period into its ends
    const [from, to] = period.split(' to ');

    //  A single day, month or year, or a range that starts and ends on the same one
    if (!to || from === to) return describe(from, unit);

    //  A range of months shares the year when it can
    if (unit === 'month') return describeMonths(from, to);

    return `${describe(from, unit)} – ${describe(to, unit)}`;
};

/**
 * Add an alpine:init event listener to the document
 */
document.addEventListener('alpine:init', () => {
    /**
     * Get the state of a period picker from its name, the kind of date it picks and the period it starts on
     *
     * The state is the committed value plus a draft (from and to) that a range picker edits inside its modal,
     * so nothing reaches the server until the user presses Apply.
     */
    Alpine.data('periodPicker', (config) => {
        //  The calendars by the end they pick, kept out of the reactive state so Alpine never wraps them
        const calendars = {};

        return {
            value: config.period,
            presets: config.presets,
            from: '',
            to: '',
            open: false,
            editing: null,
            popover: {},

            /**
             * Copy the committed range into the draft whenever the modal opens
             */
            init() {
                //  Start the draft on the committed range
                this.syncDraft();

                //  Reset the draft each time the modal opens, so a cancelled edit is forgotten
                this.$watch('open', (isOpen) => {
                    //  Close any calendar so the modal opens on the fields
                    this.editing = null;

                    if (isOpen) this.syncDraft();
                });
            },

            /**
             * Set the draft from the committed range
             */
            syncDraft() {
                //  Split the range into its two ends
                const [from, to] = this.value.split(' to ');

                //  Keep each end, or nothing when there is no range yet
                this.from = from || '';
                this.to = to || '';
            },

            /**
             * Get the text for the trigger button: the period in plain words, or the placeholder when none is chosen
             */
            get label() {
                return this.value ? describePeriod(this.value, config.unit) : config.placeholder;
            },

            /**
             * Get the draft range in plain words for the modal header, or the placeholder before anything is chosen
             */
            get draftLabel() {
                //  Nothing chosen yet
                if (!this.from && !this.to) return config.placeholder;

                //  Only the start is chosen
                if (!this.to) return `${describe(this.from, config.unit)} – …`;

                //  Only the end is chosen
                if (!this.from) return `… – ${describe(this.to, config.unit)}`;

                return describePeriod(`${this.from} to ${this.to}`, config.unit);
            },

            /**
             * Get the dates a preset covers in plain words, shown beside its name
             */
            summary(preset) {
                return describePeriod(preset.value, config.unit);
            },

            /**
             * Get whether the draft is a complete range that does not end before it starts
             */
            get valid() {
                //  Both ends have the same shape, so comparing them as text compares them as dates
                return this.from !== '' && this.to !== '' && this.to >= this.from;
            },

            /**
             * Get whether the draft has both ends but ends before it starts
             */
            get backwards() {
                return this.from !== '' && this.to !== '' && this.to < this.from;
            },

            /**
             * Get whether a preset is the draft
             */
            isPicked(preset) {
                return preset.value === `${this.from} to ${this.to}`;
            },

            /**
             * Fill the draft with a preset
             */
            pick(preset) {
                //  Split the preset into its ends
                const [from, to] = preset.value.split(' to ');

                //  Fill the draft
                this.from = from;
                this.to = to;
            },

            /**
             * Commit the draft range, close the modal and announce the change
             */
            apply() {
                //  Ignore an incomplete or backwards range
                if (!this.valid) return;

                //  Commit the range and close the modal
                this.value = `${this.from} to ${this.to}`;
                this.open = false;

                //  Tell the page
                this.announce();
            },

            /**
             * Commit the value an inline picker holds and announce the change
             */
            choose(value) {
                //  Keep the value
                this.value = value;

                //  Tell the page
                this.announce();
            },

            /**
             * Get the text a From or To field shows: the date in plain words, or nothing before one is chosen
             */
            fieldLabel(key) {
                return this[key] ? describe(this[key], config.unit) : '';
            },

            /**
             * Open the calendar beside a field, or close it when it is already open
             */
            toggle(key, field) {
                //  Close the calendar when it is the one open
                if (this.editing === key) {
                    this.editing = null;

                    return;
                }

                //  Find where the field is on the screen
                const box = field.getBoundingClientRect();

                //  Keep the calendar the width of the field, within what a calendar needs and the screen allows
                const width = Math.min(Math.max(box.width, 272), 320);
                const left = Math.max(8, Math.min(box.left, window.innerWidth - width - 8));

                //  Open below the field, or above it when the screen has no room below
                const fitsBelow = window.innerHeight - box.bottom >= 340;

                this.popover = { left, width, ...(fitsBelow ? { top: box.bottom + 4 } : { bottom: window.innerHeight - box.top + 4 }) };
                this.editing = key;
            },

            /**
             * Get the styles that float the calendar over the page where toggle() put it, so it never moves the fields
             *
             * This is an object, not a string: Alpine replaces the whole style attribute with a string, which would
             * undo the display: none that x-show sets and leave every calendar of the page showing at once.
             */
            get popoverStyle() {
                return Object.fromEntries(Object.entries(this.popover).map(([side, pixels]) => [side, `${pixels}px`]));
            },

            /**
             * Keep the date picked on a calendar, as one end of the draft or as the value of a single picker, and close the calendar
             */
            chosen(key, value) {
                //  Keep the date and close the calendar
                this[key] = value;
                this.editing = null;

                //  A single picker is applied as soon as it is picked, where a range waits for Apply
                if (key === 'value') this.announce();
            },

            /**
             * Create the calendar that picks one end of the range inside the element
             */
            mountCalendar(element, key) {
                //  Keep the component, since the calendar calls back with its own this
                const component = this;

                //  Pick a month grid for a month range and a day grid otherwise
                const isMonth = config.unit === 'month';

                //  Create the calendar, which renders inline so it can never be clipped by the modal
                const calendar = new Calendar(element, {
                    type: isMonth ? 'month' : 'default',
                    selectionDatesMode: 'single',
                    selectedTheme: 'light',
                    firstWeekday: 1,
                    onClickDate(self) {
                        //  Take the one date that is selected
                        const [date] = self.context.selectedDates;

                        if (date) component.chosen(key, date);
                    },
                    onClickMonth(self) {
                        //  Leave a day calendar alone, where the header's month list only moves to that month
                        if (!isMonth) return;

                        //  Take the month and year that were clicked, as a period
                        const month = String(self.context.selectedMonth + 1).padStart(2, '0');

                        component.chosen(key, `${self.context.selectedYear}-${month}`);
                    },
                });

                //  Draw it, and show the end it already holds
                calendar.init();
                calendars[key] = calendar;
                this.syncCalendar(key);
            },

            /**
             * Show the date an end holds on its calendar, and stop the other end being picked backwards
             */
            syncCalendar(key) {
                //  Read everything the calendar shows first, so Alpine reruns this when any of it changes
                const value = this[key];
                const [from, to] = [this.from, this.to];

                //  Wait until the calendar exists
                const calendar = calendars[key];

                if (!calendar) return;

                //  A month calendar shows the month and year of its end
                if (config.unit === 'month') {
                    if (value) calendar.set({ selectedMonth: parts(value)[1] - 1, selectedYear: parts(value)[0] }, { month: true, year: true });

                    return;
                }

                //  A day calendar selects its date, opens on its month and refuses dates the other end rules out
                calendar.set({
                    selectedDates: value ? [value] : [],
                    dateMin: key === 'to' && from ? from : '1970-01-01',
                    dateMax: key === 'from' && to ? to : '2470-12-31',
                }, { dates: true, month: true, year: true });
            },

            /**
             * Tell the page the period changed, with the input name and the new period
             */
            announce() {
                //  Wait for the hidden input to take the new value, so a listener that submits the form sends it
                this.$nextTick(() => this.$dispatch('period-changed', { name: config.name, value: this.value }));
            },
        };
    });
});
