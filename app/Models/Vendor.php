<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VendorStatusEnum;
use Database\Factories\VendorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * @property int $id
 * @property int|null $user_id
 * @property int|null $category_id
 * @property int $city_id
 * @property int $country_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $website
 * @property string|null $social_instagram
 * @property string|null $social_facebook
 * @property array<int, string>|null $services
 * @property bool $is_active
 * @property VendorStatusEnum $status
 * @property-read string|null $featured_image_url
 * @property-read array<int, array{id: int, url: string}> $images
 * @property-read Collection<int, Media> $media
 *
 * @method static VendorFactory factory($count = null, $state = [])
 * @method static Builder<static>|Vendor active()
 * @method static Builder<static>|Vendor newModelQuery()
 * @method static Builder<static>|Vendor newQuery()
 * @method static Builder<static>|Vendor query()
 *
 * @mixin Model
 */
#[Fillable([
    'user_id',
    'category_id',
    'city_id',
    'country_id',
    'name',
    'slug',
    'description',
    'phone',
    'email',
    'website',
    'social_instagram',
    'social_facebook',
    'services',
    'is_active',
    'status',
])]
final class Vendor extends Model implements HasMedia
{
    /** @use HasFactory<VendorFactory> */
    use HasFactory, HasSlug, InteractsWithMedia;

    /**
     * @var list<string>
     */
    protected $hidden = [
        'media',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'featured_image_url',
        'images',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('featured')->singleFile();
        $this->addMediaCollection('gallery');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'status' => VendorStatusEnum::class,
            'services' => 'array',
        ];
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('featured');

        if ($media === null) {
            return null;
        }

        return $this->resolveMediaUrlForFrontend($media);
    }

    /**
     * @return array<int, array{id: int, url: string}>
     */
    public function getImagesAttribute(): array
    {
        return $this->getMedia('gallery')
            ->map(fn (Media $media): array => [
                'id' => $media->id,
                'url' => $this->resolveMediaUrlForFrontend($media),
            ])
            ->values()
            ->all();
    }

    private function resolveMediaUrlForFrontend(Media $media): string
    {
        $url = $media->getUrl();

        if ($media->disk !== 'public') {
            return $url;
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            $path = parse_url($url, PHP_URL_PATH);

            if (is_string($path) && str_starts_with($path, '/storage/')) {
                return $path;
            }
        }

        return $url;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * @return HasMany<Enquire, $this>
     */
    public function enquires(): HasMany
    {
        return $this->hasMany(Enquire::class);
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
