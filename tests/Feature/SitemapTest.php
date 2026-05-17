<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_xml_includes_static_and_dynamic_urls(): void
    {
        $category = Category::factory()->create([
            'name' => 'Catering',
            'slug' => 'catering',
        ]);
        $country = Country::factory()->create(['name' => 'United Kingdom']);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'London',
            'slug' => 'london',
        ]);
        $vendor = Vendor::factory()->create([
            'name' => 'Tasty Bites',
            'slug' => 'tasty-bites',
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
            'is_active' => true,
        ]);

        $inactiveCategory = Category::factory()->create([
            'name' => 'Empty Category',
            'slug' => 'empty-category',
        ]);
        $inactiveCity = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Empty City',
            'slug' => 'empty-city',
        ]);

        $response = $this->get(route('sitemap'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/xml; charset=UTF-8');

        $content = $response->getContent();

        $this->assertIsString($content);
        $this->assertStringContainsString(route('home'), $content);
        $this->assertStringContainsString(route('list-your-business'), $content);
        $this->assertStringContainsString(route('contact'), $content);
        $this->assertStringContainsString(route('links'), $content);
        $this->assertStringContainsString(route('category.show', $category), $content);
        $this->assertStringContainsString(route('location.show', $city), $content);
        $this->assertStringContainsString(route('vendors.show', $vendor), $content);
        $this->assertStringNotContainsString(route('category.show', $inactiveCategory), $content);
        $this->assertStringNotContainsString(route('location.show', $inactiveCity), $content);
    }
}
