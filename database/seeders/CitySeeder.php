<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $locationsByCountry = [
            'United Kingdom' => ['London', 'Birmingham', 'Leicester'],
            'Canada'         => ['Toronto', 'Scarborough'],
            'France'         => ['Paris'],
            'Germany'        => ['Berlin'],
            'Australia'      => ['Sydney', 'Melbourne'],
            'Sri Lanka'      => ['Colombo', 'Jaffna'],
            'India'          => ['Chennai', 'Madurai'],
            'United States'  => ['New York'],
            'UAE'            => ['Dubai'],
            'Singapore'      => ['Singapore'],
            'Malaysia'       => ['Kuala Lumpur'],
        ];

        foreach ($locationsByCountry as $countryName => $cities) {
            $country = Country::where('slug', Str::slug($countryName))->first();

            if (!$country) {
                continue;
            }

            foreach ($cities as $cityName) {
                City::updateOrCreate(
                    ['country_id' => $country->id, 'slug' => Str::slug($cityName)],
                    ['name' => $cityName, 'slug' => Str::slug($cityName)]
                );
            }
        }
    }
}
