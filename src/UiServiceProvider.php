<?php

namespace Nyumbani\Ui;

use Illuminate\Support\ServiceProvider;
use Nyumbani\Docs\DocsRegistry;
use Nyumbani\Essentials\Contracts\AuthViews;
use Nyumbani\Ui\Console\Commands\InstallCommand;
use Nyumbani\Ui\Docs\UiDocs;
use Nyumbani\Ui\Providers\ViewServiceProvider;
use Nyumbani\Ui\Views\NyumbaniAuthViews;

class UiServiceProvider extends ServiceProvider
{
    /**
     * Register the configuration, the sign-in pages and the view provider.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function register(): void
    {
        //  Load the configuration file
        $this->mergeConfigFrom(ui_path('config/ui.php'), 'ui');

        //  Give Fortify the Nyumbani sign-in pages
        $this->app->singleton(AuthViews::class, NyumbaniAuthViews::class);

        //  Register the components, the portal guard and the error pages
        $this->app->register(ViewServiceProvider::class);
    }

    /**
     * Load the views, the routes and what an app can publish.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function boot(): void
    {
        //  Load the views
        $this->loadViewsFrom(ui_path('resources/views'), 'nyumbani');

        //  Add the docs of the UI package, when the docs package is installed
        if (class_exists(DocsRegistry::class)) {
            $this->app
                ->make(DocsRegistry::class)
                ->register(UiDocs::describe());
        }

        //  Load the routes
        $this->loadRoutesFrom(ui_path('routes/web.php'));

        //  Publish the configuration file
        $this->publishes([
            ui_path('config/ui.php') => config_path('ui.php'),
        ], 'ui-config');

        //  Publish the basic portal: a dashboard view, its layout and sidebar
        $this->publishes([
            ui_path('resources/stubs/portal/views/admins/pages/dashboard.blade.php') => resource_path('views/admins/pages/dashboard.blade.php'),
            ui_path('resources/stubs/portal/views/layouts/app.blade.php') => resource_path('views/layouts/app.blade.php'),
            ui_path('resources/stubs/portal/views/admins/partials/sidebar.blade.php') => resource_path('views/admins/partials/sidebar.blade.php'),
        ], 'ui-portal');

        //  Register the Artisan commands
        if ($this->app->runningInConsole()) {
            $this->commands([InstallCommand::class]);
        }
    }
}
