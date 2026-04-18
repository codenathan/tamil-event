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
        $query = $request->string('q')->trim()->value();
        $city = $request->string('city')->trim()->value();
        $country = $request->string('country')->trim()->value();

        $vendors = Vendor::active()
            ->with(['category', 'city', 'country', 'media'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('name', 'like', "%{$query}%")
                        ->orWhereHas('city', function ($cityQ) use ($query) {
                            $cityQ->where('name', 'like', "%{$query}%");
                        })
                        ->orWhereHas('category', function ($categoryQ) use ($query) {
                            $categoryQ->where('name', 'like', "%{$query}%");
                        })
                        ->orWhereHas('country', function ($countryQ) use ($query) {
                            $countryQ->where('name', 'like', "%{$query}%");
                        });
                });
            })
            ->when($city !== '' && $country !== '', function ($q) use ($city, $country) {
                $q->whereHas('city', function ($cityQ) use ($city, $country) {
                    $cityQ->where('name', $city)
                        ->whereHas('country', function ($countryQ) use ($country) {
                            $countryQ->where('name', $country);
                        });
                });
            })
            ->when($city === '' && $country !== '', function ($q) use ($country) {
                $q->whereHas('country', function ($countryQ) use ($country) {
                    $countryQ->where('name', $country);
                });
            })
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('search', [
            'vendors' => $vendors,
            'filters' => [
                'q' => $query,
                'city' => $city,
                'country' => $country,
            ],
        ]);
    }

    public function show(Vendor $vendor): Response
    {
        abort_if(! $vendor->is_active, 404);

        $vendor->load(['category', 'city', 'country', 'media']);

        return Inertia::render('vendors/show', [
            'vendor' => $vendor,
        ]);
    }
}
