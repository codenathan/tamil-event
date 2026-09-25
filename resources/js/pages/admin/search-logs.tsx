import { Head } from '@inertiajs/react';
import { SearchX, Search as SearchIcon, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import DataTableWithSearch from '@/components/data-table-with-search';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { searchLogs as searchLogsRoute } from '@/routes/admin';
import type { SearchLog, SearchLogSource } from '@/types/models';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSearchLogs {
    data: SearchLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

type TopSearch = {
    term: string;
    searches: number;
    avg_results: number;
};

type ZeroResultSearch = {
    query: string | null;
    category: string | null;
    city: string | null;
    country: string | null;
    searches: number;
};

type Totals = {
    days: number;
    searches: number;
    zero_results: number;
    zero_result_rate: number;
};

interface Props {
    searchLogs: PaginatedSearchLogs;
    topSearches: TopSearch[];
    zeroResultSearches: ZeroResultSearch[];
    totals: Totals;
}

const sourceLabels: Record<SearchLogSource, string> = {
    home: 'Home page',
    search: 'Browse page',
    other: 'Other',
};

function describeFilters(item: {
    category: string | null;
    city: string | null;
    country: string | null;
}): string {
    const location = [item.city, item.country].filter(Boolean).join(', ');

    return [item.category, location].filter(Boolean).join(' · ');
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

SearchLogs.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default function SearchLogs({
    searchLogs,
    topSearches,
    zeroResultSearches,
    totals,
}: Props) {
    return (
        <>
            <Head title="Search history" />

            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                Searches (last {totals.days} days)
                            </CardDescription>
                            <CardTitle className="text-3xl tabular-nums">
                                {totals.searches.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                Searches with no results
                            </CardDescription>
                            <CardTitle className="text-3xl tabular-nums">
                                {totals.zero_result_rate}%
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({totals.zero_results.toLocaleString()})
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4" />
                                Top searches
                            </CardTitle>
                            <CardDescription>
                                Most common search terms in the last{' '}
                                {totals.days} days.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topSearches.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No searches yet.
                                </p>
                            ) : (
                                <ul className="divide-y text-sm">
                                    {topSearches.map((row) => (
                                        <li
                                            key={row.term}
                                            className="flex items-center justify-between gap-4 py-2"
                                        >
                                            <span className="truncate font-medium">
                                                {row.term}
                                            </span>
                                            <span className="shrink-0 text-muted-foreground tabular-nums">
                                                {row.searches}×
                                                <span className="ml-2 text-xs">
                                                    avg {row.avg_results}{' '}
                                                    results
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <SearchX className="h-4 w-4" />
                                No-result searches
                            </CardTitle>
                            <CardDescription>
                                What people looked for but couldn&apos;t find.
                                These are gaps worth recruiting vendors for.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {zeroResultSearches.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No empty searches. Nice.
                                </p>
                            ) : (
                                <ul className="divide-y text-sm">
                                    {zeroResultSearches.map((row, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center justify-between gap-4 py-2"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                    {row.query ?? (
                                                        <span className="text-muted-foreground italic">
                                                            (filters only)
                                                        </span>
                                                    )}
                                                </div>
                                                {describeFilters(row) ? (
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {describeFilters(row)}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <span className="shrink-0 text-muted-foreground tabular-nums">
                                                {row.searches}×
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SearchIcon className="h-5 w-5" />
                            Search history ({searchLogs.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTableWithSearch<SearchLog>
                            data={searchLogs}
                            searchUrl={searchLogsRoute.url()}
                            searchPlaceholder="Search terms, categories or locations…"
                            emptyMessage="No searches logged yet."
                            itemLabel="searches"
                            columns={[
                                {
                                    header: 'Search',
                                    render: (log) => (
                                        <div>
                                            <div className="font-medium">
                                                {log.query ?? (
                                                    <span className="text-muted-foreground italic">
                                                        (filters only)
                                                    </span>
                                                )}
                                            </div>
                                            {describeFilters(log) ? (
                                                <div className="text-xs text-muted-foreground">
                                                    {describeFilters(log)}
                                                </div>
                                            ) : null}
                                        </div>
                                    ),
                                },
                                {
                                    header: 'Results',
                                    render: (log) =>
                                        log.results_count === 0 ? (
                                            <Badge variant="destructive">
                                                0
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                {log.results_count}
                                            </Badge>
                                        ),
                                },
                                {
                                    header: 'Source',
                                    hideOnMobile: true,
                                    render: (log) => (
                                        <span className="text-sm text-muted-foreground">
                                            {sourceLabels[log.source] ??
                                                log.source}
                                        </span>
                                    ),
                                },
                                {
                                    header: 'User',
                                    hideOnMobile: true,
                                    render: (log) =>
                                        log.user ? (
                                            <div>
                                                <div className="text-sm">
                                                    {log.user.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {log.user.email}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Guest
                                            </span>
                                        ),
                                },
                                {
                                    header: 'Date',
                                    render: (log) => (
                                        <span className="text-sm whitespace-nowrap text-muted-foreground">
                                            {formatDateTime(log.created_at)}
                                        </span>
                                    ),
                                },
                            ]}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
