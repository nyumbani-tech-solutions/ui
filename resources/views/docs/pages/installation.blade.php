@extends('docs::layout')

@section('page', 'Installation')
@section('lead', 'Add the package, import the theme and the scripts, and start Livewire.')

@section('content')
    <x-docs::section id="require" title="1. Add the package">
        <p>The UI package requires Essentials and Livewire 4, so Composer brings both.</p>
        <x-docs::code lang="bash" title="Terminal">
            composer require nyumbani/ui
        </x-docs::code>
    </x-docs::section>

    <x-docs::section id="theme" title="2. Import the theme">
        <p>Import the theme once in the app's css, in place of <code>@@import 'tailwindcss'</code>: it brings Tailwind and the forms plugin.</p>
        <x-docs::code lang="css" title="resources/css/app.css">
            @import '../../vendor/nyumbani/ui/resources/css/theme.css';
        </x-docs::code>
    </x-docs::section>

    <x-docs::section id="scripts" title="3. Import the scripts">
        <p>Import the UI bundle and the Essentials helpers once, then start Livewire in the same file: it starts the Alpine the modal and the shell run on.</p>
        <x-docs::code lang="js" title="resources/js/app.js">
            import '../../vendor/nyumbani/ui/resources/dist/ui.js';
            import '../../vendor/nyumbani/essentials/resources/dist/helpers.js';
            import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm';

            //  Start Livewire, which starts the Alpine it bundles
            Livewire.start();
        </x-docs::code>
        <p>Run <code>npm run build</code> afterwards.</p>
    </x-docs::section>

    <x-docs::section id="layout" title="4. Use a layout">
        <p>Extend the portal layout and name the view that holds your menu.</p>
        <x-docs::code lang="blade" title="resources/views/layouts/app.blade.php">
            @@extends('nyumbani::layouts.portal')

            @@section('sidebar', 'partials.sidebar')
        </x-docs::code>
        <p>Publish a starter portal (a dashboard, a layout and a sidebar) with <code>php artisan vendor:publish --tag=ui-portal</code>.</p>
    </x-docs::section>

    <x-docs::section id="checklist" title="The checklist">
        <p><code>ui:install</code> ends with a checklist of what it found. A done item stays quiet, a <strong>✗</strong> item is needed for the UI to work, and the <strong>○</strong> portal item is optional. Under each open item is its fix.</p>
        <x-docs::code lang="text" title="UI checklist">
            UI checklist

              ✓ Theme imported in resources/css/app.css
              ✓ Enums, data tables and their config scanned in resources/css/app.css
              ✓ Vite aliases in vite.config.js
              ✓ UI scripts imported in resources/js/app.js
              ✓ Formatting helpers imported in resources/js/app.js
              ✗ Livewire started in resources/js/app.js
                → Add import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm'; and Livewire.start(); to resources/js/app.js.
              ○ Basic portal (dashboard, layout and sidebar)
                → Run php artisan ui:install --portal.
        </x-docs::code>
        <x-docs::table :columns="['Item', 'To fix it']" :rows="[
            ['Theme imported', 'Add the theme import after, or in place of, the Tailwind import in resources/css/app.css (step 2).'],
            ['Enums, data tables and their config scanned', 'Add the @source lines the installer names to resources/css/app.css, so Tailwind finds classes written in app/Enums, app/DataTables and config/dt-tables.php. The data table lines appear only when the data tables package is installed.'],
            ['Vite aliases', 'Add the @node-modules, @public, @resources, @vendor, @storage, @enums, @data-tables and @config aliases to resolve.alias in vite.config.js.'],
            ['UI scripts imported', 'Add the ui.js import to resources/js/app.js, before Livewire starts (step 3).'],
            ['Formatting helpers imported', 'Add the Essentials helpers.js import to resources/js/app.js, before Livewire starts.'],
            ['Livewire started', 'Import Livewire and call Livewire.start() in resources/js/app.js. Without it Alpine never starts and the modals do nothing.'],
            ['Basic portal (optional)', 'Run php artisan ui:install --portal, then add the dashboard route.'],
        ]" />
        <p>Fix an item and run <code>php artisan ui:install</code> again to see it turn to done.</p>
    </x-docs::section>

    <x-docs::section id="installer" title="Or run the installer">
        <p>The steps above are what the UI installer does for you, and it is safe to run again. <code>php artisan nyumbani:install</code> runs it when you pick UI, or run it on its own:</p>
        <x-docs::code lang="bash" title="Terminal">
            php artisan ui:install
        </x-docs::code>
        <x-docs::table :columns="['Step', 'What it does', 'On a rerun']" :rows="[
            ['Vite aliases', 'Adds @node-modules, @public, @resources, @vendor, @storage, @enums, @data-tables and @config to resolve.alias in vite.config.js, and keeps the file only if Node accepts it.', 'Adds only the aliases that are missing. Leaves a config with its own resolve setting, or with no defineConfig, as it is and tells you what to add.'],
            ['Imports', 'Imports the theme in resources/css/app.css, with the @source lines for enums, data tables and their config; imports ui.js and the Essentials helpers.js in resources/js/app.js, and starts Livewire there. Uses the aliases when vite.config.js has them, and the relative paths when it does not.', 'Adds a line only if it is not there, does not start Livewire twice, and moves an earlier relative path to its alias.'],
            ['Data tables', 'Sets an untouched config/dt-tables.php to the Tailwind theme, with btn btn-sm btn-primary buttons and the rounded-lg border px-3 py-1.5 text-sm class on inputs and selects.', 'Never touches a dt-tables.php you changed.'],
            ['Basic portal (optional)', 'Asks Set up a basic portal? and, on yes (or with --portal), publishes the dashboard, the sidebar and the layout (tag ui-portal).', 'Never overwrites a view the app already has.'],
            ['Build assets', 'Runs npm run build when the app has a package.json and node_modules. A failed build is reported and does not stop the install.', 'Runs every time. Without node_modules it says to run npm install first.'],
        ]" />
        <p>It finishes with the checklist above.</p>
    </x-docs::section>

    <x-docs::section id="portal" title="The basic portal (optional)">
        <p>The portal gives a new app a working signed-in shell in a minute: a layout, a sidebar and a dashboard page, all on the shared portal layout. Do it once, in this order.</p>

        <h3>1. Publish the views</h3>
        <x-docs::code lang="bash" title="Terminal">
            php artisan ui:install --portal
        </x-docs::code>
        <p>It publishes these files, each only when the app does not have it yet:</p>
        <x-docs::table :columns="['File', 'What it is']" :rows="[
            ['resources/views/layouts/app.blade.php', 'Your one app layout. It extends the portal layout and points its sidebar at the sidebar below.'],
            ['resources/views/admins/partials/sidebar.blade.php', 'The menu: a Dashboard link and, locally, a Docs group linking the docs of the packages. Add your own links here.'],
            ['resources/views/admins/pages/dashboard.blade.php', 'A welcome page with quick links to those docs.'],
        ]" />
        <p>To take the newest version of a view, delete that one file and run the installer again, or publish over your copies with <code>php artisan vendor:publish --tag=ui-portal --force</code>.</p>

        <h3>2. Add the dashboard route</h3>
        <p>The installer edits no routes. Add this to <code>routes/web.php</code>, inside the <code>auth</code> middleware, because the portal layout sends a guest to sign in. The route can have any name, as long as the user model returns its URL from <code>homeRoute()</code>.</p>
        <x-docs::code title="routes/web.php">
            use Illuminate\Support\Facades\Route;

            Route::middleware('auth')->group(function () {
                Route::view('dashboard', 'admins.pages.dashboard')->name('dashboard');
            });
        </x-docs::code>

        <h3>3. Build and sign in</h3>
        <p>Run <code>npm run build</code> if the installer did not, then open <code>/login</code>, sign in, and you land on <code>/dashboard</code>. The user model must implement <code>HasHomeRoute</code>, as the Essentials installation shows.</p>

        <h3>If something goes wrong</h3>
        <x-docs::table :columns="['What you see', 'Why', 'What to do']" :rows="[
            ['View [admins.pages.dashboard] not found', 'The portal views were not published.', 'Run php artisan ui:install --portal.'],
            ['Route [dashboard] not defined', 'The route from step 2 is missing, or homeRoute() names a route that does not exist.', 'Add the route, or return the URL of your own route from homeRoute().'],
            ['A LogicException about the sidebar', 'Your layout extends the portal layout but names no sidebar view, or names one that does not exist.', 'Set the layout sidebar section to admins.partials.sidebar, or to your own partial.'],
            ['The pages have no styling or the toasts do not appear', 'The theme or the scripts are not compiled.', 'Run npm install, then npm run build. The UI checklist says if the theme or script import is missing.'],
            ['Modals and tabs do nothing', 'Livewire was not started in resources/js/app.js.', 'Add Livewire.start() as step 3 shows, or run php artisan ui:install.'],
        ]" />
    </x-docs::section>
@endsection
