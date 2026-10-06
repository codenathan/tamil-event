<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\Vendor;
use App\Services\ListingStructuredData;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function show(City $city, ListingStructuredData $structuredData): Response
    {
        $city->load('country');

        $vendors = Vendor::active()->with(['category', 'city', 'country', 'media'])
            ->where('city_id', $city->id)
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('locations/show', [
            'city' => [
                'id' => $city->id,
                'name' => $city->name,
                'slug' => $city->slug,
                'country' => $city->country?->name,
            ],
            'vendors' => $vendors,
            'meta' => [
                'title' => 'Tamil Wedding and Event Vendors in '.$city->name,
                'description' => $this->metaDescription($city, $vendors->total()),
                'canonicalUrl' => $vendors->currentPage() > 1
                    ? route('location.show', [$city, 'page' => $vendors->currentPage()])
                    : route('location.show', $city),
                'noindex' => $vendors->total() === 0,
            ],
            'structuredData' => $structuredData->build('Tamil Vendors in '.$city->name, $vendors, [
                ['name' => $city->name, 'url' => route('location.show', $city)],
            ]),
        ]);
    }

    /**
     * Build a search-snippet description naming the vendor count and the city's busiest categories.
     */
    private function metaDescription(City $city, int $vendorCount): string
    {
        $place = collect([$city->name, $city->country?->name])->filter()->implode(', ');

        if ($vendorCount === 0) {
            return 'Find Tamil wedding and event vendors in '.$place.'. Compare profiles and contact vendors directly on TamilEventPlanner.';
        }

        $activeVendorsInCity = fn ($query) => $query->active()->where('city_id', $city->id);

        $topCategoryNames = Category::query()
            ->whereHas('vendors', $activeVendorsInCity)
            ->withCount(['vendors' => $activeVendorsInCity])
            ->orderByDesc('vendors_count')
            ->orderBy('name')
            ->limit(3)
            ->pluck('name');

        return sprintf(
            'Discover %d Tamil wedding and event %s in %s. Browse %s and more, compare profiles and contact vendors directly.',
            $vendorCount,
            Str::plural('vendor', $vendorCount),
            $place,
            $topCategoryNames->implode(', '),
        );
    }
}
