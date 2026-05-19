<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BlogStatusEnum;
use Database\Factories\BlogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $slug
 * @property string|null $excerpt
 * @property string $content
 * @property BlogStatusEnum $status
 * @property Carbon|null $published_at
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property string|null $meta_keywords
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read string|null $featured_image_url
 * @property-read Collection<int, Media> $media
 *
 * @method static BlogFactory factory($count = null, $state = [])
 * @method static Builder<static>|Blog newModelQuery()
 * @method static Builder<static>|Blog newQuery()
 * @method static Builder<static>|Blog query()
 * @method static Builder<static>|Blog published()
 *
 * @mixin Model
 */
#[Fillable([
    'user_id',
    'title',
    'slug',
    'excerpt',
    'content',
    'status',
    'published_at',
    'meta_title',
    'meta_description',
    'meta_keywords',
])]
final class Blog extends Model implements HasMedia
{
    /** @use HasFactory<BlogFactory> */
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
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('featured')->singleFile();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => BlogStatusEnum::class,
            'published_at' => 'datetime',
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

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', BlogStatusEnum::PUBLISHED)
            ->where(function (Builder $q): void {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }
}
