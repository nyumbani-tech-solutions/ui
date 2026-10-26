<?php

namespace Nyumbani\Ui\Providers;

use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use LogicException;

class ViewServiceProvider extends ServiceProvider
{
    /**
     * Register the view composers, the package components and the error pages.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function boot(): void
    {
        //  Register the view composers
        $this->handleComposers();

        //  Register the package components
        $this->handleAnonymousComponents();

        //  Register the error pages
        $this->handleErrorPages();
    }

    /**
     * Offer the package error pages after the app's own, so an app's resources/views/errors file wins.
     * The framework looks errors up in each `view.paths` entry's errors folder.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function handleErrorPages(): void
    {
        //  Leave the framework error pages alone when switched off
        if (! config('ui.error_pages', true)) {
            return;
        }

        //  Add the package views as the last path, for the framework's error lookup only: the view finder is left alone, so the package's layouts and components never answer to plain names such as components.modal
        config(['view.paths' => [
            ...config('view.paths'),
            ui_path('resources/views')],
        ]);
    }

    /**
     * Send guests to login before the portal layout renders, since it needs the signed-in user.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function handleComposers(): void
    {
        View::composer('nyumbani::layouts.portal', function (ViewContract $view) {
            //  Send guests to login
            if (! auth()->check()) {
                //  Answer requests that expect json with a 401
                abort_if(request()->expectsJson(), 401);

                //  Redirect to login, remembering the page to come back to
                throw new HttpResponseException(redirect()->guest(route('login')));
            }

            //  Hand the sidebar view to the layout, which includes it
            $view->with('sidebarView', $this->sidebarView($view));
        });
    }

    /**
     * Get the view the sidebar section names, or null when the section holds the menu itself, and fail when there is no sidebar.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function sidebarView(ViewContract $view): ?string
    {
        //  Read what the page put in the sidebar section
        $content = trim($view->getFactory()->yieldContent('sidebar'));

        //  The portal cannot show a menu that was never defined
        throw_if($content === '', new LogicException("The portal layout needs a sidebar. Fill its 'sidebar' section, for example @section('sidebar', 'partials.sidebar') in your app layout."));

        //  A section with markup, spaces or braces is the menu itself
        if (preg_match('/^[\w.:\-]+$/', $content) !== 1) {
            return null;
        }

        //  A bare name is a view, so a typo should say so instead of printing the name
        throw_unless(View::exists($content), new LogicException("The sidebar view [{$content}] does not exist."));

        //  Return the view
        return $content;
    }

    /**
     * Register the package components as <x-nyumbani::name>, anonymous or class-based.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function handleAnonymousComponents(): void
    {
        Blade::anonymousComponentPath(ui_path('resources/views/components'), 'nyumbani');

        //  Register the components that need logic as classes
        Blade::componentNamespace('Nyumbani\\Ui\\Views\\Components', 'nyumbani');
    }
}
