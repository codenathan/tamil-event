<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\Vendor;
use App\Services\ListingStructuredData;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LocationCategoryController extends Controller
{
    public function show(City $city, Category $category, ListingStructuredData $structuredData): Response
    {
        $city->load('country');

        $vendors = Vendor::active()
            ->with(['category', 'city', 'country', 'media'])
            ->where('city_id', $city->id)
            ->where('category_id', $category->id)
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('search', [
            'vendors' => $vendors,
            'filters' => [
                'q' => '',
                'city' => $city->name,
                'country' => $city->country?->name ?? '',
                'category' => $category->name,
            ],
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'meta' => [
                'title' => 'Tamil '.$category->name.' in '.$city->name,
                'description' => $this->metaDescription($city, $category, $vendors->total()),
                'canonicalUrl' => $vendors->currentPage() > 1
                    ? route('location.category.show', [$city, $category, 'page' => $vendors->currentPage()])
                    : route('location.category.show', [$city, $category]),
                'noindex' => $vendors->total() === 0,
            ],
            'structuredData' => $structuredData->build('Tamil '.$category->name.' in '.$city->name, $vendors, [
                ['name' => $city->name, 'url' => route('location.show', $city)],
                ['name' => $category->name, 'url' => route('location.category.show', [$city, $category])],
            ]),
        ]);
    }

    /**
     * Build a search-snippet description naming the vendor count, category and full location.
     */
    private function metaDescription(City $city, Category $category, int $vendorCount): string
    {
        $place = collect([$city->name, $city->country?->name])->filter()->implode(', ');
        $vendorPhrase = $vendorCount > 0
            ? $vendorCount.' Tamil '.$category->name.' '.Str::plural('vendor', $vendorCount)
            : 'Tamil '.$category->name.' vendors';

        return 'Find '.$vendorPhrase.' in '.$place.' for weddings, birthdays and cultural events. Compare profiles, services and contact details in one place.';
    }
}
