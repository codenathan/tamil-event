<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SearchLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SearchLogsController extends Controller
{
    private const INSIGHTS_DAYS = 30;

    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $query = SearchLog::query()
            ->with('user:id,name,email')
            ->latest();

        $this->applySearch($query, $request, [
            'columns' => ['query', 'category', 'city', 'country'],
        ]);

        $since = now()->subDays(self::INSIGHTS_DAYS);

        $totalSearches = SearchLog::query()->where('created_at', '>=', $since)->count();
        $zeroResultCount = SearchLog::query()
            ->where('created_at', '>=', $since)
            ->where('results_count', 0)
            ->count();

        return Inertia::render('admin/search-logs', [
            'searchLogs' => $query->paginate($perPage)->withQueryString(),
            'topSearches' => $this->topSearches($since),
            'zeroResultSearches' => $this->zeroResultSearches($since),
            'totals' => [
                'days' => self::INSIGHTS_DAYS,
                'searches' => $totalSearches,
                'zero_results' => $zeroResultCount,
                'zero_result_rate' => $totalSearches > 0 ? round($zeroResultCount / $totalSearches * 100, 1) : 0,
            ],
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * @return array<int, array{term: string, searches: int, avg_results: float}>
     */
    private function topSearches(\DateTimeInterface $since): array
    {
        return SearchLog::query()
            ->where('created_at', '>=', $since)
            ->whereNotNull('query')
            ->select([
                DB::raw('LOWER(query) as term'),
                DB::raw('COUNT(*) as searches'),
                DB::raw('AVG(results_count) as avg_results'),
            ])
            ->groupBy('term')
            ->orderByDesc('searches')
            ->limit(10)
            ->get()
            ->map(fn (SearchLog $row): array => [
                'term' => (string) $row->getAttribute('term'),
                'searches' => (int) $row->getAttribute('searches'),
                'avg_results' => round((float) $row->getAttribute('avg_results'), 1),
            ])
            ->all();
    }

    /**
     * @return array<int, array{query: string|null, category: string|null, city: string|null, country: string|null, searches: int}>
     */
    private function zeroResultSearches(\DateTimeInterface $since): array
    {
        return SearchLog::query()
            ->where('created_at', '>=', $since)
            ->where('results_count', 0)
            ->select([
                DB::raw('LOWER(query) as query'),
                'category',
                'city',
                'country',
                DB::raw('COUNT(*) as searches'),
            ])
            ->groupBy(DB::raw('LOWER(query)'), 'category', 'city', 'country')
            ->orderByDesc('searches')
            ->limit(10)
            ->get()
            ->map(fn (SearchLog $row): array => [
                'query' => $row->getAttribute('query'),
                'category' => $row->category,
                'city' => $row->city,
                'country' => $row->country,
                'searches' => (int) $row->getAttribute('searches'),
            ])
            ->all();
    }
}
