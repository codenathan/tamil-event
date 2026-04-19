<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function show(Category $category): Response
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
            ],
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'meta' => [
                'title' => $category->name.' Vendors — TamilEventPlanner',
                'description' => 'Browse vendors in the '.$category->name.' category. Find Tamil event professionals for your celebration on TamilEventPlanner.',
                'canonicalUrl' => route('category.show', $category),
            ],
        ]);
    }
}
