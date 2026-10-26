<?php

namespace Nyumbani\Ui\Http\Controllers;

use Illuminate\Http\RedirectResponse;

class LocaleController
{
    /**
     * Keep the chosen language in the session and go back where the visitor was.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function __invoke(string $locale): RedirectResponse
    {
        //  Accept only the languages the app offers, so nothing else is written to the session
        abort_unless(array_key_exists($locale, config('ui.locales', [])), 404);

        //  Keep the choice
        session(['locale' => $locale]);

        //  Go back, to the home page when there is no previous one
        return redirect()->back(fallback: url('/'));
    }
}
