<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use Inertia\Inertia;

class LinksController extends Controller
{
    public function __invoke()
    {
        $categories = Category::orderBy('name')->get();
        $cities = City::with('country')
            ->join('countries', 'cities.country_id', '=', 'countries.id')
            ->orderBy('countries.name')
            ->orderBy('cities.name')
            ->select('cities.*')
            ->get();

        return Inertia::render('links', compact('categories', 'cities'));
    }
}
