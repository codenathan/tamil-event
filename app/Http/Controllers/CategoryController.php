<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Vendor;
use App\Services\ListingStructuredData;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function show(Category $category, ListingStructuredData $structuredData): Response
    {
        $vendors = Vendor::active()->with(['category', 'city', 'country', 'media'])
            ->where('category_id', $category->id)
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('search', [
            'vendors' => $vendors,
            'filters' => [
                'q' => '',
                'city' => '',
                'country' => '',
                'category' => $category->name,
            ],
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'meta' => [
                'title' => 'Tamil '.$category->name,
                'description' => trim('Find Tamil '.$category->name.' around the world.'.' '.$category->description),
                'canonicalUrl' => $vendors->currentPage() > 1
                    ? route('category.show', [$category, 'page' => $vendors->currentPage()])
                    : route('category.show', $category),
                'noindex' => $vendors->total() === 0,
            ],
            'structuredData' => $structuredData->build('Tamil '.$category->name, $vendors, [
                ['name' => $category->name, 'url' => route('category.show', $category)],
            ]),
        ]);
    }
}
