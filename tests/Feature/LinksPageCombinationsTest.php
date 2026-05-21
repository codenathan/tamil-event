<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LinksPageCombinationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_combinations_only_include_active_vendors(): void
    {
        $photography = Category::factory()->create([
            'name' => 'Photography',
            'slug' => 'photography',
        ]);
        $catering = Category::factory()->create([
            'name' => 'Catering',
            'slug' => 'catering',
        ]);

        $country = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        $colombo = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);
        $jaffna = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Jaffna',
            'slug' => 'jaffna',
        ]);

        // Active vendor: Colombo + Photography
        Vendor::factory()->create([
            'category_id' => $photography->id,
            'city_id' => $colombo->id,
            'country_id' => $country->id,
            'is_active' => true,
        ]);

        // Inactive vendor: Colombo + Catering
        Vendor::factory()->create([
            'category_id' => $catering->id,
            'city_id' => $colombo->id,
            'country_id' => $country->id,
            'is_active' => false,
        ]);

        // Active vendor: Jaffna + Photography
        Vendor::factory()->create([
            'category_id' => $photography->id,
            'city_id' => $jaffna->id,
            'country_id' => $country->id,
            'is_active' => true,
        ]);

        $response = $this->get(route('links'));

        $response->assertInertia(fn ($page) => $page
            ->has('combinations', 2)
            ->where('combinations.0.city_slug', 'colombo')
            ->where('combinations.0.category_slug', 'photography')
            ->where('combinations.1.city_slug', 'jaffna')
            ->where('combinations.1.category_slug', 'photography')
        );
    }

    public function test_inactive_vendors_are_excluded_from_combinations(): void
    {
        $photography = Category::factory()->create([
            'name' => 'Photography',
            'slug' => 'photography',
        ]);

        $country = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        $colombo = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);

        // Only inactive vendors exist
        Vendor::factory()->create([
            'category_id' => $photography->id,
            'city_id' => $colombo->id,
            'country_id' => $country->id,
            'is_active' => false,
        ]);

        $response = $this->get(route('links'));

        $response->assertInertia(fn ($page) => $page
            ->has('combinations', 0)
        );
    }
}
