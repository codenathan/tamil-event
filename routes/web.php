<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\CategoriesController;
use App\Http\Controllers\Admin\DisableUserController;
use App\Http\Controllers\Admin\EnableUserController;
use App\Http\Controllers\Admin\InboxController;
use App\Http\Controllers\Admin\LocationsController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\VendorApplicationsController;
use App\Http\Controllers\Admin\VendorsController;
use App\Http\Controllers\BlogController as PublicBlogController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnquireController;
use App\Http\Controllers\LinksController;
use App\Http\Controllers\ListYourBusinessController;
use App\Http\Controllers\LocationCategoryController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MarkVendorEnquiryReadController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\UpdateVendorListingController;
use Illuminate\Support\Facades\Route;

Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

Route::inertia('/', 'welcome')->name('home');
Route::inertia('privacy-policy', 'privacy-policy')->name('privacy-policy');
Route::inertia('terms-and-conditions', 'terms-and-conditions')->name('terms-and-conditions');

Route::get('links', LinksController::class)->name('links');

Route::get('contact', [ContactController::class, 'index'])->name('contact');
Route::post('contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('list-your-business', [ListYourBusinessController::class, 'index'])->name('list-your-business');
Route::post('list-your-business', [ListYourBusinessController::class, 'store'])->name('list-your-business.store');

Route::get('search', [SearchController::class, 'index'])->name('search');
Route::get('blogs', [PublicBlogController::class, 'index'])->name('blogs.index');
Route::get('blogs/{blog:slug}', [PublicBlogController::class, 'show'])->name('blogs.show');

Route::get('vendors/{vendor:slug}', [SearchController::class, 'show'])->name('vendors.show');
Route::post('vendors/{vendor:slug}/enquire', [EnquireController::class, 'store'])->name('vendors.enquire.store');
Route::get('category/{category:slug}', [CategoryController::class, 'show'])->name('category.show');
Route::get('location/{city:slug}', [LocationController::class, 'show'])->name('location.show');
Route::get('location/{city:slug}/{category:slug}', [LocationCategoryController::class, 'show'])
    ->name('location.category.show')
    ->withoutScopedBindings();

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::patch('dashboard/listing', UpdateVendorListingController::class)->name('dashboard.listing.update');
    Route::post('dashboard/enquiries/{enquire}/mark-as-read', MarkVendorEnquiryReadController::class)
        ->name('dashboard.enquiries.mark-as-read');

    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::post('users/{user}/disable', DisableUserController::class)->name('users.disable');
        Route::post('users/{user}/enable', EnableUserController::class)->name('users.enable');

        Route::get('/inbox', [InboxController::class, 'index'])->name('inbox');
        Route::post('/inbox/{message}/mark-as-read', [InboxController::class, 'markAsRead'])
            ->name('inbox.mark-as-read');
        Route::delete('/inbox/{message}', [InboxController::class, 'destroy'])->name('inbox.destroy');

        Route::get('/locations', [LocationsController::class, 'index'])->name('locations');

        // Countries
        Route::post('/locations/countries', [LocationsController::class, 'storeCountry'])
            ->name('locations.countries.store');
        Route::delete('/locations/countries/{country}', [LocationsController::class, 'destroyCountry'])
            ->name('locations.countries.destroy');

        Route::post('/locations/countries/{country}/cities', [LocationsController::class, 'storeCity'])
            ->name('locations.cities.store');
        Route::delete('/locations/countries/{country}/cities/{city}', [LocationsController::class, 'destroyCity'])
            ->name('locations.cities.destroy');

        Route::resource('vendors', VendorsController::class);
        Route::resource('categories', CategoriesController::class);

        Route::get('/applications', [VendorApplicationsController::class, 'index'])->name('applications');
        Route::patch('/applications/{vendor}/approve', [VendorApplicationsController::class, 'update'])
            ->name('applications.approve');
        Route::delete('/applications/{vendor}', [VendorApplicationsController::class, 'destroy'])
            ->name('applications.destroy');

        Route::resource('blogs', BlogController::class)->except(['show']);

        Route::get('/users', [UsersController::class, 'index'])->name('users');
    });
});

require __DIR__.'/settings.php';
