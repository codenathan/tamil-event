<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Lab404\Impersonate\Events\LeaveImpersonation;
use Lab404\Impersonate\Events\TakeImpersonation;

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
        $this->configureImpersonationLogging();
    }

    /**
     * Write an audit trail entry whenever an admin starts or stops impersonating.
     */
    protected function configureImpersonationLogging(): void
    {
        Event::listen(TakeImpersonation::class, function (TakeImpersonation $event): void {
            Log::info('Impersonation started', [
                'impersonator_id' => $event->impersonator->getAuthIdentifier(),
                'impersonated_id' => $event->impersonated->getAuthIdentifier(),
                'ip' => request()->ip(),
            ]);
        });

        Event::listen(LeaveImpersonation::class, function (LeaveImpersonation $event): void {
            Log::info('Impersonation ended', [
                'impersonator_id' => $event->impersonator->getAuthIdentifier(),
                'impersonated_id' => $event->impersonated?->getAuthIdentifier(),
                'ip' => request()->ip(),
            ]);
        });
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

        $forgetLocationCaches = function (): void {
            Cache::forget('inertia.locations_by_country');
            Cache::forget('inertia.all_locations_by_country');
        };

        Country::saved($forgetLocationCaches);
        Country::deleted($forgetLocationCaches);

        City::saved($forgetLocationCaches);
        City::deleted($forgetLocationCaches);

        Vendor::saved($forgetLocationCaches);
        Vendor::deleted($forgetLocationCaches);
    }
}
