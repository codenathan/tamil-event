<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\User;
use App\Models\Vendor;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class VendorImageValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        Notification::fake();
        Storage::fake('public');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_create_vendor_with_images_up_to_five_megabytes(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.vendors.store'), [
                ...$this->vendorPayload(),
                'featured_image' => UploadedFile::fake()->image('featured.jpg')->size(5120),
                'new_images' => $this->fakeImages(6),
            ])
            ->assertRedirect(route('admin.vendors.index'))
            ->assertSessionHasNoErrors();

        $vendor = Vendor::query()->where('email', 'images@example.com')->firstOrFail();
        $this->assertNotNull($vendor->getFirstMedia('featured'));
        $this->assertCount(6, $vendor->getMedia('gallery'));
    }

    public function test_admin_cannot_upload_images_larger_than_five_megabytes(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.vendors.store'), [
                ...$this->vendorPayload(),
                'featured_image' => UploadedFile::fake()->image('featured.jpg')->size(5121),
                'new_images' => [UploadedFile::fake()->image('gallery.jpg')->size(5121)],
            ])
            ->assertSessionHasErrors(['featured_image', 'new_images.0']);

        $this->assertDatabaseMissing('vendors', ['email' => 'images@example.com']);
    }

    public function test_admin_cannot_create_vendor_with_more_than_six_gallery_images(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.vendors.store'), [
                ...$this->vendorPayload(),
                'new_images' => $this->fakeImages(7),
            ])
            ->assertSessionHasErrors('new_images');

        $this->assertDatabaseMissing('vendors', ['email' => 'images@example.com']);
    }

    public function test_admin_gallery_limit_includes_existing_images_on_update(): void
    {
        $vendor = $this->createVendor();
        $this->addGalleryImages($vendor, 5);

        $this->actingAs($this->admin)
            ->put(route('admin.vendors.update', $vendor), [
                ...$this->vendorPayload($vendor),
                'new_images' => $this->fakeImages(2),
            ])
            ->assertSessionHasErrors('new_images');

        $this->assertCount(5, $vendor->refresh()->getMedia('gallery'));
    }

    public function test_admin_can_replace_gallery_images_when_at_the_limit(): void
    {
        $vendor = $this->createVendor();
        $existing = $this->addGalleryImages($vendor, 6);

        $this->actingAs($this->admin)
            ->put(route('admin.vendors.update', $vendor), [
                ...$this->vendorPayload($vendor),
                'new_images' => $this->fakeImages(1),
                'delete_gallery_ids' => [$existing[0]->id],
            ])
            ->assertRedirect(route('admin.vendors.index'))
            ->assertSessionHasNoErrors();

        $this->assertCount(6, $vendor->refresh()->getMedia('gallery'));
    }

    /**
     * @return array<string, mixed>
     */
    private function vendorPayload(?Vendor $vendor = null): array
    {
        if ($vendor !== null) {
            return [
                'name' => $vendor->name,
                'email' => $vendor->email,
                'category_id' => $vendor->category_id,
                'city_id' => $vendor->city_id,
            ];
        }

        $country = Country::factory()->create(['name' => 'United Kingdom']);

        return [
            'name' => 'Image Vendor',
            'email' => 'images@example.com',
            'category_id' => Category::factory()->create(['name' => 'Photography'])->id,
            'city_id' => City::factory()->create(['country_id' => $country->id, 'name' => 'London'])->id,
        ];
    }

    private function createVendor(): Vendor
    {
        $payload = $this->vendorPayload();

        return Vendor::factory()->create([
            'email' => $payload['email'],
            'category_id' => $payload['category_id'],
            'city_id' => $payload['city_id'],
            'country_id' => City::findOrFail($payload['city_id'])->country_id,
        ]);
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
