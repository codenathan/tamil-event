<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
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

    public function test_category_page_canonical_url_points_at_current_paginated_page(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);

        $this->get(route('category.show', [$category, 'page' => 2, 'utm_source' => 'newsletter']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->where('meta.canonicalUrl', route('category.show', [$category, 'page' => 2]))
            );
    }

    public function test_category_page_canonical_url_omits_page_one_query(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);

        $this->get(route('category.show', [$category, 'page' => 1]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
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

    public function test_location_page_canonical_url_points_at_current_paginated_page(): void
    {
        $city = $this->harrow();

        $this->get(route('location.show', [$city, 'page' => 2, 'utm_source' => 'newsletter']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('locations/show')
                ->where('meta.canonicalUrl', route('location.show', [$city, 'page' => 2]))
            );
    }

    public function test_location_page_canonical_url_omits_page_one_query(): void
    {
        $city = $this->harrow();

        $this->get(route('location.show', [$city, 'page' => 1]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
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

    public function test_location_category_page_canonical_url_points_at_current_paginated_page(): void
    {
        $city = $this->harrow();
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);

        $this->get(route('location.category.show', [$city, $category, 'page' => 2, 'utm_source' => 'newsletter']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->where('meta.canonicalUrl', route('location.category.show', [$city, $category, 'page' => 2]))
            );
    }

    public function test_location_category_page_canonical_url_omits_page_one_query(): void
    {
        $city = $this->harrow();
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);

        $this->get(route('location.category.show', [$city, $category, 'page' => 1]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('meta.canonicalUrl', route('location.category.show', [$city, $category]))
            );
    }

    public function test_category_page_is_noindex_without_active_vendors(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);
        $this->vendor($this->harrow(), $category, isActive: false);

        $this->get(route('category.show', $category))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('meta.noindex', true));
    }

    public function test_category_page_is_indexable_with_active_vendors(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);
        $this->vendor($this->harrow(), $category);

        $this->get(route('category.show', $category))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('meta.noindex', false));
    }

    public function test_location_page_is_noindex_without_active_vendors(): void
    {
        $city = $this->harrow();
        $this->vendor($city, Category::factory()->create(['name' => 'Catering', 'slug' => 'catering']), isActive: false);

        $this->get(route('location.show', $city))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('meta.noindex', true));
    }

    public function test_location_page_is_indexable_with_active_vendors(): void
    {
        $city = $this->harrow();
        $this->vendor($city, Category::factory()->create(['name' => 'Catering', 'slug' => 'catering']));

        $this->get(route('location.show', $city))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('meta.noindex', false));
    }

    public function test_location_category_page_is_noindex_without_active_vendors(): void
    {
        $city = $this->harrow();
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);
        $this->vendor($city, Category::factory()->create(['name' => 'Catering', 'slug' => 'catering']));
        $this->vendor($city, $category, isActive: false);

        $this->get(route('location.category.show', [$city, $category]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('meta.noindex', true));
    }

    public function test_location_category_page_is_indexable_with_active_vendors(): void
    {
        $city = $this->harrow();
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);
        $this->vendor($city, $category);

        $this->get(route('location.category.show', [$city, $category]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('meta.noindex', false));
    }

    private function vendor(City $city, Category $category, bool $isActive = true): Vendor
    {
        return Vendor::factory()->create([
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $city->country_id,
            'is_active' => $isActive,
        ]);
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
