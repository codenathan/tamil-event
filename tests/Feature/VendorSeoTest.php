<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\User;
use App\Models\Vendor;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorSeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_save_vendor_seo_fields(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $category = Category::factory()->create(['name' => 'Catering']);
        $country = Country::factory()->create(['name' => 'United Kingdom']);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'London',
        ]);
        $vendor = Vendor::factory()->create([
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
        ]);

        $response = $this->actingAs($admin)->patch(route('admin.vendors.update', $vendor), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'category_id' => $category->id,
            'city_id' => $city->id,
            'description' => $vendor->description,
            'phone' => $vendor->phone,
            'website' => $vendor->website,
            'seo_title' => 'Custom SEO Title',
            'seo_description' => 'Custom SEO description for search engines.',
        ]);

        $response->assertRedirect(route('admin.vendors.index'));

        $vendor->refresh();

        $this->assertSame('Custom SEO Title', $vendor->seo_title);
        $this->assertSame(
            'Custom SEO description for search engines.',
            $vendor->seo_description,
        );
    }

    public function test_vendor_show_page_uses_default_seo_meta_when_custom_fields_are_empty(): void
    {
        $category = Category::factory()->create(['name' => 'Weddings Decor']);
        $country = Country::factory()->create(['name' => 'United Kingdom']);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Harrow',
        ]);

        $vendor = Vendor::factory()->create([
            'name' => 'Aarya Weddings & Events',
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
            'description' => 'Weddings, Mehndi, Reception Décor.',
            'is_active' => true,
            'seo_title' => null,
            'seo_description' => null,
        ]);

        $this->get(route('vendors.show', $vendor))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('vendors/show')
                ->where('meta.title', 'Aarya Weddings & Events - Tamil - Weddings Decor in Harrow, United Kingdom')
                ->where('meta.description', 'Weddings, Mehndi, Reception Décor.')
            );
    }

    public function test_vendor_show_page_uses_custom_seo_meta_when_set(): void
    {
        $category = Category::factory()->create(['name' => 'Photography']);
        $country = Country::factory()->create(['name' => 'United Kingdom']);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'London',
        ]);

        $vendor = Vendor::factory()->create([
            'name' => 'Studio Shots',
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
            'is_active' => true,
            'seo_title' => 'Studio Shots | London Photographer',
            'seo_description' => 'Book Studio Shots for Tamil weddings in London.',
        ]);

        $this->get(route('vendors.show', $vendor))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('vendors/show')
                ->where('meta.title', 'Studio Shots | London Photographer')
                ->where('meta.description', 'Book Studio Shots for Tamil weddings in London.')
            );
    }
}
