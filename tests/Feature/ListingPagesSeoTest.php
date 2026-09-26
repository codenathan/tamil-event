<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ListingPagesSeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_page_uses_tamil_category_seo_meta(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);

        $this->get(route('category.show', $category))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->where('meta.title', 'Tamil Photographers - TamilEventPlanner')
                ->where('meta.description', 'Find Tamil Photographers around the world')
                ->where('meta.canonicalUrl', route('category.show', $category))
            );
    }

    public function test_location_page_uses_tamil_vendors_in_city_seo_meta(): void
    {
        $city = $this->harrow();

        $this->get(route('location.show', $city))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('locations/show')
                ->where('meta.title', 'Tamil Vendors in Harrow - TamilEventPlanner')
                ->where('meta.description', 'Find Tamil Vendors in Harrow')
                ->where('meta.canonicalUrl', route('location.show', $city))
            );
    }

    public function test_location_category_page_uses_city_name_only_in_seo_meta(): void
    {
        $city = $this->harrow();
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);

        $this->get(route('location.category.show', [$city, $category]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->where('meta.title', 'Tamil Photographers in Harrow - TamilEventPlanner')
                ->where('meta.description', 'Find Tamil Photographers in Harrow')
                ->where('meta.canonicalUrl', route('location.category.show', [$city, $category]))
            );
    }

    private function harrow(): City
    {
        $country = Country::factory()->create(['name' => 'United Kingdom', 'slug' => 'united-kingdom']);

        return City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Harrow',
            'slug' => 'harrow',
        ]);
    }
}
