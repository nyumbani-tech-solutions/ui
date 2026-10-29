---
name: nyumbani-period-picker
description: "Invoke when a Nyumbani app needs a date, month or year filter, or a range of them, for a report or list: the <x-nyumbani::period-picker> component, its types and presets, listening for period-changed, and reading the chosen period with $request->period(). Skip for a plain date field in a form and for the server-side period parsing itself (see nyumbani-helpers)."
metadata:
  author: nyumbani
---

# Nyumbani Period Picker

Use `<x-nyumbani::period-picker>` for every report or list filter by day, month, year or a range of them. Never build a one-off date filter. It writes one string, in the format `$request->period()` reads, so the controller needs nothing extra.

## Pick the type in advance
The programmer chooses the type; the user does not switch between them.

| `type` | Renders | Period it writes |
| --- | --- | --- |
| `day` | Field that opens a calendar, applied when a day is picked | `2026-03-14` |
| `month` | Field that opens a month grid, applied when a month is picked | `2026-03` |
| `year` | Year select, applied on change | `2026` |
| `day-range` | Button that opens a modal with presets and From and To fields that each open a calendar | `2026-01-01 to 2026-03-31` |
| `month-range` | The same, with a month grid | `2026-01 to 2026-03` |
| `year-range` | The same, with year selects | `2024 to 2026` |

The calendar is Vanilla Calendar Pro, bundled in `ui.js` and themed with the primary colour, so an app installs nothing. A range is committed only when the user presses Apply, and Apply stays disabled until both ends are set and the end is not before the start.

## Usage
```blade
<form method="GET" action="{{ route('reports.payments') }}" x-data x-on:period-changed="$el.requestSubmit()">
    <x-nyumbani::period-picker type="month-range" :value="$period->formatted" />
</form>
```
```php
use App\Models\Payment;

$period = $request->period();
Payment::query()->whereBetween('paid_at', [$period->from, $period->to])->get();
```

## Props
| Prop | Default | Use |
| --- | --- | --- |
| `type` | `day` | One of the six types above. An unknown type throws |
| `name` | `period` | The name of the hidden input, and the query key the picker starts from |
| `value` | the request's `name` input | The starting period. Ignored when it does not fit the type |
| `presets` | per type | A list of `['label' => ..., 'value' => '... to ...']` for the range types |
| `min-year`, `max-year` | 15 years back, this year | The years a year picker offers. They widen to hold the starting period and the presets |
| `placeholder` | per type | The text before a period is chosen |
| `title` | `Choose a period` | The heading of a range picker's modal |

Default presets: `day-range` has Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, This year and Last year (the last-N ranges end today). `month-range` has This month, Last 3, 6 and 12 months, This year and Last year. `year-range` has This year, Last 3 years and Last 5 years. A single type has no presets. Pass your own list to replace them.

## How the calendars behave
- The day and month fields are read-only and show the date in plain words; a tap opens a Vanilla Calendar Pro calendar that floats beside the field and never moves the page.
- It closes on a pick, a second tap, an outside click, Escape (the modal stays open) and scroll.
- In a day range, To refuses days before From and From refuses days after To.
- The header's month and year (day view) or year (month view) are chips that open a list, with a hint line under the grid. Picking from those lists only navigates.
- Years, single or in a range, are plain selects.
- Colours come from the `--vc-*` variables in the UI `theme.css`; change them there, never per page.

## Reacting to a change
- A GET form: the hidden input is part of the form, so submit it from `period-changed` as above.
- Livewire or Alpine: put `wire:model` or `x-model` on the tag and it is bound to the period string.
- Anything else: listen for `period-changed` on `window`; `event.detail` holds `name` and `value`.

## Gotchas
- The picker keeps its state under `value`, `from`, `to`, `open`, `editing` and `popover`, so avoid those names in an Alpine scope that wraps it, and the modal's reserved names (`modal`, `data`, `init`).
- Pass `:value="$period->formatted"` so the picker shows the period the server actually used, including the default. Without it the picker starts empty when the request has no `period`.
- Presets are worked out when the page renders, in the server's time zone.
