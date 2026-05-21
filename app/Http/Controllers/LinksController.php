<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use Illuminate\Support\Facades\DB;
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

        $combinations = DB::table('vendors')
            ->join('cities', 'vendors.city_id', '=', 'cities.id')
            ->join('categories', 'vendors.category_id', '=', 'categories.id')
            ->join('countries', 'cities.country_id', '=', 'countries.id')
            ->where('vendors.is_active', true)
            ->select(
                'cities.id as city_id',
                'cities.name as city_name',
                'cities.slug as city_slug',
                'categories.id as category_id',
                'categories.name as category_name',
                'categories.slug as category_slug',
                'countries.name as country_name'
            )
            ->distinct()
            ->orderBy('countries.name')
            ->orderBy('cities.name')
            ->orderBy('categories.name')
            ->get();

        return Inertia::render('links', compact('categories', 'cities', 'combinations'));
    }
}
