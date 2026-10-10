<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VendorImageConversionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_featured_upload_generates_resized_webp_conversions(): void
    {
        $vendor = Vendor::factory()->create();
        $media = $vendor->addMedia(UploadedFile::fake()->image('featured.jpg', 3000, 2000))
            ->toMediaCollection('featured');

        $this->assertTrue($media->hasGeneratedConversion('large'));
        $this->assertTrue($media->hasGeneratedConversion('thumb'));

        $largePath = $media->getPath('large');
        $thumbPath = $media->getPath('thumb');

        $this->assertStringEndsWith('.webp', $largePath);
        $this->assertSame('image/webp', mime_content_type($largePath));
        $this->assertSame([1600, 1067], array_slice(getimagesize($largePath), 0, 2));
        $this->assertSame([800, 533], array_slice(getimagesize($thumbPath), 0, 2));
    }

    public function test_small_upload_is_converted_without_upscaling(): void
    {
        $vendor = Vendor::factory()->create();
        $media = $vendor->addMedia(UploadedFile::fake()->image('gallery.png', 400, 300))
            ->toMediaCollection('gallery');

        $this->assertSame('image/webp', mime_content_type($media->getPath('thumb')));
        $this->assertSame([400, 300], array_slice(getimagesize($media->getPath('thumb')), 0, 2));
        $this->assertSame([400, 300], array_slice(getimagesize($media->getPath('large')), 0, 2));
    }

    public function test_image_urls_point_to_webp_conversions(): void
    {
        $vendor = Vendor::factory()->create();
        $vendor->addMedia(UploadedFile::fake()->image('featured.jpg', 1200, 900))
            ->toMediaCollection('featured');
        $vendor->addMedia(UploadedFile::fake()->image('gallery.jpg', 1200, 900))
            ->toMediaCollection('gallery');

        $vendor = $vendor->fresh();

        $this->assertStringEndsWith('/conversions/featured-large.webp', $vendor->featured_image_url);
        $this->assertStringEndsWith('/conversions/featured-thumb.webp', $vendor->featured_thumbnail_url);
        $this->assertStringEndsWith('/conversions/gallery-thumb.webp', $vendor->images[0]['url']);
    }

    public function test_image_urls_fall_back_to_original_when_conversion_is_missing(): void
    {
        $vendor = Vendor::factory()->create();
        $media = $vendor->addMedia(UploadedFile::fake()->image('featured.jpg', 1200, 900))
            ->toMediaCollection('featured');

        $media->markAsConversionNotGenerated('large')
            ->markAsConversionNotGenerated('thumb')
            ->save();

        $vendor = $vendor->fresh();

        $this->assertStringEndsWith('/featured.jpg', $vendor->featured_image_url);
        $this->assertStringEndsWith('/featured.jpg', $vendor->featured_thumbnail_url);
    }

    public function test_image_urls_are_null_without_featured_image(): void
    {
        $vendor = Vendor::factory()->create();

        $this->assertNull($vendor->featured_image_url);
        $this->assertNull($vendor->featured_thumbnail_url);
        $this->assertSame([], $vendor->images);
    }
}
