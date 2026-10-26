---
name: nyumbani-ui-install
description: "Invoke when installing or repairing the Nyumbani UI in an app: composer require nyumbani/ui, php artisan ui:install, its checklist, the theme and script imports in app.css and app.js, the Vite aliases, Livewire starting, the basic portal (--portal, ui-portal), or an app that looks unstyled. Skip for using a component once it is installed."
metadata:
  author: nyumbani
---

# Nyumbani UI Install

`nyumbani/ui` requires `nyumbani/essentials` and Livewire 4, and needs Tailwind CSS 4 and Vite. Install it with `php artisan nyumbani:install --with=ui` (which runs everything below), or by hand:

1. `composer require nyumbani/ui`.
2. `php artisan ui:install`. It is safe to run again.
3. `npm install && npm run build` (the installer builds when `node_modules` exists).

## What `ui:install` does
| Step | Result | On a rerun |
| --- | --- | --- |
| Vite aliases | `@node-modules`, `@public`, `@resources`, `@vendor`, `@storage`, `@enums`, `@data-tables` and `@config` in `resolve.alias`, kept only if Node accepts the file. | Adds only the missing ones; leaves a config with its own `resolve` or no `defineConfig` alone and says what to add. |
| Imports | The theme in `resources/css/app.css` in place of the Tailwind import, plus `@source` lines for `app/Enums`, `app/DataTables` and `config/dt-tables.php`; `ui.js` and the Essentials `helpers.js` in `resources/js/app.js`, and `Livewire.start()` there. Written with the `@vendor` alias when the Vite config has it. | Adds only what is missing; never starts Livewire twice. |
| Data tables | An untouched `config/dt-tables.php` gets the `tailwind` theme and the Nyumbani classes. | Never touches a file you changed. |
| Basic portal (optional) | `--portal`, or yes to the question, publishes the `ui-portal` tag: `layouts/app.blade.php`, `admins/partials/sidebar.blade.php`, `admins/pages/dashboard.blade.php`. | Never overwrites a view the app has. |
| Build | `npm run build` when `node_modules` exists. | Every time. |

By hand, the three lines are:
```css
/* resources/css/app.css */
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

## The portal needs a route
The installer edits no routes. Add this inside the `auth` group, with any route name, and return its URL from `homeRoute()` on the user model:
```php
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::view('dashboard', 'admins.pages.dashboard')->name('dashboard');
});
```

## The checklist
`ui:install` ends with: theme imported, sources scanned, Vite aliases, UI scripts imported, formatting helpers imported, Livewire started, and the optional portal. Each failed item names the fix.

## Configuration
Publish with `php artisan vendor:publish --tag=ui-config`: `branding.description` (`UI_DESCRIPTION`), `branding.theme_color` (`UI_THEME_COLOR`, default `#d97706`) and `error_pages`. After changing a script in the package, run `npm run build` in `packages/ui` and commit `resources/dist`.

## When it looks wrong
| You see | Because | Do |
| --- | --- | --- |
| Unstyled pages | The theme import is missing, or `npm run build` has not run. | `ui:install`, then build. |
| Unstyled toasts, a shell that does not open | The scripts are not imported. | Add the two imports before Livewire starts. |
| Modals and tabs do nothing | Livewire was not started in `app.js`. | Add `Livewire.start()`. |
| `/login` answers 404 | `nyumbani/ui` is not installed, so Fortify has no views. | Require it, or bind your own `AuthViews` (see nyumbani-auth). |
| `View [admins.pages.dashboard] not found` | The portal was not published. | `php artisan ui:install --portal`. |
| A LogicException about the sidebar | The layout extends the portal layout without a `sidebar` section, or names a view that does not exist. | Fill the section: `@section('sidebar', 'partials.sidebar')`. |
