<div x-data="periodPicker({ name: @js($name), unit: @js($unit), period: @js($period), placeholder: @js($placeholder), presets: @js($presets) })" x-modelable="value" x-on:scroll.window.capture="editing = null" {{ $attributes->whereStartsWith(['wire:model', 'x-model']) }} {{ $attributes->whereDoesntStartWith(['wire:model', 'x-model'])->class('inline-block') }}>
    <input type="hidden" name="{{ $name }}" value="{{ $period }}" x-bind:value="value">

    @if ($isRange)
        <button type="button" class="btn btn-primary" x-on:click="open = true" aria-haspopup="dialog">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span x-text="label">{{ $placeholder }}</span>
        </button>

        <x-nyumbani::modal x-model="open" :title="$title" size="xl">
            <div @class(['grid gap-6 p-4', 'md:grid-cols-5' => $presets])>
                @if ($presets)
                    <div class="md:col-span-3">
                        <p class="mb-1.5 text-sm font-medium text-gray-700">{{ __('Quick select') }}</p>
                        <div class="grid grid-cols-2 gap-1.5 lg:grid-cols-3" role="listbox" aria-label="{{ __('Quick select') }}">
                            <template x-for="preset in presets" :key="preset.value">
                                <button type="button" role="option" class="rounded border px-3 py-2 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" x-bind:class="isPicked(preset) ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-gray-200'" x-bind:aria-selected="isPicked(preset)" x-on:click="pick(preset)">
                                    <span class="block text-sm font-medium" x-bind:class="isPicked(preset) ? 'text-primary' : 'text-gray-800'" x-text="preset.label"></span>
                                    <span class="block text-xs text-gray-500" x-text="summary(preset)"></span>
                                </button>
                            </template>
                        </div>
                    </div>
                @endif

                <div @class(['space-y-4 self-start', 'md:col-span-2' => $presets])>
                    @if ($unit === 'year')
                        <label class="block text-sm font-medium text-gray-700">
                            {{ __('From') }}
                            <select class="mt-1 w-full" x-model="from">
                                <option value="">{{ __('Select the first year') }}</option>
                                @foreach ($years as $year)
                                    <option value="{{ $year }}">{{ $year }}</option>
                                @endforeach
                            </select>
                        </label>
                    @else
                        <div x-on:click.outside="editing === 'from' && (editing = null)" x-on:keydown.escape="editing === 'from' && ($event.stopPropagation(), editing = null)">
                            <label class="block text-sm font-medium text-gray-700">
                                {{ __('From') }}
                                <input type="text" readonly inputmode="none" class="mt-1 w-full cursor-pointer" placeholder="{{ $unit === 'month' ? __('Select a month') : __('Select a date') }}" aria-haspopup="dialog" x-bind:aria-expanded="editing === 'from'" x-bind:value="fieldLabel('from')" x-on:click="toggle('from', $el)" x-on:keydown.enter.prevent="toggle('from', $el)">
                            </label>
                            <div x-show="editing === 'from'" x-cloak x-bind:style="popoverStyle" class="fixed z-40">
                                <div x-effect="syncCalendar('from')" x-init="mountCalendar($el, 'from')"></div>
                            </div>
                        </div>
                    @endif

                    @if ($unit === 'year')
                        <label class="block text-sm font-medium text-gray-700">
                            {{ __('To') }}
                            <select class="mt-1 w-full" x-model="to">
                                <option value="">{{ __('Select the last year') }}</option>
                                @foreach ($years as $year)
                                    <option value="{{ $year }}">{{ $year }}</option>
                                @endforeach
                            </select>
                        </label>
                    @else
                        <div x-on:click.outside="editing === 'to' && (editing = null)" x-on:keydown.escape="editing === 'to' && ($event.stopPropagation(), editing = null)">
                            <label class="block text-sm font-medium text-gray-700">
                                {{ __('To') }}
                                <input type="text" readonly inputmode="none" class="mt-1 w-full cursor-pointer" placeholder="{{ $unit === 'month' ? __('Select a month') : __('Select a date') }}" aria-haspopup="dialog" x-bind:aria-expanded="editing === 'to'" x-bind:value="fieldLabel('to')" x-on:click="toggle('to', $el)" x-on:keydown.enter.prevent="toggle('to', $el)">
                            </label>
                            <div x-show="editing === 'to'" x-cloak x-bind:style="popoverStyle" class="fixed z-40">
                                <div x-effect="syncCalendar('to')" x-init="mountCalendar($el, 'to')"></div>
                            </div>
                        </div>
                    @endif

                    <p x-show="backwards" x-cloak class="text-sm text-red-600" role="alert">{{ __('The end cannot be before the start.') }}</p>
                </div>
            </div>

            <x-slot:action>
                <div class="flex items-center justify-between gap-3 p-3 lg:p-0">
                    <p class="min-w-0 truncate text-sm" x-bind:class="valid ? 'font-medium text-gray-800' : 'text-gray-400'" x-text="draftLabel"></p>
                    <div class="flex shrink-0 gap-1.5">
                        <button type="button" class="btn btn-primary btn-sm" x-on:click="open = false">{{ __('Cancel') }}</button>
                        <button type="button" class="btn btn-primary btn-sm" x-bind:disabled="! valid" x-on:click="apply()">{{ __('Apply') }}</button>
                    </div>
                </div>
            </x-slot:action>
        </x-nyumbani::modal>
    @elseif ($unit === 'year')
        <div class="flex items-stretch">
            @if ($icon)
                <span class="pointer-events-none flex shrink-0 items-center justify-center rounded-l-sm px-3 text-white {{ $iconBg }}" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                </span>
            @endif
            <select @class(['w-full', 'period-field-attached' => $icon]) aria-label="{{ $placeholder }}" x-bind:value="value" x-on:change="choose($event.target.value)">
                <option value="">{{ $placeholder }}</option>
                @foreach ($years as $year)
                    <option value="{{ $year }}" @selected($period === (string) $year)>{{ $year }}</option>
                @endforeach
            </select>
        </div>
    @else
        <div x-on:click.outside="editing === 'value' && (editing = null)" x-on:keydown.escape="editing === 'value' && ($event.stopPropagation(), editing = null)">
            <div x-ref="group" class="flex items-stretch">
                @if ($icon)
                    <button type="button" tabindex="-1" aria-label="{{ __('Open the calendar') }}" class="flex shrink-0 cursor-pointer items-center justify-center rounded-l-sm px-3 text-white {{ $iconBg }}" x-on:click="toggle('value', $refs.group)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    </button>
                @endif
                <input type="text" readonly inputmode="none" @class(['w-full cursor-pointer', 'period-field-attached' => $icon]) placeholder="{{ $placeholder }}" aria-label="{{ $placeholder }}" aria-haspopup="dialog" x-bind:aria-expanded="editing === 'value'" x-bind:value="fieldLabel('value')" x-on:click="toggle('value', $refs.group)" x-on:keydown.enter.prevent="toggle('value', $refs.group)">
            </div>
            <div x-show="editing === 'value'" x-cloak x-bind:style="popoverStyle" class="fixed z-40">
                <div x-effect="syncCalendar('value')" x-init="mountCalendar($el, 'value')"></div>
            </div>
        </div>
    @endif
</div>
