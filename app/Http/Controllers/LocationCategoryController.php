<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class LocationCategoryController extends Controller
{
    public function show(City $city, Category $category): Response
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
            ],
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'meta' => [
                'title' => 'Tamil '.$category->name.' in '.$city->name,
                'description' => 'Find Tamil '.$category->name.' in '.$city->name,
                'canonicalUrl' => $vendors->currentPage() > 1
                    ? route('location.category.show', [$city, $category, 'page' => $vendors->currentPage()])
                    : route('location.category.show', [$city, $category]),
                'noindex' => $vendors->total() === 0,
            ],
        ]);
    }
}
