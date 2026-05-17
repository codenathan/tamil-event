<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CountryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property-read Collection<int, City> $cities
 * @property-read Collection<int, Vendor> $vendors
 *
 * @method static CountryFactory factory($count = null, $state = [])
 * @method static Builder<static>|Country hasVendors()
 * @method static Builder<static>|Country newModelQuery()
 * @method static Builder<static>|Country newQuery()
 * @method static Builder<static>|Country query()
 *
 * @mixin Model
 */
#[Fillable(['name', 'slug'])]
final class Country extends Model
{
    /** @use HasFactory<CountryFactory> */
    use HasFactory, HasSlug;

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    /**
     * @return HasMany<City, $this>
     */
    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    /**
     * @return HasMany<Vendor, $this>
     */
    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class);
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeHasVendors(Builder $query): Builder
    {
        return $query->whereHas('vendors');
    }

    /**
     * @return array<string, list<string>>
     */
    public static function locationsByCountry(bool $withVendorsOnly = false): array
    {
        $query = self::query()->orderBy('name');

        if ($withVendorsOnly) {
            $query->hasVendors();
        }

        return $query
            ->with(['cities' => function (HasMany $cityQuery) use ($withVendorsOnly): void {
                $cityQuery->orderBy('name');

                if ($withVendorsOnly) {
                    $cityQuery->hasVendors();
                }
            }])
            ->get(['id', 'name', 'slug'])
            ->mapWithKeys(fn (self $country): array => [
                $country->name => $country->cities->pluck('name')->all(),
            ])
            ->all();
    }
}
