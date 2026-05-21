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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UpdateVendorListingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_vendor_can_update_listing_images(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->assignRole('vendor');

        $category = Category::factory()->create(['name' => 'Photography']);
        $country = Country::factory()->create(['name' => 'United Kingdom']);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'London',
        ]);

        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
            'email' => $user->email,
        ]);

        $vendor->addMedia(UploadedFile::fake()->image('old-featured.jpg'))
            ->toMediaCollection('featured');

        $existingGallery = $vendor->addMedia(UploadedFile::fake()->image('gallery-1.jpg'))
            ->toMediaCollection('gallery');

        $response = $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'description' => 'Updated description.',
            'phone' => '+441234567890',
            'website' => 'https://example.com',
            'social_instagram' => '@mybusiness',
            'social_facebook' => 'mybusinesspage',
            'services' => ['Portraits'],
            'featured_image' => UploadedFile::fake()->image('new-featured.jpg'),
            'new_images' => [
                UploadedFile::fake()->image('gallery-2.jpg'),
            ],
            'delete_gallery_ids' => [$existingGallery->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $vendor->refresh();

        $this->assertSame('Updated description.', $vendor->description);
        $this->assertSame('@mybusiness', $vendor->social_instagram);
        $this->assertSame('mybusinesspage', $vendor->social_facebook);
        $this->assertNotNull($vendor->getFirstMedia('featured'));
        $this->assertStringContainsString('new-featured', $vendor->getFirstMedia('featured')->file_name);
        $this->assertNull($vendor->media()->whereKey($existingGallery->id)->first());
        $this->assertCount(1, $vendor->getMedia('gallery'));
    }

    public function test_vendor_can_upload_multiple_gallery_images(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->assignRole('vendor');

        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'new_images' => [
                UploadedFile::fake()->image('gallery-a.jpg'),
                UploadedFile::fake()->image('gallery-b.jpg'),
            ],
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertCount(2, $vendor->refresh()->getMedia('gallery'));
    }
}
