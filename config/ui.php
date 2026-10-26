<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Branding
    |--------------------------------------------------------------------------
    |
    | The sentence shown under the app name on the sign-in page, and the colour
    | browsers use for the address bar and the installed app.
    |
    */
    'branding' => [
        'description' => env('UI_DESCRIPTION'),
        'theme_color' => env('UI_THEME_COLOR', '#d97706'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Languages
    |--------------------------------------------------------------------------
    |
    | The languages the app offers, as code => label. With more than one the UI
    | shows a language switch on the sign-in pages and in the navbar, and keeps
    | the choice in a cookie, which survives a logout. The package text is English; an app translates
    | it in its own lang/{code}.json, keyed by the English text.
    |
    */
    'locales' => [
        'en' => 'EN',
    ],

    /*
    |--------------------------------------------------------------------------
    | Translations for JavaScript
    |--------------------------------------------------------------------------
    |
    | English texts the app's own scripts read through window.__('text'). Each
    | is translated on the server and written into the page.
    |
    */
    'js_translations' => [],

    /*
    |--------------------------------------------------------------------------
    | Error pages
    |--------------------------------------------------------------------------
    |
    | Set to false to leave the framework error pages alone.
    |
    */
    'error_pages' => true,
];
