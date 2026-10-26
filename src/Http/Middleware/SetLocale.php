<?php

namespace Nyumbani\Ui\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * The name of the cookie that keeps the visitor's language
     */
    public const COOKIE = 'nyumbani_locale';

    /**
     * Use the language the visitor picked, when it is one the app offers
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function handle(Request $request, Closure $next): Response
    {
        //  Get the language kept in the cookie, which outlives the session and so survives a logout
        $locale = $request->cookie(self::COOKIE);

        //  Apply it only when the app offers it, so a stale value never breaks a page
        if ($locale && array_key_exists($locale, config('ui.locales', []))) {
            app()->setLocale($locale);
        }

        //  Proceed with the request
        return $next($request);
    }
}
