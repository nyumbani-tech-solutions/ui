{{--  Language switch, shown only when the app offers more than one language  --}}
@if (count(config('ui.locales', [])) > 1)
    <div @class(['flex items-center gap-2 text-sm', $class ?? ''])>
        @foreach (config('ui.locales') as $code => $label)
            @unless ($loop->first)
                <span class="text-secondary-light">|</span>
            @endunless

            <a href="{{ route('nyumbani.locale', ['locale' => $code]) }}" @class([
                'font-semibold text-primary-dark' => app()->getLocale() === $code,
                'text-secondary transition-colors hover:text-primary-dark' => app()->getLocale() !== $code,
            ])>{{ $label }}</a>
        @endforeach
    </div>
@endif
