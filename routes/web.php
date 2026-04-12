<?php

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
});

require __DIR__.'/settings.php';
