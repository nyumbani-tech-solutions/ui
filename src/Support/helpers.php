<?php

if (! function_exists('ui_path')) {
    /**
     * Get a path inside the UI package.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    function ui_path(string $path = ''): string
    {
        return dirname(__DIR__, 2).($path ? DIRECTORY_SEPARATOR.ltrim($path, '/\\') : '');
    }
}
