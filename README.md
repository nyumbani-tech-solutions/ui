# nyumbani/ui

The Nyumbani look, as a package: the portal, auth and error layouts, the sign-in pages, the modal, period picker, loader, file input and navigation components, toasts, the error pages, favicons and the Tailwind theme. It requires [`nyumbani/essentials`](../essentials), which stays headless and works without it.

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

## Configuration

Publish `config/ui.php` with `php artisan vendor:publish --tag=ui-config`.

| Key | Environment | Purpose |
| --- | --- | --- |
| `branding.description` | `UI_DESCRIPTION` | The sentence under the app name on the sign-in page |
| `branding.theme_color` | `UI_THEME_COLOR` | The browser address bar and installed app colour (`#d97706`) |
| `locales` | | The languages offered as `code => label`. With more than one, the UI shows a language switch and applies the visitor's choice. Default: English only |
| `js_translations` | | English texts your scripts read through `window.__('text')`, translated on the server |
| `error_pages` | | Set to `false` to leave the framework error pages alone |

## Changing the scripts

The scripts in `resources/js` are bundled with toastr, jQuery and Alpine UI into `resources/dist`, so an app installs none of them. After changing one, run `npm run build` in this folder and commit `resources/dist`.

## Docs

The full docs are served at `/nyumbani-ui/docs`, in the `local` environment only, by `nyumbani/docs` (`composer require --dev nyumbani/docs`). The package works without it.

## Period picker

`<x-nyumbani::period-picker type="month-range" />` is the one date filter for reports and lists: a day, month or year, or a range of them, written as the `period` string that `$request->period()` reads. Single days and months open a calendar beside the field; ranges open a modal with presets and a From and a To calendar. The calendars are [Vanilla Calendar Pro](https://vanilla-calendar.pro) (MIT), a dev dependency of this package that is bundled into `resources/dist/ui.js` and `ui.css`, so an app installs nothing. It adds about 20 kB of script and 7 kB of styles, gzipped, to the bundle every app loads. See the Period picker page of the UI docs and the `nyumbani-period-picker` skill.
