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

    public function test_category_page_has_item_list_and_breadcrumb_structured_data(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);
        $city = $this->harrow();
        $alpha = $this->vendor($city, $category, name: 'Alpha Studio');
        $beta = $this->vendor($city, $category, name: 'Beta Studio');
        $this->vendor($city, $category, isActive: false, name: 'Aardvark Inactive');

        $this->get(route('category.show', $category))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('structuredData.@context', 'https://schema.org')
                ->where('structuredData.@graph.0', [
                    '@type' => 'ItemList',
                    'name' => 'Tamil Photographers',
                    'numberOfItems' => 2,
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Alpha Studio', 'url' => route('vendors.show', $alpha)],
                        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Beta Studio', 'url' => route('vendors.show', $beta)],
                    ],
                ])
                ->where('structuredData.@graph.1', [
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => route('home')],
                        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Photographers', 'item' => route('category.show', $category)],
                    ],
                ])
            );
    }

    public function test_category_page_item_list_positions_continue_across_pages(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);
        $city = $this->harrow();

        foreach (range(1, 13) as $number) {
            $this->vendor($city, $category, name: sprintf('Vendor %02d', $number));
        }

        $this->get(route('category.show', [$category, 'page' => 2]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('structuredData.@graph.0.numberOfItems', 13)
                ->has('structuredData.@graph.0.itemListElement', 1)
                ->where('structuredData.@graph.0.itemListElement.0.position', 13)
                ->where('structuredData.@graph.0.itemListElement.0.name', 'Vendor 13')
                ->where('structuredData.@graph.1.itemListElement.1.item', route('category.show', $category))
            );
    }

    public function test_category_page_without_vendors_has_empty_item_list(): void
    {
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);

        $this->get(route('category.show', $category))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('structuredData.@graph.0.numberOfItems', 0)
                ->where('structuredData.@graph.0.itemListElement', [])
            );
    }

    public function test_location_page_has_item_list_and_breadcrumb_structured_data(): void
    {
        $city = $this->harrow();
        $vendor = $this->vendor($city, Category::factory()->create(['name' => 'Catering', 'slug' => 'catering']), name: 'Spice Kitchen');

        $this->get(route('location.show', $city))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('locations/show')
                ->where('structuredData.@graph.0', [
                    '@type' => 'ItemList',
                    'name' => 'Tamil Vendors in Harrow',
                    'numberOfItems' => 1,
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Spice Kitchen', 'url' => route('vendors.show', $vendor)],
                    ],
                ])
                ->where('structuredData.@graph.1.itemListElement', [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => route('home')],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => 'Harrow', 'item' => route('location.show', $city)],
                ])
            );
    }

    public function test_location_category_page_has_item_list_and_breadcrumb_structured_data(): void
    {
        $city = $this->harrow();
        $category = Category::factory()->create(['name' => 'Photographers', 'slug' => 'photographers']);
        $vendor = $this->vendor($city, $category, name: 'Alpha Studio');
        $this->vendor($city, Category::factory()->create(['name' => 'Catering', 'slug' => 'catering']), name: 'Spice Kitchen');

        $this->get(route('location.category.show', [$city, $category]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('structuredData.@graph.0', [
                    '@type' => 'ItemList',
                    'name' => 'Tamil Photographers in Harrow',
                    'numberOfItems' => 1,
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Alpha Studio', 'url' => route('vendors.show', $vendor)],
                    ],
                ])
                ->where('structuredData.@graph.1.itemListElement', [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => route('home')],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => 'Harrow', 'item' => route('location.show', $city)],
                    ['@type' => 'ListItem', 'position' => 3, 'name' => 'Photographers', 'item' => route('location.category.show', [$city, $category])],
                ])
            );
    }

    public function test_search_page_has_no_listing_structured_data(): void
    {
        $this->get(route('search'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->missing('structuredData')
            );
    }

    public function test_unfiltered_search_page_is_indexable(): void
    {
        $this->get(route('search'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->where('meta.noindex', false)
            );
    }

    public function test_search_results_with_query_are_noindexed(): void
    {
        $this->get(route('search', ['q' => 'dj']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->where('meta.noindex', true)
            );
    }

    public function test_search_results_with_location_or_category_filters_are_noindexed(): void
    {
        $this->get(route('search', ['category' => 'Photography', 'city' => 'London']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('search')
                ->where('meta.noindex', true)
            );
    }

    public function test_search_results_are_not_header_noindexed(): void
    {
        $this->get(route('search', ['q' => 'dj']))
            ->assertOk()
            ->assertHeaderMissing('X-Robots-Tag');
    }

    private function vendor(City $city, Category $category, bool $isActive = true, ?string $name = null): Vendor
    {
        return Vendor::factory()->create([
            ...($name !== null ? ['name' => $name] : []),
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
