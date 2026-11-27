# nyumbani/ui

The Nyumbani look, as a package: the portal, auth and error layouts, the sign-in pages, the modal, period picker, searchable select, loader, file input, password input and navigation components, toasts, the error pages, favicons and the Tailwind theme. It requires [`nyumbani/essentials`](../essentials), which stays headless and works without it.

Views and components share one namespace: `nyumbani::layouts.portal`, `nyumbani::auth.login` and `<x-nyumbani::modal>`.

## Requirements

- An app with `nyumbani/essentials` (Composer brings it) and its steps done
- Livewire 4 (Composer brings it), Tailwind CSS 4 and Vite, with `resources/css/app.css` and `resources/js/app.js`

## Install

1. Require the package:

```
composer require nyumbani/ui
```

2. Run the UI installer, which is safe to run again:

```
php artisan ui:install
```

It adds the shared Vite aliases to `vite.config.js`, imports the theme in `resources/css/app.css` with the `@source` lines for `app/Enums`, `app/DataTables` and `config/dt-tables.php`, imports `ui.js` and the Essentials `helpers.js` in `resources/js/app.js` and starts Livewire there, gives an untouched `config/dt-tables.php` the Tailwind theme, optionally publishes the basic portal (answer the question, or pass `--portal`), runs `npm run build` when `node_modules` exists, and prints a checklist. `php artisan nyumbani:install` runs it for you when you pick UI.

To do it by hand:

```css
/* resources/css/app.css, in place of @import 'tailwindcss' */
@import '../../vendor/nyumbani/ui/resources/css/theme.css';
```

```js
// resources/js/app.js
import '../../vendor/nyumbani/ui/resources/dist/ui.js';
import '../../vendor/nyumbani/essentials/resources/dist/helpers.js';
import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm';

//  Start Livewire, which starts the Alpine it bundles
Livewire.start();
```

3. Use a layout. Extend the portal layout and name the view that holds the menu, or publish a starter portal (a dashboard, a layout and a sidebar) with `php artisan ui:install --portal`:

```blade
@extends('nyumbani::layouts.portal')

@section('sidebar', 'partials.sidebar')
```

4. Build the assets: `npm install && npm run build`.

## Using the UI in a project that is not a Nyumbani app

The components, scripts and styles work without the Nyumbani layouts, so another project can take them and write its own layouts. Install as above, then:

1. Import `base.css` in place of `theme.css`. It is the theme with the Nyumbani colours, font, base size and corners as the defaults and no Google Fonts request. Any token you leave undefined stays Nyumbani, so redefine only what you want to change. `theme.css` is the Nyumbani web fonts plus `base.css`.

```css
/* resources/css/app.css */
@import '../../vendor/nyumbani/ui/resources/css/base.css';

@theme {
    --font-sans: 'Lato', ui-sans-serif, sans-serif;

    --color-primary-darker: #115e59;
    --color-primary-dark: #0f766e;
    --color-primary: #0d9488;

    --color-secondary-dark: #0f172a;
    --color-secondary: #1e293b;
    --color-secondary-light: #475569;
}

:root {
    --font-size-base: 16px;
}
```

