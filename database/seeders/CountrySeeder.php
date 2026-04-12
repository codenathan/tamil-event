<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            'United Kingdom',
            'Canada',
            'France',
            'Germany',
            'Australia',
            'Sri Lanka',
            'India',
            'United States',
            'UAE',
            'Singapore',
            'Malaysia',
        ];

        foreach ($countries as $name) {
            Country::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'slug' => Str::slug($name)]
            );
        }
    }
}
