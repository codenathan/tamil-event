<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query   = $request->string('q')->trim()->value();
        $city    = $request->string('city')->trim()->value();
        $country = $request->string('country')->trim()->value();

        $vendors = Vendor::with(['category', 'city', 'country'])
            ->when($query, fn ($q) => $q->where('name', 'like', "%{$query}%"))
            ->when($city, fn ($q) => $q->whereHas('city', fn ($c) => $c->where('name', 'like', "%{$city}%")))
            ->when($country && !$city, fn ($q) => $q->whereHas('country', fn ($c) => $c->where('name', 'like', "%{$country}%")))
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('search', [
            'vendors' => $vendors,
            'filters' => [
                'q'       => $query,
                'city'    => $city,
                'country' => $country,
            ],
        ]);
    }

    public function show(Vendor $vendor): Response
    {
        $vendor->load(['category', 'city', 'country', 'images']);

        return Inertia::render('vendors/show', [
            'vendor' => $vendor,
        ]);
    }
}
