<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Vendor;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListingStructuredData
{
    /**
     * Build the JSON-LD graph for a vendor listing page.
     *
     * @param  LengthAwarePaginator<int, Vendor>  $vendors
     * @param  list<array{name: string, url: string}>  $breadcrumbs  Trail after "Home", ending with the current page.
     * @return array<string, mixed>
     */
    public function build(string $name, LengthAwarePaginator $vendors, array $breadcrumbs): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                $this->itemList($name, $vendors),
                $this->breadcrumbList($breadcrumbs),
            ],
        ];
    }

    /**
     * @param  LengthAwarePaginator<int, Vendor>  $vendors
     * @return array<string, mixed>
     */
    private function itemList(string $name, LengthAwarePaginator $vendors): array
    {
        $firstPosition = $vendors->firstItem() ?? 1;

        return [
            '@type' => 'ItemList',
            'name' => $name,
            'numberOfItems' => $vendors->total(),
            'itemListElement' => collect($vendors->items())
                ->values()
                ->map(fn (Vendor $vendor, int $index): array => [
                    '@type' => 'ListItem',
                    'position' => $firstPosition + $index,
                    'name' => $vendor->name,
                    'url' => route('vendors.show', $vendor),
                ])
                ->all(),
        ];
    }

    /**
     * @param  list<array{name: string, url: string}>  $breadcrumbs
     * @return array<string, mixed>
     */
    private function breadcrumbList(array $breadcrumbs): array
    {
        $trail = [['name' => 'Home', 'url' => route('home')], ...$breadcrumbs];

        return [
            '@type' => 'BreadcrumbList',
            'itemListElement' => collect($trail)
                ->map(fn (array $crumb, int $index): array => [
                    '@type' => 'ListItem',
                    'position' => $index + 1,
                    'name' => $crumb['name'],
                    'item' => $crumb['url'],
                ])
                ->all(),
        ];
    }
}
