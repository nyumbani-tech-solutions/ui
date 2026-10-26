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
    | Error pages
    |--------------------------------------------------------------------------
    |
    | Set to false to leave the framework error pages alone.
    |
    */
    'error_pages' => true,
];
