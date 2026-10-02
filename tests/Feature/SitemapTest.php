<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
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

    public function test_sitemap_only_includes_location_category_combinations_with_active_vendors(): void
    {
        $country = Country::factory()->create(['name' => 'United Kingdom']);
        $catering = Category::factory()->create(['name' => 'Catering', 'slug' => 'catering']);
        $dj = Category::factory()->create(['name' => 'DJ', 'slug' => 'dj']);
        $florist = Category::factory()->create(['name' => 'Florist', 'slug' => 'florist']);
        $london = City::factory()->create(['country_id' => $country->id, 'name' => 'London', 'slug' => 'london']);
        $birmingham = City::factory()->create(['country_id' => $country->id, 'name' => 'Birmingham', 'slug' => 'birmingham']);

        Vendor::factory()->create([
            'category_id' => $catering->id,
            'city_id' => $london->id,
            'country_id' => $country->id,
            'is_active' => true,
        ]);
        Vendor::factory()->create([
            'category_id' => $dj->id,
            'city_id' => $birmingham->id,
            'country_id' => $country->id,
            'is_active' => true,
        ]);
        Vendor::factory()->create([
            'category_id' => $florist->id,
            'city_id' => $london->id,
            'country_id' => $country->id,
            'is_active' => false,
        ]);

        $response = $this->get(route('sitemap'));

        $response->assertOk();

        $content = $response->getContent();

        $this->assertIsString($content);
        $this->assertStringContainsString('<loc>'.route('location.category.show', [$london, $catering]).'</loc>', $content);
        $this->assertStringContainsString('<loc>'.route('location.category.show', [$birmingham, $dj]).'</loc>', $content);
        $this->assertStringNotContainsString('<loc>'.route('location.category.show', [$london, $dj]).'</loc>', $content);
        $this->assertStringNotContainsString('<loc>'.route('location.category.show', [$birmingham, $catering]).'</loc>', $content);
        $this->assertStringNotContainsString(route('location.category.show', [$london, $florist]), $content);
    }

    public function test_sitemap_uses_page_file_modified_time_for_static_pages(): void
    {
        $this->travelTo(now()->addYear());

        $response = $this->get(route('sitemap'));

        $response->assertOk();

        $content = $response->getContent();

        $this->assertIsString($content);

        foreach ([
            'home' => 'welcome',
            'list-your-business' => 'list-your-business',
            'contact' => 'contact',
            'links' => 'links',
        ] as $routeName => $component) {
            $expected = Carbon::createFromTimestamp(filemtime(resource_path("js/pages/{$component}.tsx")))->toAtomString();

            $this->assertStringContainsString(
                '<loc>'.route($routeName).'</loc>'."\n".'    <lastmod>'.$expected.'</lastmod>',
                $content,
            );
        }
    }
}
