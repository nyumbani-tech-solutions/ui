<?php

namespace Nyumbani\Ui\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Nyumbani\DtTables\DtTablesServiceProvider;
use Nyumbani\Essentials\Console\Support\InstallChecklist;
use Nyumbani\Ui\Console\Support\UiChecklist;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\error;
use function Laravel\Prompts\note;
use function Laravel\Prompts\spin;

class InstallCommand extends Command
{
    /**
     * The classes the Tailwind data tables theme gives its buttons, inputs and selects.
     *
     * @var array<string, string>
     */
    protected const TAILWIND_DATA_TABLE_CLASSES = [
        'buttons' => 'btn btn-sm btn-primary',
        'input' => 'rounded-lg border px-3 py-1.5 text-sm',
        'select' => 'rounded-lg border px-3 py-1.5 text-sm',
    ];

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ui:install
        {--portal : Set up the basic portal without asking}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up the Nyumbani UI in this app: the Vite aliases, the theme and script imports, the data tables look and the optional basic portal. Safe to run again';

    /**
     * Execute the console command.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function handle(): int
    {
        //  Greet the developer
        $this->banner('Nyumbani UI install');

        //  Add the Vite aliases every Nyumbani app shares
        $this->addViteAliases();

        //  Add the theme and the script imports
        $this->addImports();

        //  Give the data tables the Nyumbani look, when the app has them
        $this->useTailwindDataTables();

        //  Set up the basic portal, when the developer wants it
        $this->setUpPortal();

        //  Build the assets, so the theme, scripts and any new views are compiled
        $this->buildAssets();

        //  Say what is still left to do by hand
        $this->showChecklist();

        //  Success
        return self::SUCCESS;
    }

    /**
     * Add the shared Vite aliases to vite.config.js, each only when it is missing, and keep the file only if Node accepts it.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function addViteAliases(): void
    {
        //  Find the config
        $path = base_path('vite.config.js');

        //  Nothing to add to without one
        if (! File::exists($path)) {
            return;
        }

        //  Keep the aliases the config does not have yet
        $original = File::get($path);
        $missing = collect(UiChecklist::APP_ALIASES)
            ->reject(fn (string $folder, string $alias) => str_contains($original, "'{$alias}'") || str_contains($original, "\"{$alias}\""));

        //  Leave the config alone when it has them all
        if ($missing->isEmpty()) {
            return;
        }

        //  Write each one the way the config already writes its paths
        $usesPath = str_contains($original, 'path.resolve(dirname');
        $lines = $missing
            ->map(fn (string $folder, string $alias) => $usesPath ? "'{$alias}': path.resolve(dirname, '{$folder}')," : "'{$alias}': fileURLToPath(new URL('./{$folder}', import.meta.url)),")
            ->values()
            ->all();

        //  Add them, or say why this config has to be edited by hand
        $updated = $this->withAliases($original, $lines, ! $usesPath);

        if ($updated === null || ! $this->isValidJavaScript($updated)) {
            note('vite.config.js was left as it is. Add the '.implode(', ', $missing->keys()->all()).' aliases to resolve.alias by hand.');

            return;
        }

        //  Keep the edited config
        File::put($path, $updated);

        //  Say what was added
        $this->done('Added the '.implode(', ', $missing->keys()->all()).' aliases to vite.config.js.');
    }

    /**
     * Put alias lines into a Vite config: inside the alias object it has, or in a new resolve setting at the top of defineConfig, and null when the config has neither a place for them nor room for one.
     *
     * @param  array<int, string>  $lines
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function withAliases(string $config, array $lines, bool $needsUrlImport): ?string
    {
        //  Indent the lines to sit in an alias object
        $indented = collect($lines)->map(fn (string $line) => '            '.$line)->implode("\n");

        //  Add to the alias object the config already has
        if (preg_match('/alias:\s*\{/', $config)) {
            $updated = preg_replace('/(alias:\s*\{)/', "$1\n{$indented}", $config, 1);
        } elseif (str_contains($config, 'resolve') || ! preg_match('/defineConfig\(\s*\{/', $config)) {
            //  A resolve setting of its own, or nothing to add to: leave it for the developer
            return null;
        } else {
            //  Start the config with a resolve setting
            $updated = preg_replace('/(defineConfig\(\s*\{)/', "$1\n    resolve: {\n        alias: {\n{$indented}\n        },\n    },", $config, 1);
        }

        //  The url helper the lines use must be imported
        if ($needsUrlImport && ! str_contains($updated, 'fileURLToPath }')) {
            $updated = "import { fileURLToPath } from 'node:url';\n".$updated;
        }

        return $updated;
    }

    /**
     * Tell whether Node accepts the code as a module, which is false when Node is not installed.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function isValidJavaScript(string $code): bool
    {
        //  Write the code where Node can read it as a module
        $file = sys_get_temp_dir().'/nyumbani-'.uniqid().'.mjs';
        File::put($file, $code);

        //  Ask Node to parse it without running it
        $valid = rescue(fn () => Process::run(['node', '--check', $file])->successful(), false, false);

        //  Clean up
        File::delete($file);

        return $valid;
    }

    /**
     * Tell whether vite.config.js defines an alias.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function hasViteAlias(string $alias): bool
    {
        return File::exists(base_path('vite.config.js')) && str_contains(File::get(base_path('vite.config.js')), "'{$alias}'");
    }

    /**
     * Import the theme and the scripts in the app's css and js, when they are not imported yet.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function addImports(): void
    {
        //  Find the stylesheet
        $css = resource_path('css/app.css');

        //  Import by the @vendor alias when the Vite config has it, and by the relative path when it does not
        $vendor = $this->hasViteAlias('@vendor') ? '@vendor' : '../../vendor';

        //  Import the theme, which brings Tailwind and its forms plugin with it
        if (File::exists($css)) {
            $this->importTheme($css, $vendor);
        }

        //  Tell Tailwind to scan the app's enums, data tables and their config, where classes are written in PHP
        $this->addSources($css);

        //  Find the script
        $js = resource_path('js/app.js');

        //  The scripts go first, so they load before Livewire starts: the UI scripts, then the formatting helpers of Essentials, each unless it is already imported
        if (File::exists($js)) {
            $imports = collect([
                'nyumbani/ui/resources/dist/ui.js' => "import '{$vendor}/nyumbani/ui/resources/dist/ui.js';\n",
                'nyumbani/essentials/resources/dist/helpers.js' => "import '{$vendor}/nyumbani/essentials/resources/dist/helpers.js';\n",
            ])->reject(fn (string $line, string $path) => str_contains(File::get($js), $path));

            //  Add the missing ones together, in that order
            if ($imports->isNotEmpty()) {
                File::prepend($js, $imports->implode(''));

                //  Say what was imported
                $this->done('Imported the scripts in resources/js/app.js.');
            }
        }

        //  Livewire starts the Alpine every Nyumbani script needs, so the script must start it unless it already does
        if (File::exists($js) && ! str_contains(File::get($js), 'Livewire.start(')) {
            //  Add the import and the start after the existing code
            File::append($js, "\nimport { Livewire } from '{$vendor}/livewire/livewire/dist/livewire.esm';\n\n//  Start Livewire, which starts the Alpine it bundles\nLivewire.start();\n");

            //  Say what was started
            $this->done('Started Livewire in resources/js/app.js.');
        }

        //  Move the relative paths an earlier run wrote to the aliases, once the config has them
        $this->useAliasesInImports($css, $js);
    }

    /**
     * Import the theme in the app's css, where the Tailwind import was, and drop the Tailwind and forms plugin lines, since the theme brings both.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function importTheme(string $css, string $vendor): void
    {
        //  Read the stylesheet
        $contents = File::get($css);

        //  Find the theme import the app already has, whatever its path
        $hasTheme = preg_match('/^@import\s+([\'"])[^\'"]*nyumbani\/ui\/resources\/css\/theme\.css\1;\R?/m', $contents, $theme) === 1;

        //  Find the Tailwind import and the forms plugin
        $tailwind = '/^@import\s+([\'"])tailwindcss\1;\R?/m';
        $forms = '/^@plugin\s+([\'"])@tailwindcss\/forms\1;\R?/m';

        //  Leave a stylesheet that is already tidy alone
        if ($hasTheme && preg_match($tailwind, $contents) !== 1 && preg_match($forms, $contents) !== 1) {
            return;
        }

        //  Use the import the app already has, or write one
        $import = $hasTheme ? rtrim($theme[0]) : "@import '{$vendor}/nyumbani/ui/resources/css/theme.css';";

        //  Take the old theme import out, so it moves to the top
        if ($hasTheme) {
            $contents = str_replace($theme[0], '', $contents);
        }

        //  The theme takes the place of the Tailwind import, or goes first when there is none
        $contents = preg_match($tailwind, $contents) === 1
            ? preg_replace($tailwind, $import."\n", $contents, 1)
            : $import."\n\n".$contents;

        //  Drop the forms plugin and any other Tailwind import, which the theme now brings
        $contents = preg_replace([$tailwind, $forms], '', $contents);

        //  Save it
        File::put($css, $contents);

        //  Say what changed
        $this->done('Imported the theme in resources/css/app.css, which brings Tailwind and its forms plugin.');
    }

    /**
     * Replace the relative paths of the vendor files and the app sources an earlier run wrote with their aliases, for each alias the Vite config has.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function useAliasesInImports(string $css, string $js): void
    {
        //  The relative paths to swap, by file, for the alias that replaces each
        $swaps = [
            $css => [
                "'../../vendor/nyumbani/ui/" => ['@vendor', "'@vendor/nyumbani/ui/"],
                ...collect(UiChecklist::APP_SOURCES)->mapWithKeys(fn (string $alias, string $relative) => ["@source '{$relative}'" => [strstr($alias, '/', true), "@source '{$alias}'"]])->all(),
            ],
            $js => [
                "'../../vendor/nyumbani/ui/" => ['@vendor', "'@vendor/nyumbani/ui/"],
                "'../../vendor/nyumbani/essentials/" => ['@vendor', "'@vendor/nyumbani/essentials/"],
                "'../../vendor/livewire/livewire/" => ['@vendor', "'@vendor/livewire/livewire/"],
            ],
        ];

        foreach ($swaps as $file => $replacements) {
            //  Skip a file the app does not have
            if (! File::exists($file)) {
                continue;
            }

            //  Swap each path whose alias the config has
            $content = File::get($file);

            foreach ($replacements as $from => [$alias, $to]) {
                if ($this->hasViteAlias($alias)) {
                    $content = str_replace($from, $to, $content);
                }
            }

            //  Keep the file as it was when nothing changed
            if ($content !== File::get($file)) {
                File::put($file, $content);

                $this->done('Moved the imports in '.str_replace(base_path().'/', '', $file).' to the Vite aliases.');
            }
        }
    }

    /**
     * Add the @source lines for the app's PHP files that hold classes, each only when it is missing.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function addSources(string $css): void
    {
        //  Nothing to add to without a stylesheet
        if (! File::exists($css)) {
            return;
        }

        //  Keep the lines the stylesheet does not have yet, in either form
        $missing = collect(UiChecklist::sourcesFor(UiChecklist::usesDataTables()))
            ->reject(fn (string $alias, string $relative) => str_contains(File::get($css), "@source '{$relative}'") || str_contains(File::get($css), "@source '{$alias}'"))
            ->map(fn (string $alias, string $relative) => "@source '".($this->hasViteAlias(strstr($alias, '/', true)) ? $alias : $relative)."';");

        //  Leave the stylesheet alone when it has them all
        if ($missing->isEmpty()) {
            return;
        }

        //  Add them after what is already there
        File::append($css, "\n".$missing->implode("\n")."\n");

        //  Say what was added
        $this->done('Added the enum, data table and config sources in resources/css/app.css.');
    }

    /**
     * Set the data tables config to the Tailwind theme and the Nyumbani button, input and select classes, only while the app's copy is still the package's own, so an app's edits stay.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function useTailwindDataTables(): void
    {
        //  Read the config the app has
        $path = config_path('dt-tables.php');

        //  Leave it alone without the data tables package, without a config, or once it differs from the package's own
        if (! UiChecklist::usesDataTables() || ! File::exists($path) || File::get($path) !== File::get(DtTablesServiceProvider::path('config/dt-tables.php'))) {
            return;
        }

        //  Use the Tailwind theme by default
        $config = preg_replace("/('theme'\s*=>\s*)'[^']*'/", "$1'tailwind'", File::get($path), 1);

        //  Give the Tailwind theme the Nyumbani classes
        $config = preg_replace_callback("/('tailwind'\s*=>\s*\[)(.*?)(\n\s*\],)/s", function (array $block) {
            $classes = collect(self::TAILWIND_DATA_TABLE_CLASSES)
                ->reduce(fn (string $content, string $value, string $key) => preg_replace("/('{$key}'\s*=>\s*)'[^']*'/", "$1'{$value}'", $content, 1), $block[2]);

            return $block[1].$classes.$block[3];
        }, $config, 1);

        //  Keep the result
        File::put($path, $config);

        //  Say what was set
        $this->done('Set the data tables to the Tailwind theme.');
    }

    /**
     * Set up the basic portal when the developer asks for it with --portal or answers yes, which a non-interactive run never asks.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function setUpPortal(): void
    {
        //  Skip it unless it was asked for, by the flag or by the answer
        if (! $this->option('portal') && ! ($this->input->isInteractive() && confirm('Set up a basic portal (dashboard, layout and sidebar)?', default: false))) {
            return;
        }

        //  Publish the controller and views, each only when the app has none of that name
        $this->callSilent('vendor:publish', ['--tag' => ['ui-portal']]);

        //  Say what was published
        $this->done('Published the portal views and layout.');

        //  Application code is never edited, so say what is left to do by hand, unless the app has it already
        if ((new InstallChecklist)->hasHomeRoute()) {
            return;
        }

        $this->line(" <fg=#d97706;options=bold>The portal needs a route.</> Add <fg=#d97706>Route::view('dashboard', 'admins.pages.dashboard')->name('dashboard')</> inside your auth group in <fg=#d97706>routes/web.php</>, and return its URL from <fg=#d97706>homeRoute()</> on the user model. The checklist below tracks it.");
        $this->newLine();
    }

    /**
     * Run npm run build when the app has a package.json and its dependencies installed, and say how to do it by hand when it cannot.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function buildAssets(): void
    {
        //  Nothing to build without a package.json
        if (! File::exists(base_path('package.json'))) {
            return;
        }

        //  The build needs the npm dependencies
        if (! File::isDirectory(base_path('node_modules'))) {
            note('Assets were not built: run npm install, then npm run build.');

            return;
        }

        //  Build, and report a failure instead of stopping the install
        $result = spin(fn () => Process::path(base_path())->timeout(600)->run(['npm', 'run', 'build']), 'Building assets with npm run build...');

        if ($result->failed()) {
            error('npm run build failed. Run it by hand to see why.');

            return;
        }

        //  Say what was built
        $this->done('Built the assets with npm run build.');
    }

    /**
     * Print what the UI still needs by hand, found by looking, never by editing application code.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function showChecklist(): void
    {
        //  Print the heading
        $this->newLine();
        $this->line(' <options=bold>UI checklist</>');
        $this->newLine();

        //  One line per check: a tick when done, otherwise the label and how to fix it
        foreach ((new UiChecklist)->items() as $item) {
            if ($item['state'] === 'pass') {
                $this->line("  <fg=green>✓</> <fg=gray>{$item['label']}</>");

                continue;
            }

            $this->line('  <fg='.($item['state'] === 'optional' ? 'yellow' : 'red').';options=bold>'.($item['state'] === 'optional' ? '○' : '✗')."</> <options=bold>{$item['label']}</>");
            $this->line("    <fg=#d97706>→</> <fg=gray>{$item['fix']}</>");
        }
    }

    /**
     * Print a message on a block in the Nyumbani primary colour, the way a prompt's intro and outro are drawn, which Laravel Prompts only draws in cyan.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function banner(string $message): void
    {
        $this->line("<bg=#d97706;fg=black;options=bold> {$message} </>");
    }

    /**
     * Print one finished step as a green tick and its message.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function done(string $message): void
    {
        $this->line("  <fg=green>✓</> {$message}");
    }
}
