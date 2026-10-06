<?php

namespace App\Http\Controllers;

use App\Models\SearchLog;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SearchController extends Controller
{
    private const LAST_SEARCH_SESSION_KEY = 'search_log.last_search';

    private const REPEAT_SEARCH_WINDOW_SECONDS = 60;

    public function index(Request $request)
    {
        $query = $request->string('q')->trim()->value();
        $city = $request->string('city')->trim()->value();
        $country = $request->string('country')->trim()->value();
        $category = $request->string('category')->trim()->value();

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
            ->when($category !== '', function ($q) use ($category) {
                $q->whereHas('category', function ($categoryQ) use ($category) {
                    $categoryQ->where('name', $category);
                });
            })
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $this->logSearch($request, $query, $city, $country, $category, $vendors->total());

        return Inertia::render('search', [
            'vendors' => $vendors,
            'filters' => [
                'q' => $query,
                'city' => $city,
                'country' => $country,
                'category' => $category,
            ],
            'meta' => $this->searchIndexMeta($request, $query, $city, $country, $category),
        ]);
    }

    /**
     * Record the search so admins can see what visitors look for.
     */
    private function logSearch(Request $request, string $query, string $city, string $country, string $category, int $resultsCount): void
    {
        if (! $this->shouldLogSearch($request, $query, $city, $country, $category)) {
            return;
        }

        if ($this->isRepeatedSearch($request, $query, $city, $country, $category)) {
            return;
        }

        try {
            SearchLog::create([
                'user_id' => $request->user()?->id,
                'query' => $query !== '' ? $query : null,
                'category' => $category !== '' ? $category : null,
                'city' => $city !== '' ? $city : null,
                'country' => $country !== '' ? $country : null,
                'results_count' => $resultsCount,
                'source' => $this->searchSource($request),
            ]);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /**
     * Decide whether this request counts as a new search worth logging.
     *
     * Every visit to /search passes through here: typed searches, but also
     * pagination clicks (?page=2), page refreshes, and bare visits with no filters.
     */
    private function shouldLogSearch(Request $request, string $query, string $city, string $country, string $category): bool
    {
        if ($query === '' && $city === '' && $country === '' && $category === '') {
            return false;
        }

        if ((int) $request->input('page', 1) > 1) {
            return false;
        }

        return ! preg_match('/bot|crawl|spider|slurp|facebookexternalhit|preview/i', (string) $request->userAgent());
    }

    /**
     * Detect refreshes and back-button visits: the same search from the same
     * session within the dedupe window. The window slides, so each repeat
     * pushes it forward.
     */
    private function isRepeatedSearch(Request $request, string $query, string $city, string $country, string $category): bool
    {
        if (! $request->hasSession()) {
            return false;
        }

        $session = $request->session();
        $fingerprint = sha1(json_encode([mb_strtolower($query), $category, $city, $country]));
        $now = now()->getTimestamp();

        /** @var array{fingerprint?: string, seen_at?: int} $lastSearch */
        $lastSearch = $session->get(self::LAST_SEARCH_SESSION_KEY, []);

        $session->put(self::LAST_SEARCH_SESSION_KEY, [
            'fingerprint' => $fingerprint,
            'seen_at' => $now,
        ]);

        return ($lastSearch['fingerprint'] ?? null) === $fingerprint
            && $now - ($lastSearch['seen_at'] ?? 0) < self::REPEAT_SEARCH_WINDOW_SECONDS;
    }

    /**
     * Work out which page the search was submitted from using the Referer path.
     */
    private function searchSource(Request $request): string
    {
        $referer = $request->headers->get('referer');

        if ($referer === null) {
            return SearchLog::SOURCE_OTHER;
        }

        return match (rtrim((string) parse_url($referer, PHP_URL_PATH), '/')) {
            '' => SearchLog::SOURCE_HOME,
            '/search' => SearchLog::SOURCE_SEARCH,
            default => SearchLog::SOURCE_OTHER,
        };
    }

    /**
     * Filtered result pages are noindexed so arbitrary queries don't get indexed.
     *
     * @return array{title: string, description: string, canonicalUrl: string, noindex: bool}
     */
    private function searchIndexMeta(Request $request, string $query, string $city, string $country, string $category): array
    {
        $hasFilters = $query !== '' || $city !== '' || $country !== '' || $category !== '';

        if ($hasFilters) {
            $parts = array_values(array_filter([
                $query,
                $category !== '' ? $category : null,
                $city !== '' ? $city : $country,
            ], fn (?string $v): bool => $v !== '' && $v !== null));

            $label = implode(' in ', $parts);
            $heading = 'Results for "'.$label.'"';
            $description = $label !== ''
                ? 'Find Tamil event vendors for '.$label.'. Browse photographers, caterers, decorators, and more on TamilEventPlanner.'
                : 'Find Tamil event vendors on TamilEventPlanner. Browse photographers, caterers, decorators, and more.';
        } else {
            $heading = 'Tamil Wedding and Event Vendors';
            $description = 'Search Tamil event vendors worldwide. Browse photographers, caterers, decorators, and more.';
        }

        return [
            'title' => $heading,
            'description' => $description,
            'canonicalUrl' => $request->fullUrl(),
            'noindex' => $hasFilters,
        ];
    }

    public function show(Vendor $vendor): Response
    {
        abort_if(! $vendor->is_active, 404);

        $vendor->load(['category', 'city', 'country', 'media']);

        $featured = $vendor->featured_image_url;
        $ogImageUrl = null;
        $ogImageWidth = null;
        $ogImageHeight = null;
        $ogImageType = null;

        if (is_string($featured) && $featured !== '') {
            $ogImageUrl = str_starts_with($featured, 'http://') || str_starts_with($featured, 'https://')
                ? $featured
                : url($featured);

            $featuredMedia = $vendor->getFirstMedia('featured');

            $ogImageWidth = $featuredMedia->getCustomProperty('width')
                ?? getimagesize($featuredMedia->getPath())[0]
                ?? null;
            $ogImageHeight = $featuredMedia->getCustomProperty('height')
                ?? getimagesize($featuredMedia->getPath())[1]
                ?? null;

            $ogImageType = $featuredMedia->getAttribute('mime_type');
        }

        $location = collect([$vendor->city?->name, $vendor->country?->name])
            ->filter()
            ->implode(', ');

        $categoryName = $vendor->category?->name ?? 'Vendor';

        $defaultTitle = $location !== ''
            ? sprintf('%s - Tamil %s in %s', $vendor->name, $categoryName, $location)
            : sprintf('%s - Tamil %s', $vendor->name, $categoryName);

        $defaultDescription = trim((string) ($vendor->description ?? ''));

        $locationCategoryUrl = route('location.category.show', [$vendor->city, $vendor->category]);
        $locationCategoryTitle = 'See More '.Str::plural($categoryName).' in '.$vendor->city->name;

        return Inertia::render('vendors/show', [
            'vendor' => $vendor,
            'meta' => [
                'title' => $vendor->seo_title ?: $defaultTitle,
                'description' => $vendor->seo_description ?: $defaultDescription,
            ],
            'ogImageUrl' => $ogImageUrl,
            'ogImageWidth' => $ogImageWidth,
            'ogImageHeight' => $ogImageHeight,
            'ogImageType' => $ogImageType,
            'canonicalUrl' => route('vendors.show', $vendor),
            'locationCategoryUrl' => $locationCategoryUrl,
            'locationCategoryTitle' => $locationCategoryTitle,
        ]);
    }
}
