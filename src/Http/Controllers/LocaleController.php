<?php

namespace Nyumbani\Ui\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Nyumbani\Ui\Http\Middleware\SetLocale;

class LocaleController
{
    /**
     * Keep the chosen language in a cookie for a year and go back where the visitor was.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function __invoke(string $locale): RedirectResponse
    {
        //  Accept only the languages the app offers, so nothing else is written to the cookie
        abort_unless(array_key_exists($locale, config('ui.locales', [])), 404);

        //  Go back, to the home page when there is no previous one, keeping the choice in a cookie a logout does not clear
        return redirect()
            ->back(fallback: url('/'))
            ->withCookie(cookie(SetLocale::COOKIE, $locale, 60 * 24 * 365));
    }
}
