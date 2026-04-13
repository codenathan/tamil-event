<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CmsController;
use App\Http\Controllers\Admin\InboxController;
use App\Http\Controllers\Admin\VendorApplicationsController;
use App\Http\Controllers\Admin\VendorsController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ListYourBusinessController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::inertia('privacy-policy', 'privacy-policy')->name('privacy-policy');

Route::get('contact', [ContactController::class, 'index'])->name('contact');
Route::post('contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('list-your-business', [ ListYourBusinessController::class, 'index'])->name('list-your-business');
Route::post('list-your-business', [ ListYourBusinessController::class, 'store'])->name('list-your-business.store');

Route::get('search', [SearchController::class , 'index'])->name('search');
Route::get('vendors/{vendor:slug}', [SearchController::class, 'show'])->name('vendors.show');
Route::get('category/{category:slug}', [CategoryController::class, 'show'])->name('category.show');
Route::get('location/{city:slug}', [LocationController::class, 'show'])->name('location.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/inbox', [InboxController::class, 'index'])->name('admin.inbox');
        Route::get('/vendors', [VendorsController::class, 'index'])->name('admin.vendors');
        Route::get('/cms', [CmsController::class, 'index'])->name('admin.cms');
        Route::get('/applications', [VendorApplicationsController::class, 'index'])->name('admin.applications');
        Route::get('/users', [UsersController::class, 'index'])->name('admin.users');
    });
});

require __DIR__.'/settings.php';
