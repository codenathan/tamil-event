<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\VendorStatusEnum;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\User;
use App\Models\Vendor;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class VendorCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_submit_list_your_business_with_valid_payload(): void
    {
        $category = Category::factory()->create([
            'name' => 'Photography',
        ]);
        $country = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);

        $response = $this->from(route('list-your-business'))->post(route('list-your-business.store'), [
            'businessName' => 'Acme Photography',
            'category' => $category->slug,
            'country' => $country->name,
            'city' => $city->name,
            'description' => 'Professional wedding photography.',
            'phone' => '+94771234567',
            'email' => 'vendor@example.com',
            'website' => 'https://acme.example',
            'instagram' => '',
            'facebook' => '',
            'services' => ['Weddings', 'Portraits'],
            'agreeTerms' => true,
        ]);

        $response->assertRedirect(route('list-your-business'));

        $this->assertDatabaseHas('vendors', [
            'email' => 'vendor@example.com',
            'name' => 'Acme Photography',
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
            'is_active' => false,
            'status' => VendorStatusEnum::PENDING->value,
        ]);

        $vendor = Vendor::query()->where('email', 'vendor@example.com')->first();
        $this->assertNotNull($vendor);
        $this->assertSame(['Weddings', 'Portraits'], $vendor->services);
    }

    public function test_guest_can_submit_list_your_business_with_featured_and_gallery_images(): void
    {
        $category = Category::factory()->create([
            'name' => 'Photography',
        ]);
        $country = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);

        $featured = UploadedFile::fake()->image('featured.jpg', 800, 600);
        $gallery = UploadedFile::fake()->image('gallery.jpg', 400, 300);

        $response = $this->from(route('list-your-business'))->post(route('list-your-business.store'), [
            'businessName' => 'Acme Photography',
            'category' => $category->slug,
            'country' => $country->name,
            'city' => $city->name,
            'description' => 'Professional wedding photography.',
            'phone' => '+94771234567',
            'email' => 'photos@example.com',
            'website' => '',
            'instagram' => '',
            'facebook' => '',
            'services' => [],
            'agreeTerms' => true,
            'featuredImage' => $featured,
            'images' => [$gallery],
        ]);

        $response->assertRedirect(route('list-your-business'));

        $vendor = Vendor::query()->where('email', 'photos@example.com')->first();
        $this->assertNotNull($vendor);
        $this->assertNotNull($vendor->getFirstMedia('featured'));
        $this->assertCount(1, $vendor->getMedia('gallery'));
    }

    public function test_admin_can_create_vendor_from_backend(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Notification::fake();

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $category = Category::factory()->create([
            'name' => 'Catering',
        ]);
        $country = Country::factory()->create([
            'name' => 'Sri Lanka',
            'slug' => 'sri-lanka',
        ]);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.vendors.store'), [
            'name' => 'Delicious Catering',
            'email' => 'catering@example.com',
            'category_id' => $category->id,
            'city_id' => $city->id,
            'description' => 'Great food.',
            'phone' => '+94111222333',
            'website' => 'https://catering.example',
            'social_instagram' => 'delicious_catering',
            'social_facebook' => 'DeliciousCateringLK',
            'services' => ['Buffets', 'Desserts'],
        ]);

        $response->assertRedirect(route('admin.vendors.index'));

        $this->assertDatabaseHas('vendors', [
            'email' => 'catering@example.com',
            'name' => 'Delicious Catering',
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
            'is_active' => true,
            'social_instagram' => 'delicious_catering',
            'social_facebook' => 'DeliciousCateringLK',
        ]);

        $vendor = Vendor::query()->where('email', 'catering@example.com')->first();
        $this->assertNotNull($vendor);
        $this->assertSame('delicious_catering', $vendor->social_instagram);
        $this->assertSame('DeliciousCateringLK', $vendor->social_facebook);
        $this->assertSame(['Buffets', 'Desserts'], $vendor->services);
        $this->assertNotNull($vendor->user_id);

        $linkedUser = User::query()->where('email', 'catering@example.com')->first();
        $this->assertNotNull($linkedUser);
        $this->assertTrue($linkedUser->hasRole('vendor'));
    }
}