Those six colours, `--font-sans` and `--font-size-base` are the whole contract, each defaulting to the Nyumbani value (the orange, the slate, Inter and Roboto, 15px), plus three optional corner radii that default to the Nyumbani look: `--radius-field` (fields, buttons and the period picker's calendar icon, `0.25rem`), `--radius-panel` (the modal on a large screen, the calendar popover, the period presets, the file preview, the modal's close button and the toasts, `0.25rem`) and `--radius-sheet` (the modal's top corners as a bottom sheet on a phone, `0.75rem`). Leave one out and it keeps its Nyumbani default.

2. Set `error_pages` to `false` in `config/ui.php`: the package error pages extend the Nyumbani app layout.
3. Set `loader` in `config/ui.php` to your own loader image, a path under `public/` or a full URL: the shipped one has the Nyumbani colours drawn into it. Set `loader_message` too: the default text is Nyumbani's.
4. Bind your own `Nyumbani\Essentials\Contracts\AuthViews` in your `AppServiceProvider::register()` to replace the Nyumbani sign-in, forgot-password and reset-password pages.
5. Implement `Nyumbani\Essentials\Contracts\HasHomeRoute` on your user model: signing in sends the user to its `homeRoute()` URL, and throws a `LogicException` outside production without it.

`ui:install` accepts a stylesheet that imports `base.css` and does not add `theme.css` next to it. See the Installation page of the UI docs.

## Configuration

Publish `config/ui.php` with `php artisan vendor:publish --tag=ui-config`.

| Key | Environment | Purpose |
| --- | --- | --- |
| `branding.description` | `UI_DESCRIPTION` | The sentence under the app name on the sign-in page |
| `branding.theme_color` | `UI_THEME_COLOR` | The browser address bar and installed app colour (`#d97706`) |
| `loader_message` | `UI_LOADER_MESSAGE` | The text `<x-nyumbani::loader>` shows when a page passes no `message`. Empty uses "Nyumbani is processing your data..." |
| `loader` | `UI_LOADER` | The image `<x-nyumbani::loader>` shows, a path under `public/` or a full URL. Empty uses the Nyumbani loader the package ships |
| `locales` | | The languages offered as `code => label`. With more than one, the UI shows a language switch and applies the visitor's choice. Default: English only |
| `js_translations` | | English texts your scripts read through `window.__('text')`, translated on the server |
| `error_pages` | | Set to `false` to leave the framework error pages alone |

## Changing the scripts

The scripts in `resources/js` are bundled with toastr, Fancybox, jQuery and Alpine UI into `resources/dist`, so an app installs none of them. After changing one, run `npm run build` in this folder and commit `resources/dist`.

## Docs

The full docs are served at `/nyumbani-ui/docs`, in the `local` environment only, by `nyumbani/docs` (`composer require --dev nyumbani/docs`). The package works without it.

## Period picker

`<x-nyumbani::period-picker type="month-range" />` is the one date filter for reports and lists: a day, month or year, or a range of them, written as the `period` string that `$request->period()` reads. Single days and months open a calendar beside the field; ranges open a modal with presets and a From and a To calendar. The calendars are [Vanilla Calendar Pro](https://vanilla-calendar.pro) (MIT), a dev dependency of this package that is bundled into `resources/dist/ui.js` and `ui.css`, so an app installs nothing. It adds about 20 kB of script and 7 kB of styles, gzipped, to the bundle every app loads. See the Period picker page of the UI docs and the `nyumbani-period-picker` skill.

## Searchable select

Add `data-searchable` to a `<select>` whose list can grow long, such as customers or agents, and the user types to find an option instead of scrolling. The select stays in the page and is still what the form posts, so `@selected`, `old()`, `required`, `x-model` and `wire:model` work unchanged; the script only puts a filtering field in its place. Put words to match that an option does not show, such as a phone number, in its `data-search`. See the Searchable select page of the UI docs.

## Payment prompt

`<x-nyumbani::payment-prompt>` is the one screen for paying with M-Pesa: it follows a push your app started (with `StkPushManager` from `nyumbani/daraja`, by a request, Livewire or ajax) and shows how to pay by hand whenever the push does not succeed. It follows over a Reverb websocket, or by polling the check url when there is none: set `DARAJA_STK_MODE=poll` (with `DARAJA_STK_POLL_INTERVAL`, 3 seconds, and `DARAJA_STK_POLL_DURATION`, 300 seconds) or pass `mode="poll"`, `:interval` and `:duration`. Without a mode it polls only when Reverb is not set up. Reverb needs (`REVERB_APP_KEY`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`, or the `UI_ECHO_*` keys) and a queue worker, which polling does not. How long it waits for the payer to answer comes from the attempt's `timeout` (`DARAJA_STK_TIMEOUT`, 120 seconds), or the `timeout` prop. `laravel-echo` and `pusher-js` are dev dependencies of this package that are bundled into `resources/dist`, loaded only when a prompt is on the page, so an app installs nothing. See the Payment prompt page of the UI docs and the `nyumbani-payment-prompt` skill.
