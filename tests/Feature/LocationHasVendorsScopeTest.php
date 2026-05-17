<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationHasVendorsScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_city_has_vendors_scope_returns_only_cities_with_vendors(): void
    {
        $category = Category::factory()->create([
            'name' => 'Photography',
        ]);
        $country = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        $cityWithVendor = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);
        City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Jaffna',
            'slug' => 'jaffna',
        ]);

        Vendor::factory()->create([
            'category_id' => $category->id,
            'city_id' => $cityWithVendor->id,
            'country_id' => $country->id,
            'name' => 'Colombo Vendor',
            'slug' => 'colombo-vendor',
        ]);

        $cities = City::query()->hasVendors()->orderBy('name')->pluck('name')->all();

        $this->assertSame(['Colombo'], $cities);
    }

    public function test_country_has_vendors_scope_returns_only_countries_with_vendors(): void
    {
        $category = Category::factory()->create([
            'name' => 'Photography',
        ]);
        $countryWithVendor = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        Country::factory()->create([
            'name' => 'India',
            'slug' => 'india',
        ]);
        $city = City::factory()->create([
            'country_id' => $countryWithVendor->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);

        Vendor::factory()->create([
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $countryWithVendor->id,
            'name' => 'Colombo Vendor',
            'slug' => 'colombo-vendor',
        ]);

        $countries = Country::query()->hasVendors()->orderBy('name')->pluck('name')->all();

        $this->assertSame(['Sri Lanka'], $countries);
    }

    public function test_locations_by_country_with_vendors_only_includes_vendor_locations(): void
    {
        $category = Category::factory()->create([
            'name' => 'Photography',
        ]);
        $countryWithVendor = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        Country::factory()->create([
            'name' => 'India',
            'slug' => 'india',
        ]);
        $cityWithVendor = City::factory()->create([
            'country_id' => $countryWithVendor->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);
        City::factory()->create([
            'country_id' => $countryWithVendor->id,
            'name' => 'Jaffna',
            'slug' => 'jaffna',
        ]);

        Vendor::factory()->create([
            'category_id' => $category->id,
            'city_id' => $cityWithVendor->id,
            'country_id' => $countryWithVendor->id,
            'name' => 'Colombo Vendor',
            'slug' => 'colombo-vendor',
        ]);

        $locations = Country::locationsByCountry(withVendorsOnly: true);

        $this->assertSame(['Colombo'], $locations['Sri Lanka'] ?? []);
        $this->assertArrayNotHasKey('India', $locations);
    }
}
