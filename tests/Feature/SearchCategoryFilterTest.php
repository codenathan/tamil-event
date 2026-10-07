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

        $this->get('/search?category=Photography')
            ->assertRedirect(route('category.show', 'photography'));

        $this->get(route('category.show', 'photography'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('vendors.data', 1)
                ->where('vendors.data.0.name', 'Photo Pro')
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

        $this->get('/search?category=Photography&city=Colombo&country=Sri+Lanka')
            ->assertRedirect(route('location.category.show', ['colombo', 'photography']));

        $this->get(route('location.category.show', ['colombo', 'photography']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('vendors.data', 1)
                ->where('vendors.data.0.name', 'Colombo Photo')
            );
    }

    public function test_search_redirects_multi_word_names_to_slugged_pages(): void
    {
        $category = Category::factory()->create(['name' => 'Wedding Decor']);
        $country = Country::factory()->create(['name' => 'United Kingdom']);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Milton Keynes',
        ]);

        $this->assertSame('wedding-decor', $category->slug);
        $this->assertSame('milton-keynes', $city->slug);

        $this->get('/search?category=Wedding+Decor')
            ->assertRedirect(route('category.show', $category));

        $this->get('/search?city=Milton+Keynes')
            ->assertRedirect(route('location.show', $city));

        $this->get('/search?category=Wedding+Decor&city=Milton+Keynes&country=United+Kingdom')
            ->assertRedirect(route('location.category.show', [$city, $category]));

        $this->followingRedirects()->get('/search?category=Wedding+Decor')->assertOk();
        $this->followingRedirects()->get('/search?city=Milton+Keynes')->assertOk();
        $this->followingRedirects()
            ->get('/search?category=Wedding+Decor&city=Milton+Keynes&country=United+Kingdom')
            ->assertOk();
    }
}
