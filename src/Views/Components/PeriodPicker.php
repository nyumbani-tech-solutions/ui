<?php

namespace Nyumbani\Ui\Views\Components;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Carbon;
use Illuminate\View\Component;
use InvalidArgumentException;

class PeriodPicker extends Component
{
    /**
     * The kinds of picker, each with the pattern its period must match
     *
     * @var array<string, string>
     */
    protected const TYPES = [
        'day' => '/^\d{4}-\d{2}-\d{2}$/',
        'month' => '/^\d{4}-\d{2}$/',
        'year' => '/^\d{4}$/',
        'day-range' => '/^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/',
        'month-range' => '/^\d{4}-\d{2} to \d{4}-\d{2}$/',
        'year-range' => '/^\d{4} to \d{4}$/',
    ];

    /**
     * The period the picker starts on, or an empty string when none is chosen
     */
    public string $period;

    /**
     * Whether the picker spans two dates and so opens a modal
     */
    public bool $isRange;

    /**
     * The kind of date its two ends are: day, month or year
     */
    public string $unit;

    /**
     * The presets of a range picker, each with a label and the period it applies
     *
     * @var array<int, array{label: string, value: string}>
     */
    public array $presets;

    /**
     * The years a year picker offers, newest first
     *
     * @var array<int, int>
     */
    public array $years;

    /**
     * Create the picker, with presets given as a list of label and period pairs, and the calendar icon on its fields shown or hidden and given a background class
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function __construct(
        public string $type = 'day',
        public string $name = 'period',
        ?string $value = null,
        ?array $presets = null,
        public ?int $minYear = null,
        public ?int $maxYear = null,
        public ?string $placeholder = null,
        public ?string $title = null,
        public bool $icon = true,
        public ?string $iconBg = null,
    ) {
        //  Refuse a type the picker does not know
        if (! array_key_exists($type, self::TYPES)) {
            throw new InvalidArgumentException("Unknown period picker type [{$type}]. Use one of: ".implode(', ', array_keys(self::TYPES)).'.');
        }

        //  Determine whether the picker spans two dates
        $this->isRange = str_ends_with($type, '-range');

        //  Get the unit of date the picker picks
        $this->unit = str_replace('-range', '', $type);

        //  Start on the given period, or the one in the request, when it fits the type
        $period = trim((string) ($value ?? request($name)));

        //  Start on the period if it fits the type
        $this->period = preg_match(self::TYPES[$type], $period) ? $period : '';

        //  Ask for the kind of date the type picks, unless the app gave its own text
        $this->placeholder ??= match ($type) {
            'day' => __('Select a day'),
            'month' => __('Select a month'),
            'year' => __('Select a year'),
            default => __('Select a period'),
        };

        //  Title the modal of a range, unless the app gave its own text
        $this->title ??= __('Choose a period');

        //  Colour the icon like the theme's buttons, unless the app gave its own classes
        $this->iconBg ??= 'bg-primary-darker hover:bg-primary-dark';

        //  Offer presets on a range only, the app's own or the defaults for its unit
        $this->presets = $this->isRange ? ($presets ?? $this->defaultPresets()) : [];

        //  Offer years on a year picker only
        $this->years = $this->unit === 'year' ? $this->yearOptions() : [];
    }

    /**
     * Get the presets a range picker offers when the app gives none
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function defaultPresets(): array
    {
        //  Get the current moment
        $now = now();

        //  Pick the presets that fit the unit the range is made of
        return match ($this->unit) {
            //  Months, the last N ending with the current month
            'month' => [
                //  Only the current month
                $this->preset(__('This month'), $now->format('Y-m'), $now->format('Y-m')),
                //  Two months back to now
                $this->preset(__('Last 3 months'), $now->copy()->subMonthsNoOverflow(2)->format('Y-m'), $now->format('Y-m')),
                //  Five months back to now
                $this->preset(__('Last 6 months'), $now->copy()->subMonthsNoOverflow(5)->format('Y-m'), $now->format('Y-m')),
                //  Eleven months back to now
                $this->preset(__('Last 12 months'), $now->copy()->subMonthsNoOverflow(11)->format('Y-m'), $now->format('Y-m')),
                //  January to December of this year
                $this->preset(__('This year'), $now->format('Y').'-01', $now->format('Y').'-12'),
                //  January to December of last year
                $this->preset(__('Last year'), $now->copy()->subYear()->format('Y').'-01', $now->copy()->subYear()->format('Y').'-12'),
            ],
            //  Years, the last N ending with the current year
            'year' => [
                //  Only the current year
                $this->preset(__('This year'), $now->format('Y'), $now->format('Y')),
                //  Two years back to now
                $this->preset(__('Last 3 years'), (string) ($now->year - 2), $now->format('Y')),
                //  Four years back to now
                $this->preset(__('Last 5 years'), (string) ($now->year - 4), $now->format('Y')),
            ],
            //  Days, the last N ending today
            default => [
                //  Only today
                $this->preset(__('Today'), $now->toDateString(), $now->toDateString()),
                //  Only the day before
                $this->preset(__('Yesterday'), $now->copy()->subDay()->toDateString(), $now->copy()->subDay()->toDateString()),
                //  Six days back to today
                $this->preset(__('Last 7 days'), $now->copy()->subDays(6)->toDateString(), $now->toDateString()),
                //  Twenty-nine days back to today
                $this->preset(__('Last 30 days'), $now->copy()->subDays(29)->toDateString(), $now->toDateString()),
                //  The first to the last day of this month
                $this->preset(__('This month'), $now->copy()->startOfMonth()->toDateString(), $now->copy()->endOfMonth()->toDateString()),
                //  The first to the last day of last month
                $this->preset(__('Last month'), $now->copy()->subMonthNoOverflow()->startOfMonth()->toDateString(), $now->copy()->subMonthNoOverflow()->endOfMonth()->toDateString()),
                //  The first to the last day of this year
                $this->preset(__('This year'), $now->copy()->startOfYear()->toDateString(), $now->copy()->endOfYear()->toDateString()),
                //  The first to the last day of last year
                $this->preset(__('Last year'), $now->copy()->subYear()->startOfYear()->toDateString(), $now->copy()->subYear()->endOfYear()->toDateString()),
            ],
        };
    }

    /**
     * Get the years a year picker offers, newest first, widened to hold every year of the starting period and the presets
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function yearOptions(): array
    {
        //  Take the years the period and the presets already use
        $used = collect([$this->period, ...array_column($this->presets, 'value')])
            ->flatMap(fn (string $period) => preg_match_all('/\d{4}/', $period, $years) ? $years[0] : [])
            ->map(fn (string $year) => (int) $year);

        //  Get the newest year wanted
        $newest = max($this->maxYear ?? Carbon::now()->year, $used->max() ?? 0);

        //  Get the oldest year wanted
        $oldest = min($this->minYear ?? $newest - 15, $used->min() ?? $newest);

        //  List every year between them, newest first
        return range($newest, $oldest);
    }

    /**
     * Build a preset from its label and the two ends of its period
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function preset(string $label, string $from, string $to): array
    {
        return ['label' => $label, 'value' => "{$from} to {$to}"];
    }

    /**
     * Get the view
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function render(): View
    {
        return view('nyumbani::components.period-picker');
    }
}
