<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait AppliesSearch
{
    /**
     * Apply search conditions to a query builder.
     *
     * @param  array{columns?: array<string>, relationships?: array<string, array<string>>}  $searchConfig
     */
    protected function applySearch(Builder $query, Request $request, array $searchConfig): void
    {
        if (! $request->filled('search')) {
            return;
        }

        $search = $request->input('search');
        $driver = DB::getDriverName();
        $like = $driver === 'pgsql' ? 'ilike' : 'like';

        $query->where(function ($q) use ($search, $like, $searchConfig): void {
            $firstCondition = true;

            // Apply direct column searches
            if (isset($searchConfig['columns']) && is_array($searchConfig['columns'])) {
                foreach ($searchConfig['columns'] as $column) {
                    if ($firstCondition) {
                        $q->where($column, $like, "%{$search}%");
                        $firstCondition = false;
                    } else {
                        $q->orWhere($column, $like, "%{$search}%");
                    }
                }
            }

            // Apply relationship searches
            if (isset($searchConfig['relationships']) && is_array($searchConfig['relationships'])) {
                foreach ($searchConfig['relationships'] as $relationship => $columns) {
                    foreach ($columns as $column) {
                        if ($firstCondition) {
                            $q->whereHas($relationship, function ($subQuery) use ($search, $like, $column): void {
                                $subQuery->where($column, $like, "%{$search}%");
                            });
                            $firstCondition = false;
                        } else {
                            $q->orWhereHas($relationship, function ($subQuery) use ($search, $like, $column): void {
                                $subQuery->where($column, $like, "%{$search}%");
                            });
                        }
                    }
                }
            }
        });
    }
}
