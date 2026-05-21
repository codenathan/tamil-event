<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchCategoryFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_by_category(): void
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

        Vendor::factory()->create([
            'category_id' => $photography->id,
            'city_id' => $colombo->id,
            'country_id' => $country->id,
            'name' => 'Photo Pro',
            'is_active' => true,
        ]);

        Vendor::factory()->create([
            'category_id' => $catering->id,
            'city_id' => $colombo->id,
            'country_id' => $country->id,
            'name' => 'Cater Kings',
            'is_active' => true,
        ]);

        $response = $this->get('/search?category=Photography');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('vendors.data', 1)
            ->where('vendors.data.0.name', 'Photo Pro')
            ->where('filters.category', 'Photography')
        );
    }

    public function test_search_with_category_and_location(): void
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
        $jaffna = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Jaffna',
            'slug' => 'jaffna',
        ]);

        Vendor::factory()->create([
            'category_id' => $photography->id,
            'city_id' => $colombo->id,
            'country_id' => $country->id,
            'name' => 'Colombo Photo',
            'is_active' => true,
        ]);

        Vendor::factory()->create([
            'category_id' => $photography->id,
            'city_id' => $jaffna->id,
            'country_id' => $country->id,
            'name' => 'Jaffna Photo',
            'is_active' => true,
        ]);

        $response = $this->get('/search?category=Photography&city=Colombo&country=Sri+Lanka');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('vendors.data', 1)
            ->where('vendors.data.0.name', 'Colombo Photo')
        );
    }
}
