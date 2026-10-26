<?php

namespace Nyumbani\Ui\Console\Support;

use Illuminate\Support\Facades\File;
use Nyumbani\DtTables\DtTablesServiceProvider;

/**
 * What an app still has to do by hand after ui:install, found by looking and never by editing application code
 *
 * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
 */
class UiChecklist
{
    /**
     * The Vite aliases every Nyumbani app has, by alias, for the folder each one points at, relative to the app root.
     *
     * @var array<string, string>
     */
    public const APP_ALIASES = [
        '@node-modules' => 'node_modules',
        '@public' => 'public',
        '@resources' => 'resources',
        '@vendor' => 'vendor',
        '@storage' => 'storage',
        '@enums' => 'app/Enums',
        '@data-tables' => 'app/DataTables',
        '@config' => 'config',
    ];

    /**
     * The app files Tailwind must scan for classes, by path relative to resources/css/app.css, with the Vite alias form of each.
     *
     * @var array<string, string>
     */
    public const APP_SOURCES = [
        '../../app/Enums/*.php' => '@enums/*.php',
        '../../app/DataTables/**/*.php' => '@data-tables/**/*.php',
        '../../config/dt-tables.php' => '@config/dt-tables.php',
    ];

    /**
     * Tell whether the app uses the data tables package, whose files Tailwind must scan too.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public static function usesDataTables(): bool
    {
        return class_exists(DtTablesServiceProvider::class);
    }

    /**
     * Get the app files Tailwind must scan, leaving out the data table ones when the app does not use data tables.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public static function sourcesFor(bool $usesDataTables): array
    {
        return $usesDataTables
            ? self::APP_SOURCES
            : array_filter(self::APP_SOURCES, fn (string $alias) => ! str_starts_with($alias, '@data-tables') && ! str_contains($alias, 'dt-tables'));
    }

    /**
     * Get every check as a list of label, state (pass, fail or optional) and how to fix it.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function items(): array
    {
        return [
            $this->item('Theme imported in resources/css/app.css', $this->fileHas(resource_path('css/app.css'), 'nyumbani/ui/resources/css/theme.css'), "Add @import '../../vendor/nyumbani/ui/resources/css/theme.css'; after the Tailwind import."),
            $this->item('Enums, data tables and their config scanned in resources/css/app.css', collect(self::sourcesFor(self::usesDataTables()))->every(fn (string $alias, string $relative) => $this->fileHas(resource_path('css/app.css'), "@source '{$relative}'") || $this->fileHas(resource_path('css/app.css'), "@source '{$alias}'")), 'Add @source lines for app/Enums, app/DataTables and config/dt-tables.php to resources/css/app.css.'),
            $this->item('Vite aliases in vite.config.js', collect(array_keys(self::APP_ALIASES))->every(fn (string $alias) => $this->fileHas(base_path('vite.config.js'), "'{$alias}'")), 'Add the '.implode(', ', array_keys(self::APP_ALIASES)).' aliases to resolve.alias in vite.config.js.'),
            $this->item('UI scripts imported in resources/js/app.js', $this->fileHas(resource_path('js/app.js'), 'nyumbani/ui/resources/dist/ui.js'), "Add import '../../vendor/nyumbani/ui/resources/dist/ui.js'; before Livewire starts."),
            $this->item('Formatting helpers imported in resources/js/app.js', $this->fileHas(resource_path('js/app.js'), 'nyumbani/essentials/resources/dist/helpers.js'), "Add import '../../vendor/nyumbani/essentials/resources/dist/helpers.js'; before Livewire starts."),
            $this->item('Livewire started in resources/js/app.js', $this->fileHas(resource_path('js/app.js'), 'Livewire.start('), "Add import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm'; and Livewire.start(); to resources/js/app.js."),
            $this->item('Basic portal (dashboard, layout and sidebar)', $this->hasPortal(), 'Run php artisan ui:install --portal.', optional: true),
        ];
    }

    /**
     * Determine whether the basic portal's layout, dashboard view and sidebar are all in the app.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function hasPortal(): bool
    {
        return File::exists(resource_path('views/admins/pages/dashboard.blade.php'))
            && File::exists(resource_path('views/layouts/app.blade.php'))
            && File::exists(resource_path('views/admins/partials/sidebar.blade.php'));
    }

    /**
     * Build one check.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function item(string $label, bool $passes, string $fix, bool $optional = false): array
    {
        return ['label' => $label, 'state' => $passes ? 'pass' : ($optional ? 'optional' : 'fail'), 'fix' => $fix];
    }

    /**
     * Determine whether a file exists and mentions the text.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function fileHas(string $path, string $text): bool
    {
        return File::exists($path) && str_contains(File::get($path), $text);
    }
}
