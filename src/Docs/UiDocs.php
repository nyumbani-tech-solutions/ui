<?php

namespace Nyumbani\Ui\Docs;

use Nyumbani\Docs\Docs;

/**
 * The docs of the UI package: its pages, grouped by the concept they explain
 *
 * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
 */
class UiDocs
{
    /**
     * Describe the docs of the UI package, which load the app's own styles and scripts because their examples run real components
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public static function describe(): Docs
    {
        return (new Docs('nyumbani-ui', 'UI', [
            ['title' => 'Getting started', 'pages' => [
                'introduction' => 'Introduction',
                'installation' => 'Installation',
                'quick-start' => 'Quick start',
            ]],
            ['title' => 'Interface', 'pages' => [
                'layouts' => 'Layouts',
                'theme' => 'Theme and buttons',
                'modal' => 'Modal',
                'alerts-and-loader' => 'Alerts and loader',
                'scripts' => 'Scripts',
                'error-pages' => 'Error pages',
                'error-bags' => 'Error bags',
            ]],
            ['title' => 'Conventions', 'pages' => [
                'view-layer' => 'Views and scripts',
            ]],
        ], 'nyumbani::docs.pages'))
            ->withAppAssets('nyumbani::docs.head', 'nyumbani::docs.foot', ['data-currency' => config('essentials.currency')]);
    }
}
