---
name: nyumbani-languages
description: "Invoke when a Nyumbani app serves more than one language: the language switch, ui.locales, translating the package text or the app's own views, lang/{code}.json, texts used in JavaScript (window.__, js_translations), or a page that stays in English. Skip for validation messages, which are Laravel's own lang files."
metadata:
  author: nyumbani
---

# Nyumbani Languages

The package text is English. Everything the UI shows goes through `__()` with the English text as the key, so an app translates it in its own `lang/{code}.json`. The package ships no language files and never needs one for English.

## Offer more languages
List them in `config/ui.php`, as `code => label`:
```php
'locales' => ['en' => 'EN', 'zh' => '中文'],
```
With more than one, the UI shows a switch on the sign-in pages and in the navbar, keeps the choice in the session (`GET nyumbani/locale/{locale}`, route `nyumbani.locale`, open to guests, 404 for an unlisted code) and applies it on every web request with its `SetLocale` middleware. With one, nothing is shown and nothing runs. The app has no locale route, middleware or switcher of its own; delete any it has. `config('app.locale')` stays the default language.

## Translate
- Package text: add the English text as the key in `lang/{code}.json`, for example `"Sign In": "登录"`. A text with no entry shows in English.
- The app's own views: `{{ __('Text') }}` with the English text as the key, in the same `lang/{code}.json`.
- Texts with a value use placeholders: `__('Enter your :field', ['field' => 'email'])`.

## JavaScript
Scripts call `window.__('text', { name: value })`, which mirrors `__()`. The server writes the translated texts into `window.__lang`, so every English text a script needs must be listed in `ui.js_translations`; an unlisted text shows as written. Do not write an app's own `window.__`.

## Rules
- Never hard-code text in a package or app view without `__()` when the app offers more than one language.
- Do not rename an English text without updating the keys in every `lang/{code}.json`.
- A change here belongs to the UI package: `SetLocale`, `LocaleController`, the `locale-switcher` partial, `config/ui.php`, its docs page `languages`, `UiTest.php`.
