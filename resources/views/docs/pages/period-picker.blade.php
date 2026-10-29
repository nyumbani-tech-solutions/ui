@extends('docs::layout')

@section('page', 'Period picker')
@section('lead', 'One filter for a day, a month, a year or a range of them, that writes the period string the server already reads.')

@section('content')
    <x-docs::section id="basic" title="Choose the type in advance">
        <p>Never build a one-off date filter. Use <code>&lt;x-nyumbani::period-picker&gt;</code> and set its <code>type</code> to the kind of period the report is about. The user does not switch between types: a monthly report offers months, so there is nothing to learn. The picker writes a hidden input called <code>period</code> in the format <code>$request->period()</code> reads, so the controller changes nothing.</p>
        <x-docs::table :columns="['Type', 'Renders', 'Period it writes']" :rows="[
            ['day', 'A field that opens a calendar, applied when a day is picked.', '2026-03-14'],
            ['month', 'A field that opens a month grid, applied when a month is picked.', '2026-03'],
            ['year', 'A year select, applied on change.', '2026'],
            ['day-range', 'A button that opens a modal with presets, and a From and a To field that each open a calendar.', '2026-01-01 to 2026-03-31'],
            ['month-range', 'The same, with a month grid in place of the day calendar.', '2026-01 to 2026-03'],
            ['year-range', 'The same, with year selects, since a calendar adds nothing to picking a year.', '2024 to 2026'],
        ]" />
        <x-docs::code lang="blade">
            @verbatim
            <form method="GET" action="{{ route('reports.payments') }}" x-data x-on:period-changed="$el.requestSubmit()">
                <x-nyumbani::period-picker type="month-range" :value="$period->formatted" />
            </form>
            @endverbatim
        </x-docs::code>
        <x-docs::code>
            use App\Models\Payment;

            $period = $request->period();

            Payment::query()->whereBetween('paid_at', [$period->from, $period->to])->get();
        </x-docs::code>
        <x-docs::callout type="info" title="Pass the period the server used">
            Give the picker <code>:value="$period->formatted"</code> so it shows the period the page actually used, including the default when the request had none. Without it the picker starts empty. A value that does not fit the type, such as a month given to a <code>year</code> picker, is ignored.
        </x-docs::callout>
    </x-docs::section>

    <x-docs::section id="types" title="Every type, live">
        <p>All six types, each with the period it writes shown underneath. Pick something and the value updates. A single period is applied as soon as it changes. A range is applied when the user presses Apply, and the button then reads the period in plain words, such as <strong>Jan – Mar 2026</strong>.</p>
        <x-docs::example title="Live: day, month and year">
            <div x-data="{ day: '', month: '', year: '' }" class="grid gap-3 sm:grid-cols-3">
                <div class="space-y-1.5">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">type="day"</p>
                    <x-nyumbani::period-picker type="day" name="docs-day" x-model="day" />
                    <p class="text-sm text-gray-600">Writes <code x-text="day || 'nothing yet'"></code></p>
                </div>
                <div class="space-y-1.5">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">type="month"</p>
                    <x-nyumbani::period-picker type="month" name="docs-month" x-model="month" />
                    <p class="text-sm text-gray-600">Writes <code x-text="month || 'nothing yet'"></code></p>
                </div>
                <div class="space-y-1.5">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">type="year"</p>
                    <x-nyumbani::period-picker type="year" name="docs-year" x-model="year" />
                    <p class="text-sm text-gray-600">Writes <code x-text="year || 'nothing yet'"></code></p>
                </div>
            </div>
        </x-docs::example>
        <x-docs::example title="Live: day, month and year ranges">
            <div x-data="{ days: '', months: '', years: '' }" class="grid gap-3 sm:grid-cols-3">
                <div class="space-y-1.5">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">type="day-range"</p>
                    <x-nyumbani::period-picker type="day-range" name="docs-days" x-model="days" />
                    <p class="text-sm text-gray-600">Writes <code x-text="days || 'nothing yet'"></code></p>
                </div>
                <div class="space-y-1.5">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">type="month-range"</p>
                    <x-nyumbani::period-picker type="month-range" name="docs-months" x-model="months" />
                    <p class="text-sm text-gray-600">Writes <code x-text="months || 'nothing yet'"></code></p>
                </div>
                <div class="space-y-1.5">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">type="year-range"</p>
                    <x-nyumbani::period-picker type="year-range" name="docs-years" x-model="years" />
                    <p class="text-sm text-gray-600">Writes <code x-text="years || 'nothing yet'"></code></p>
                </div>
            </div>
        </x-docs::example>
        <x-docs::example title="Live: starting on a period">
            <div class="flex flex-wrap items-start gap-3">
                <x-nyumbani::period-picker type="month" name="docs-start-month" value="2026-03" />
                <x-nyumbani::period-picker type="year" name="docs-start-year" value="2025" />
                <x-nyumbani::period-picker type="day-range" name="docs-start-days" value="2026-01-01 to 2026-03-31" />
                <x-nyumbani::period-picker type="month-range" name="docs-start-months" value="2026-01 to 2026-03" />
                <x-nyumbani::period-picker type="year-range" name="docs-start-years" value="2024 to 2026" />
            </div>
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="icon" title="The calendar icon">
        <p>A day, month or year picker shows a calendar icon attached to the left of its field, in the same colours as the theme's buttons. Tapping the icon opens the calendar. Switch it off with <code>:icon="false"</code>, or recolour it with <code>icon-bg</code>.</p>
        <x-docs::example title="Live: the default icon, a recoloured one, and none">
            <div class="grid gap-3 sm:grid-cols-3">
                <x-nyumbani::period-picker type="day" name="docs-icon-default" />
                <x-nyumbani::period-picker type="month" name="docs-icon-custom" icon-bg="bg-secondary hover:bg-secondary-dark" />
                <x-nyumbani::period-picker type="year" name="docs-icon-none" :icon="false" />
            </div>
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="calendar" title="The calendars">
        <p>Days and months are picked on a <a href="https://vanilla-calendar.pro" target="_blank" rel="noopener">Vanilla Calendar Pro</a> calendar. The field is read-only, so a phone never raises the keyboard, and it shows the date in plain words, such as <strong>14 Mar 2026</strong>.</p>
        <x-docs::table :columns="['Behaviour', 'Detail']" :rows="[
            ['Floats', 'The calendar opens beside its field over the page and never moves the fields or the modal. It opens above the field when there is no room below.'],
            ['Closes', 'When a date is picked, when the field is tapped again, on an outside click, on Escape (which leaves a modal open), and on scroll.'],
            ['Day limits', 'In a day range the To calendar refuses days before From, and the From calendar refuses days after To.'],
            ['Header', 'In the day view the month and year in the header are chips that open a list, and in the month view the year is. Picking a month or year from those lists only moves the calendar, it does not choose a date.'],
            ['Years', 'A year or year range is a plain select, because a calendar adds nothing to picking a year.'],
        ]" />
        <p>The library and its styles are bundled into <code>ui.js</code> and <code>ui.css</code>, so an app installs nothing. They add about 20 kB of script and 7 kB of styles, gzipped.</p>
    </x-docs::section>

    <x-docs::section id="theme" title="Theme">
        <p>The calendars take the Nyumbani colours from the theme: the primary colour for the selected date or month, today, weekends and hover tints. Change them in one place, the <code>--vc-*</code> variables on <code>.vc[data-vc=calendar]</code> in <code>theme.css</code>.</p>
    </x-docs::section>

    <x-docs::section id="presets" title="Presets">
        <p>Each range type has defaults, worked out when the page renders. The last-N presets include the current day, month or year. A single type has no presets.</p>
        <x-docs::table :columns="['Type', 'Default presets']" :rows="[
            ['day-range', 'Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, This year, Last year.'],
            ['month-range', 'This month, Last 3 months, Last 6 months, Last 12 months, This year, Last year.'],
            ['year-range', 'This year, Last 3 years, Last 5 years.'],
        ]" />
        <p>Pass <code>presets</code> to replace them: a list of a label and a period of the right kind.</p>
        <x-docs::code lang="blade">
            @verbatim
            <x-nyumbani::period-picker
                type="month-range"
                :presets="[
                    ['label' => 'First quarter', 'value' => '2026-01 to 2026-03'],
                    ['label' => 'Second quarter', 'value' => '2026-04 to 2026-06'],
                ]"
            />
            @endverbatim
        </x-docs::code>
    </x-docs::section>

    <x-docs::section id="custom-presets" title="Your own presets">
        <x-docs::example title="Live: two quarters instead of the defaults">
            <x-nyumbani::period-picker
                type="month-range"
                name="docs-quarters"
                title="Choose a quarter"
                :presets="[
                    ['label' => 'First quarter', 'value' => '2026-01 to 2026-03'],
                    ['label' => 'Second quarter', 'value' => '2026-04 to 2026-06'],
                ]"
            />
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="reacting" title="Reacting to a change">
        <p>The picker announces every change with a <code>period-changed</code> event whose <code>detail</code> holds the input <code>name</code> and the new <code>value</code>. Choose what suits the page.</p>
        <x-docs::tabs :labels="['GET form', 'Livewire', 'Alpine']">
            <x-docs::tab label="GET form">
                <p>The hidden input is part of the form, so submit it when the period changes.</p>
                <x-docs::code lang="blade">
                    @verbatim
                    <form method="GET" x-data x-on:period-changed="$el.requestSubmit()">
                        <x-nyumbani::period-picker type="month" />
                    </form>
                    @endverbatim
                </x-docs::code>
            </x-docs::tab>
            <x-docs::tab label="Livewire">
                <p>Put <code>wire:model</code> on the tag to bind the period string to a property.</p>
                <x-docs::code lang="blade">
                    @verbatim
                    <x-nyumbani::period-picker type="day-range" wire:model.live="period" />
                    @endverbatim
                </x-docs::code>
            </x-docs::tab>
            <x-docs::tab label="Alpine">
                <p>Put <code>x-model</code> on the tag, or listen for the event.</p>
                <x-docs::code lang="blade">
                    @verbatim
                    <div x-data="{ period: '' }" x-on:period-changed.window="period = $event.detail.value">
                        <x-nyumbani::period-picker type="year" />
                    </div>
                    @endverbatim
                </x-docs::code>
            </x-docs::tab>
        </x-docs::tabs>
    </x-docs::section>

    <x-docs::section id="props" title="Props">
        <x-docs::table :columns="['Prop', 'Default', 'Use']" :rows="[
            ['type', 'day', 'day, month, year, day-range, month-range or year-range. An unknown type throws.'],
            ['name', 'period', 'The name of the hidden input, and the query key the picker starts from.'],
            ['value', 'the request input', 'The starting period. Ignored when it does not fit the type.'],
            ['presets', 'per type', 'Replaces the default presets of a range type.'],
            ['min-year, max-year', '15 years back, this year', 'The years a year picker offers. They widen to hold the starting period and the presets.'],
            ['placeholder', 'per type', 'The text before a period is chosen.'],
            ['title', 'Choose a period', 'The heading of a range picker\'s modal.'],
            ['icon', 'true', 'Shows a calendar icon attached to the field of a day, month or year picker. Tapping it opens the calendar. False leaves a plain field.'],
            ['icon-bg', 'the theme\'s button colour', 'The classes that colour the icon, such as bg-secondary. They replace the default bg-primary-darker hover:bg-primary-dark, and the icon stays white. Write them out in full so Tailwind finds them.'],
        ]" />
        <p>The picker keeps its state under <code>value</code>, <code>from</code>, <code>to</code> and <code>open</code>, so avoid those names in an Alpine scope that wraps it.</p>
    </x-docs::section>
@endsection
