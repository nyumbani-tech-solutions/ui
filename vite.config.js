import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * Bundle every Nyumbani script, as one file (ui.js) and one file each, with toastr, jQuery and Alpine UI inside, into resources/dist,
 * so an app imports one file and installs no npm package. Alpine itself is not bundled: the page's own
 * Alpine (Livewire's) loads the plugin through the alpine:init event.
 */
export default defineConfig({
    build: {
        outDir: 'resources/dist',
        emptyOutDir: true,
        lib: {
            entry: Object.fromEntries(
                ['ui', 'toastr', 'shell', 'submit', 'file-input', 'modal', 'forms']
                    .map((name) => [name, resolve(import.meta.dirname, `resources/js/${name}.js`)])
            ),
            formats: ['es'],
            fileName: (format, name) => `${name}.js`,
            cssFileName: 'ui',
        },
    },
});
