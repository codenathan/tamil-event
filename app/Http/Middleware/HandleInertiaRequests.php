<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\City;
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
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'categories' => $this->sharedCategories(),
            'locationsByCountry' => $this->sharedLocationsByCountry(),
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
        return Cache::rememberForever('inertia.locations_by_country', function () {
            return Country::with(['cities' => fn ($query) => $query->orderBy('name')])
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->mapWithKeys(fn ($country) => [
                    $country->name => $country->cities->pluck('name')->all(),
                ])
                ->toArray();
        });
    }
}
