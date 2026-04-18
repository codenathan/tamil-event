<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function show(City $city): Response
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
        ]);
    }
}
