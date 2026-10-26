@extends('docs::layout')

@section('page', 'Languages')
@section('lead', 'The package text is English. An app that serves more languages lists them, gets a language switch, and translates the text in its own language files.')

@section('content')
    <x-docs::section id="enable" title="Offer more languages">
        <p>List the languages in <code>config/ui.php</code> as <code>code => label</code>. With more than one, the UI shows a switch on the sign-in pages and in the navbar, keeps the visitor's choice in the session and applies it on every web request. With one (the default), nothing is shown and nothing runs.</p>
        <x-docs::code lang="php" title="config/ui.php">
            'locales' => [
                'en' => 'EN',
                'zh' => '中文',
            ],
        </x-docs::code>
        <p>The switch is <code>GET nyumbani/locale/{locale}</code> (route <code>nyumbani.locale</code>). It is open to guests, so the sign-in page can offer it, and it answers 404 for a language that is not listed.</p>
    </x-docs::section>

    <x-docs::section id="translate" title="Translate the package text">
        <p>Every text in the package views, such as <em>Sign In</em>, <em>Page not found</em> or <em>Take me home</em>, goes through <code>__()</code> with the English text as the key. The package ships no language files: the app adds the translations to its own <code>lang/{code}.json</code>, and a text with no translation shows in English.</p>
        <x-docs::code lang="json" title="lang/zh.json">
            {
                "Sign In": "登录",
                "Page not found": "页面未找到"
            }
        </x-docs::code>
        <p>Your own views translate the same way, with <code>@{{ __('Text') }}</code>.</p>
    </x-docs::section>

    <x-docs::section id="scripts" title="Translate text in JavaScript">
        <p>Scripts call <code>window.__('text', { name: value })</code>, which works like <code>__()</code>. The server writes the translated texts into the page, so list every English text a script needs in <code>js_translations</code>; a text that is not listed shows as written.</p>
        <x-docs::code lang="php" title="config/ui.php">
            'js_translations' => [
                'Not specified',
                'Please select files smaller than :limitMB',
            ],
        </x-docs::code>
    </x-docs::section>
@endsection
