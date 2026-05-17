<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->string('q')->trim()->value();
        $city = $request->string('city')->trim()->value();
        $country = $request->string('country')->trim()->value();

        $vendors = Vendor::active()
            ->with(['category', 'city', 'country', 'media'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('name', 'like', "%{$query}%")
                        ->orWhereHas('city', function ($cityQ) use ($query) {
                            $cityQ->where('name', 'like', "%{$query}%");
                        })
                        ->orWhereHas('category', function ($categoryQ) use ($query) {
                            $categoryQ->where('name', 'like', "%{$query}%");
                        })
                        ->orWhereHas('country', function ($countryQ) use ($query) {
                            $countryQ->where('name', 'like', "%{$query}%");
                        });
                });
            })
            ->when($city !== '' && $country !== '', function ($q) use ($city, $country) {
                $q->whereHas('city', function ($cityQ) use ($city, $country) {
                    $cityQ->where('name', $city)
                        ->whereHas('country', function ($countryQ) use ($country) {
                            $countryQ->where('name', $country);
                        });
                });
            })
            ->when($city === '' && $country !== '', function ($q) use ($country) {
                $q->whereHas('country', function ($countryQ) use ($country) {
                    $countryQ->where('name', $country);
                });
            })
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('search', [
            'vendors' => $vendors,
            'filters' => [
                'q' => $query,
                'city' => $city,
                'country' => $country,
            ],
            'meta' => $this->searchIndexMeta($request, $query, $city, $country),
        ]);
    }

    /**
     * @return array{title: string, description: string, canonicalUrl: string}
     */
    private function searchIndexMeta(Request $request, string $query, string $city, string $country): array
    {
        $hasFilters = $query !== '' || $city !== '' || $country !== '';
        $site = 'TamilEventPlanner';

        if ($hasFilters) {
            $parts = array_values(array_filter([
                $query,
                $city !== '' ? $city : $country,
            ], fn (string $v): bool => $v !== ''));

            $label = implode(' in ', $parts);
            $heading = 'Results for "'.$label.'"';
            $description = $label !== ''
                ? 'Find Tamil event vendors for '.$label.'. Browse photographers, caterers, decorators, and more on TamilEventPlanner.'
                : 'Find Tamil event vendors on TamilEventPlanner. Browse photographers, caterers, decorators, and more.';
        } else {
            $heading = 'All Vendors';
            $description = 'Search Tamil event vendors worldwide. Browse photographers, caterers, decorators, and more.';
        }

        return [
            'title' => $heading.' — '.$site,
            'description' => $description,
            'canonicalUrl' => $request->fullUrl(),
        ];
    }

    public function show(Vendor $vendor): Response
    {
        abort_if(! $vendor->is_active, 404);

        $vendor->load(['category', 'city', 'country', 'media']);

        $featured = $vendor->featured_image_url;
        $ogImageUrl = null;
        if (is_string($featured) && $featured !== '') {
            $ogImageUrl = str_starts_with($featured, 'http://') || str_starts_with($featured, 'https://')
                ? $featured
                : url($featured);
        }

        $location = collect([$vendor->city?->name, $vendor->country?->name])
            ->filter()
            ->implode(', ');

        $defaultTitle = sprintf(
            '%s — Tamil %s in %s — TamilEventPlanner',
            $vendor->name,
            $vendor->category?->name ?? 'vendor',
            $vendor->city?->name ?? 'your area',
        );

        $defaultDescription = trim(sprintf(
            '%s Contact %s for your Tamil event in %s.',
            $vendor->description ?? '',
            $vendor->name,
            $location !== '' ? $location : 'your area',
        ));

        return Inertia::render('vendors/show', [
            'vendor' => $vendor,
            'meta' => [
                'title' => $vendor->seo_title ?: $defaultTitle,
                'description' => $vendor->seo_description ?: $defaultDescription,
            ],
            'ogImageUrl' => $ogImageUrl,
            'canonicalUrl' => route('vendors.show', $vendor),
        ]);
    }
}
