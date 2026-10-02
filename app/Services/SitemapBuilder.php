<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Category;
use App\Models\City;
use App\Models\Vendor;
use Carbon\CarbonInterface;
use DateTimeInterface;
use Illuminate\Support\Carbon;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

final class SitemapBuilder
{
    public function build(): Sitemap
    {
        $sitemap = Sitemap::create();

        foreach ($this->staticPages() as $page) {
            $sitemap->add(
                Url::create($page['url'])
                    ->setLastModificationDate($page['lastModified']),
            );
        }

        $categories = Category::query()
            ->whereHas('vendors', fn ($query) => $query->where('is_active', true))
            ->orderBy('name')
            ->get(['id', 'slug', 'updated_at'])
            ->each(function (Category $category) use ($sitemap): void {
                $sitemap->add(
                    Url::create(route('category.show', $category))
                        ->setLastModificationDate($this->lastModified($category->updated_at)),
                );
            });

        $activeCityCategoryPairs = Vendor::active()
            ->select(['city_id', 'category_id'])
            ->distinct()
            ->get()
            ->map(fn (Vendor $vendor): string => $vendor->city_id.':'.$vendor->category_id)
            ->flip();

        City::query()
            ->whereHas('vendors', fn ($query) => $query->where('is_active', true))
            ->orderBy('name')
            ->get(['id', 'slug', 'updated_at'])
            ->each(function (City $city) use ($sitemap): void {
                $sitemap->add(
                    Url::create(route('location.show', $city))
                        ->setLastModificationDate($this->lastModified($city->updated_at)),
                );
            })
            ->each(function (City $city) use ($categories, $activeCityCategoryPairs, $sitemap): void {
                $categories
                    ->filter(fn (Category $category): bool => $activeCityCategoryPairs->has($city->id.':'.$category->id))
                    ->each(function (Category $category) use ($city, $sitemap): void {
                        $sitemap->add(
                            Url::create(route('location.category.show', [$city, $category]))
                                ->setLastModificationDate($this->lastModified($city->updated_at)),
                        );
                    });
            });

        Vendor::active()
            ->orderBy('name')
            ->get(['id', 'slug', 'updated_at'])
            ->each(function (Vendor $vendor) use ($sitemap): void {
                $sitemap->add(
                    Url::create(route('vendors.show', $vendor))
                        ->setLastModificationDate($this->lastModified($vendor->updated_at)),
                );
            });

        return $sitemap;
    }

    /**
     * @return list<array{url: string, lastModified: Carbon}>
     */
    private function staticPages(): array
    {
        $now = Carbon::now();

        return [
            ['url' => route('home'), 'lastModified' => $now],
            ['url' => route('list-your-business'), 'lastModified' => $now],
            ['url' => route('contact'), 'lastModified' => $now],
            ['url' => route('links'), 'lastModified' => $now],
        ];
    }

    private function lastModified(?DateTimeInterface $updatedAt): CarbonInterface
    {
        if ($updatedAt instanceof CarbonInterface) {
            return $updatedAt;
        }

        return $updatedAt !== null
            ? Carbon::instance($updatedAt)
            : Carbon::now();
    }
}
