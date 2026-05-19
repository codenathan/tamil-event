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

        $location = collect([$city->name, $city->country?->name])
            ->filter()
            ->implode(', ');

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
                'title' => $category->name.' Vendors in '.$location.' — TamilEventPlanner',
                'description' => 'Browse '.$category->name.' vendors in '.$location.'. Find Tamil event professionals for your celebration on TamilEventPlanner.',
                'canonicalUrl' => route('location.category.show', [$city, $category]),
            ],
        ]);
    }
}
