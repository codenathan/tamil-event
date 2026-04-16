<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Country;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationsController extends Controller
{
    public function index(): Response
    {
        $countries = Country::withCount('cities')
            ->with('cities:id,name,country_id')
            ->orderBy('name')
            ->get()
            ->map(fn($country) => [
                'id'          => $country->id,
                'name'        => $country->name,
                'cities_count' => $country->cities_count,
                'cities'      => $country->cities->map(fn($city) => [
                    'id'   => $city->id,
                    'name' => $city->name,
                ]),
            ]);

        return Inertia::render('admin/locations', [
            'countries' => $countries,
        ]);
    }

    public function storeCountry(Request $request): RedirectResponse
    {
        $request->validate(['name' => 'required|string|max:100|unique:countries,name']);

        Country::create(['name' => $request->name]);

        return back();
    }

    public function destroyCountry(Country $country): RedirectResponse
    {
        // cities will cascade-delete if you have onDelete('cascade') on the FK,
        // otherwise delete them explicitly:
        $country->cities()->delete();
        $country->delete();

        return back();
    }

    public function storeCity(Request $request, Country $country): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:cities,name,NULL,id,country_id,' . $country->id,
        ]);

        $country->cities()->create(['name' => $request->name]);

        return back();
    }

    public function destroyCity(Country $country, City $city): RedirectResponse
    {
        abort_if($city->country_id !== $country->id, 404);

        $city->delete();

        return back();
    }
}
