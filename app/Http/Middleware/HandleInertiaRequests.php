<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user()?->getRoleNames() ?? [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            'categories' => $this->sharedCategories(),
            'locationsByCountry' => $this->sharedLocationsByCountry(),

            'analytics' => $this->sharedAnalytics($request),
        ];
    }

    /**
     * @return array{measurementId: string|null, enabled: bool}
     */
    protected function sharedAnalytics(Request $request): array
    {
        $id = config('analytics.google_analytics_measurement_id');
        $hasId = is_string($id) && $id !== '';

        $shareMeasurementId = $hasId && (
            app()->environment('production')
            || config('analytics.google_analytics_enabled')
        );

        $path = trim($request->path(), '/');
        $excludedPrefixes = ['dashboard', 'admin', 'settings'];
        $pathAllowed = true;
        foreach ($excludedPrefixes as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                $pathAllowed = false;
                break;
            }
        }

        return [
            'measurementId' => $shareMeasurementId ? $id : null,
            'enabled' => $pathAllowed,
        ];
    }

    protected function sharedCategories(): array
    {
        return Cache::rememberForever('inertia.categories', function () {
            return Category::orderBy('name')
                ->get(['id', 'name', 'slug', 'icon', 'description'])
                ->toArray();
        });
    }

    protected function sharedLocationsByCountry(): array
    {
        return Cache::rememberForever(
            'inertia.locations_by_country',
            fn (): array => Country::locationsByCountry(withVendorsOnly: true),
        );
    }
}
