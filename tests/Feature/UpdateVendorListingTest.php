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
use Spatie\MediaLibrary\MediaCollections\Models\Media;
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

    public function test_vendor_can_upload_images_up_to_five_megabytes(): void
    {
        Storage::fake('public');
        [$user, $vendor] = $this->vendorUser();

        $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'featured_image' => UploadedFile::fake()->image('featured.jpg')->size(5120),
            'new_images' => [UploadedFile::fake()->image('gallery.jpg')->size(4096)],
        ])->assertRedirect()->assertSessionHasNoErrors();

        $vendor->refresh();
        $this->assertNotNull($vendor->getFirstMedia('featured'));
        $this->assertCount(1, $vendor->getMedia('gallery'));
    }

    public function test_vendor_cannot_upload_images_larger_than_five_megabytes(): void
    {
        Storage::fake('public');
        [$user, $vendor] = $this->vendorUser();

        $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'featured_image' => UploadedFile::fake()->image('featured.jpg')->size(5121),
            'new_images' => [UploadedFile::fake()->image('gallery.jpg')->size(5121)],
        ])->assertSessionHasErrors(['featured_image', 'new_images.0']);

        $vendor->refresh();
        $this->assertNull($vendor->getFirstMedia('featured'));
        $this->assertCount(0, $vendor->getMedia('gallery'));
    }

    public function test_vendor_cannot_upload_more_than_six_new_gallery_images(): void
    {
        Storage::fake('public');
        [$user, $vendor] = $this->vendorUser();

        $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'new_images' => $this->fakeImages(7),
        ])->assertSessionHasErrors('new_images');

        $this->assertCount(0, $vendor->refresh()->getMedia('gallery'));
    }

    public function test_vendor_gallery_limit_includes_existing_images(): void
    {
        Storage::fake('public');
        [$user, $vendor] = $this->vendorUser();
        $this->addGalleryImages($vendor, 5);

        $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'new_images' => $this->fakeImages(2),
        ])->assertSessionHasErrors('new_images');

        $this->assertCount(5, $vendor->refresh()->getMedia('gallery'));
    }

    public function test_vendor_can_replace_gallery_images_when_at_the_limit(): void
    {
        Storage::fake('public');
        [$user, $vendor] = $this->vendorUser();
        $existing = $this->addGalleryImages($vendor, 6);

        $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => $vendor->name,
            'email' => $vendor->email,
            'new_images' => $this->fakeImages(2),
            'delete_gallery_ids' => [$existing[0]->id, $existing[1]->id],
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertCount(6, $vendor->refresh()->getMedia('gallery'));
    }

    public function test_vendor_over_the_gallery_limit_can_still_update_other_details(): void
    {
        Storage::fake('public');
        [$user, $vendor] = $this->vendorUser();
        $this->addGalleryImages($vendor, 7);

        $this->actingAs($user)->patch(route('dashboard.listing.update'), [
            'name' => 'Renamed Business',
            'email' => $vendor->email,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSame('Renamed Business', $vendor->refresh()->name);
    }

    /**
     * @return array{0: User, 1: Vendor}
     */
    private function vendorUser(): array
    {
        $user = User::factory()->create();
        $user->assignRole('vendor');

        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return [$user, $vendor];
    }

    /**
     * @return list<UploadedFile>
     */
    private function fakeImages(int $count): array
    {
        return array_map(
            fn (int $i): UploadedFile => UploadedFile::fake()->image("gallery-{$i}.jpg"),
            range(1, $count),
        );
    }

    /**
     * @return list<Media>
     */
    private function addGalleryImages(Vendor $vendor, int $count): array
    {
        return array_map(
            fn (UploadedFile $file): Media => $vendor->addMedia($file)->toMediaCollection('gallery'),
            $this->fakeImages($count),
        );
    }
}
