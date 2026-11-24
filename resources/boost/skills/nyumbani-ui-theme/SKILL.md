---
name: nyumbani-ui-theme
description: "Invoke when styling buttons, showing toast alerts, adding a loading state or spinner, or building forms, file inputs and navigation in a Nyumbani app. Covers btn classes, back()->alert(), <x-nyumbani::loader>, file-input and nav components."
metadata:
  author: nyumbani
---

# Nyumbani UI Theme

## Buttons
Every button is primary. Use `btn btn-primary`, with `btn-sm` or `btn-lg` for size. There is no danger or outline variant, and `btn-secondary` renders the same as primary. Never choose a color per button. A destructive action is still a primary button guarded by native `confirm()`.

## Toasts
Flash with the `alert` macro and let the layout show it:
```php
return back()->alert('success', trans('alerts.customers.saved', ['name' => $customer->name]));
```
Every toast type (success, error, info, warning) renders in the one success color. The type still sets the icon and screen-reader meaning, so pass the honest type: `success` when it did what was asked, `error` when it failed and nothing changed, `warning` when it worked but needs another look, `info` for something to know. Put the text in `lang/alerts.php` as full sentences with `:placeholder` values. `redirect()->alert(...)` with no route goes back, like `back()->alert(...)`, and a Laravel `status` flash also shows as a success toast. From JavaScript, call `toastr.success('...')`.

## Loader
```blade
<x-nyumbani::loader />
<x-nyumbani::loader size="md" message="Nyumbani is loading this for you..." />
<x-nyumbani::loader message="" />
```
Props: `message` (default `loader_message` in `config/ui.php`, else "Nyumbani is processing your data...") and `size` (`sm`, `md`, `lg`). Pass `message=""` to hide the text, because `null` falls back to the default. It is the animated Nyumbani mark, served from the package, unless `loader` in `config/ui.php` (`UI_LOADER`) names the app's own image, a path under `public/` or a full URL. Use it for any wait the user can see, and do not invent another spinner.

## Colours
The theme has six colour tokens and a font: `--color-primary`, `-dark`, `-darker`, `--color-secondary`, `-dark`, `-light` and `--font-sans`. The components, toasts and calendars read nothing else, so never hard-code `#d97706` or `#1f2937`. The Nyumbani values are the defaults in `base.css`, and `theme.css` adds the Nyumbani web fonts. A project that is not a Nyumbani app imports `base.css` and redefines only the tokens it wants to change.

## Corners
Three tokens set every corner, and their defaults are the Nyumbani look: `--radius-field` (form fields, `.btn`, the period picker's calendar icon; `0.25rem`), `--radius-panel` (the modal on a large screen, the calendar popover, the period presets, the file preview, the modal's close button and the toasts; `0.25rem`) and `--radius-sheet` (the modal's top corners as a bottom sheet on a phone; `0.75rem`). A project that is not a Nyumbani app sets what it wants once in its own `@theme`, after the base import (`--radius-field: var(--radius-xl);`), and never overrides `rounded-*` on those elements. Use `rounded-field`, `rounded-panel` or `rounded-t-sheet` on a new component. Pills and circles (`rounded-full`) stay round.

## Components
- `<x-nyumbani::modal>`: see the nyumbani-modal skill.
- `<x-nyumbani::period-picker>`: the date, month, year and range filter for reports and lists; see the nyumbani-period-picker skill.
- Form controls are 16px on phones and 14px from `sm` up, and the layout's viewport is `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`, so pages do not zoom on focus or on a pinch. Never add `text-sm` or `text-xs` to an input, select or textarea, and keep that viewport meta when you write your own base layout.
- `<x-nyumbani::file-input name="..." label="..." accept="..." :current="$upload" />`, where `$upload` is the saved Upload model (it supplies `url`, `title`, `formattedSize` and `isImage()`); a stored image's thumbnail opens in the Fancybox lightbox. The form needs `enctype="multipart/form-data"`.
- `<x-nyumbani::password-input name="password" label="Password" />` is the only password field: it has an eye button that shows or hides the text. Props: `name` (default `password`, also the id), `label`, `placeholder` (default "Enter your password"; pass the rule, such as "At least 8 characters", on a new-password field), `autocomplete` (default `current-password`; use `new-password` when setting one) `:required` and `icon` (a lock inside the left edge). The sign-in and reset-password pages use it. It marks itself invalid and prints the first error for its name, and passes any other attribute (`id`, `minlength`, `wire:model`) to the input. Never hand-write a password input or your own toggle.
- `<x-nyumbani::nav-group>` and `<x-nyumbani::nav-link>` build the sidebar. Implement the `HasHomeRoute` contract for the home link.
- Every top-level `nav-link` and `nav-group` needs an icon: put the `<path>` elements of a 24x24 outline Heroicon (Outline set, Copy SVG, paths only, never the `<svg>`) in the link's slot, or in `<x-slot:icon>` of a group. Links inside a group use `sub` and take no icon. The component draws the svg with stroke width 2.

## Rules
- Components that need logic are classes in `Nyumbani\Ui\Views\Components`, registered under the `nyumbani` namespace. Simple ones are anonymous Blade components.
- No multi-line `@php` in views (a one-line `@php(...)` is fine). Prepare data in a controller or component class.
- Use `@use` for every class a view references.
- After adding Tailwind classes in a package view, run `npm run build` in the app.

## Placeholders
Every form input has a `placeholder`, never just the label: a prompt (`Enter your name here`), an example (`e.g. Jane Wanjiru`) or the rule (`At least 8 characters`). A `<select>` gets an empty first option as its placeholder. Checkbox, radio, file, hidden, date, time and colour inputs are exempt. Translate placeholders and never write a currency in one.

## Number inputs
Number inputs show no up and down helpers, ignore the wheel and the arrow keys, and refuse `e`, `E` and `+`, through the theme and the `number-input` script. Add `data-allow-spin` to an input that should keep the steppers.
