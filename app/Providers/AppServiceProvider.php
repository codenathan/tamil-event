<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureCacheInvalidation();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureCacheInvalidation(): void
    {
        Category::saved(fn () => Cache::forget('inertia.categories'));
        Category::deleted(fn () => Cache::forget('inertia.categories'));

        Country::saved(fn () => Cache::forget('inertia.locations_by_country'));
        Country::deleted(fn () => Cache::forget('inertia.locations_by_country'));

        City::saved(fn () => Cache::forget('inertia.locations_by_country'));
        City::deleted(fn () => Cache::forget('inertia.locations_by_country'));
    }
}
