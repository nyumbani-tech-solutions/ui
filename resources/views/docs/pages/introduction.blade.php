@extends('docs::layout')

@section('page', 'Introduction')
@section('lead', 'The Nyumbani look, as a package: layouts, sign-in and error pages, a modal, toasts and a theme, for apps built on Essentials.')

@section('content')
    <x-docs::section id="what" title="What the UI package is">
        <p><code>nyumbani/ui</code> holds everything an internal Nyumbani app shows on screen. <code>nyumbani/essentials</code> is headless: helpers, services, permissions and the auth backend. The UI package requires Essentials, never the reverse, so an app that needs no Nyumbani look can use Essentials alone.</p>
        <x-docs::table :columns="['Included', 'Details']" :rows="[
            ['Layouts', 'The portal, auth, error and base layouts, with the sidebar and navbar.'],
            ['Sign-in pages', 'Login, forgot password and reset password, bound to Essentials\' AuthViews contract.'],
            ['Components', 'The modal, the loader, the file input and the navigation links, all as x-nyumbani components.'],
            ['Scripts', 'Toasts, the shell, the double-submit guard, the file input and the modal, pre-bundled into one file.'],
            ['Theme', 'A Tailwind 4 theme with the buttons, forms and colours of every app.'],
            ['Error pages', 'The 401, 403, 404, 419, 429, 500 and 503 pages.'],
            ['Branding', 'Favicons, the web manifest and the images, with the theme colour and sign-in sentence in config/ui.php.'],
        ]" />
    </x-docs::section>

    <x-docs::section id="namespace" title="One namespace">
        <p>Views and components share the <code>nyumbani</code> namespace: <code>nyumbani::layouts.portal</code>, <code>nyumbani::auth.login</code> and <code>&lt;x-nyumbani::modal&gt;</code>.</p>
    </x-docs::section>

    <x-docs::section id="config" title="Configuration">
        <p>Publish it with the <code>ui-config</code> tag.</p>
        <x-docs::table :columns="['Key', 'Default', 'Effect']" :rows="[
            ['branding.description', 'null', 'The sentence under the app name on the sign-in page. Set with UI_DESCRIPTION.'],
            ['branding.theme_color', '#d97706', 'The browser address bar and installed app colour. Set with UI_THEME_COLOR.'],
            ['error_pages', 'true', 'The package error pages replace the framework ones. Set to false to leave them alone.'],
        ]" />
    </x-docs::section>
@endsection
