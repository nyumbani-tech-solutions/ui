<?php

use Illuminate\Support\Facades\Route;
use Nyumbani\Docs\Http\Middleware\EnsureDocsAreAvailable;
use Nyumbani\Ui\Http\Controllers\DocsSamplesController;
use Nyumbani\Ui\Http\Controllers\ImageController;
use Nyumbani\Ui\Http\Controllers\WebManifestController;

//  Serve the package images, which are static so they need no session
Route::get('nyumbani/images/{image}', ImageController::class)
    ->where('image', '[A-Za-z0-9._-]+')
    ->name('nyumbani.image');

//  Serve the favicons, which live in their own folder
Route::get('nyumbani/favicons/{image}', ImageController::class)
    ->where('image', '[A-Za-z0-9._-]+')
    ->defaults('folder', 'favicons')
    ->name('nyumbani.favicon');

//  Describe the installable app, named after the app that uses the package
Route::get('nyumbani/site.webmanifest', WebManifestController::class)
    ->name('nyumbani.manifest');

//  The docs samples need the docs package, a dev dependency that production does not have
if (class_exists(EnsureDocsAreAvailable::class)) {
    //  Serve the samples the docs run for real: a form that fills an error bag, remote modal content and the error pages
    Route::prefix('{package}/docs/samples')
        ->where(['package' => 'nyumbani-[a-z0-9-]+'])
        ->middleware(['web', EnsureDocsAreAvailable::class])
        ->name('nyumbani.docs.samples.')
        ->group(function () {
            Route::post('form', [DocsSamplesController::class, 'form'])->name('form');
            Route::get('modal-content', [DocsSamplesController::class, 'modalContent'])->name('modal-content');
            Route::get('errors/{code}', [DocsSamplesController::class, 'error'])->whereIn('code', [401, 403, 404, 419, 429, 500, 503])->name('error');
        });
}
