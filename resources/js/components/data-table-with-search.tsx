import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import EmptyTable from '@/components/empty-table';
import PaginatedPagination from '@/components/paginated-pagination';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Column<T> {
    header: string | ReactNode;
    accessor?: keyof T;
    render?: (item: T) => ReactNode;
    className?: string;
    hideOnMobile?: boolean;
}

interface DataTableWithSearchProps<T> {
    data: PaginatedData<T>;
    columns: Column<T>[];
    searchPlaceholder?: string;
    emptyMessage?: string;
    searchUrl: string;
    renderActions?: (item: T) => ReactNode;
    itemLabel: string;
    filters?: ReactNode;
}

export default function DataTableWithSearch<T extends { id: number | string }>({
    data,
    columns,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No data found',
    searchUrl,
    renderActions,
    itemLabel,
    filters,
}: DataTableWithSearchProps<T>) {
    const [searchValue, setSearchValue] = useState(() => {
        return new URLSearchParams(window.location.search).get('search') || '';
    });

    const debouncedSearch = useCallback(
        (value: string) => {
            const params = new URLSearchParams(window.location.search);

            if (value.trim()) {
                params.set('search', value);
            } else {
                params.delete('search');
            }
            params.delete('page');
            const queryString = params.toString();
            const url = queryString ? `${searchUrl}?${queryString}` : searchUrl;

            router.get(url, {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [searchUrl],
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(searchValue);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchValue, debouncedSearch]);

    const clearSearch = () => setSearchValue('');

    const handlePerPageChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value !== '10') {
            params.set('per_page', value);
        } else {
            params.delete('per_page');
        }
        params.delete('page');
        const queryString = params.toString();
        const url = queryString ? `${searchUrl}?${queryString}` : searchUrl;
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const visibleColumns = columns.filter((c) => !c.hideOnMobile);
    const getCellContent = (item: T, column: Column<T>) => {
        if (column.render) return column.render(item);
        if (column.accessor) return String(item[column.accessor]);
        return null;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Filters and search */}
            <div className="flex flex-wrap items-center gap-4">
                {filters}
                <div className="relative min-w-0 flex-1 md:max-w-md">
                <Search
                    className="absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                />
                <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-11 pl-9 pr-10 text-base md:text-sm bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background transition-all focus-visible:ring-2"
                    aria-label={searchPlaceholder}
                />
                {searchValue ? (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                        aria-label="Clear search"
                    >
                        <X className="size-4" />
                    </button>
                ) : null}
                </div>
            </div>

            {/* Mobile: card layout */}
            <div className="flex flex-col gap-4 md:hidden">
                {data.data.length === 0 ? (
                    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-background/60 px-5 py-12 backdrop-blur-sm dark:border-sidebar-border/40">
                        <EmptyTable description={emptyMessage} />
                    </div>
                ) : (
                    data.data.map((item) => (
                        <article
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl border border-border/40 bg-background/60 p-5 backdrop-blur-sm transition-all hover:border-border/60 hover:shadow-lg hover:bg-background/80 dark:border-sidebar-border/40"
                        >
                            {/* Hover gradient - matches NewsCard */}
                            <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="relative flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                                    {visibleColumns.map((column, idx) => {
                                        const content = getCellContent(item, column);
                                        const label =
                                            typeof column.header === 'string'
                                                ? column.header
                                                : null;
                                        if (!label && typeof column.header !== 'string')
                                            return null;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col gap-0.5"
                                            >
                                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    {label}
                                                </span>
                                                <div className="text-sm font-medium text-foreground">
                                                    {content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {renderActions ? (
                                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/30 pt-3">
                                        {renderActions(item)}
                                    </div>
                                ) : null}
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-hidden rounded-xl border border-border/40 bg-background/60 backdrop-blur-sm transition-all hover:border-border/60 dark:border-sidebar-border/40 md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className={cn(
                                        column.className,
                                        column.hideOnMobile && 'hidden md:table-cell',
                                    )}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                            {renderActions ? (
                                <TableHead className="w-[1%] text-right">
                                    Actions
                                </TableHead>
                            ) : null}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        columns.length + (renderActions ? 1 : 0)
                                    }
                                    className="py-12"
                                >
                                    <EmptyTable description={emptyMessage} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.data.map((item) => (
                                <TableRow key={item.id}>
                                    {columns.map((column, index) => (
                                        <TableCell
                                            key={index}
                                            className={cn(
                                                column.className,
                                                column.hideOnMobile &&
                                                    'hidden md:table-cell',
                                            )}
                                        >
                                            {getCellContent(item, column)}
                                        </TableCell>
                                    ))}
                                    {renderActions ? (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {renderActions(item)}
                                            </div>
                                        </TableCell>
                                    ) : null}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {data.data.length > 0 ? (
                <div className="flex flex-col gap-4 py-2 md:flex-row md:items-center md:justify-between">
                    <p className="order-2 text-sm text-muted-foreground md:order-1">
                        Showing{' '}
                        {(data.current_page - 1) * data.per_page + 1}–
                        {Math.min(
                            data.current_page * data.per_page,
                            data.total,
                        )}{' '}
                        of {data.total} {itemLabel}
                    </p>
                    <div className="order-1 flex flex-wrap items-center gap-3 md:order-2 md:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Per page
                            </span>
                            <Select
                                value={String(data.per_page)}
                                onValueChange={handlePerPageChange}
                            >
                                <SelectTrigger className="h-9 w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {data.last_page > 1 ? (
                            <PaginatedPagination
                                links={data.links}
                                currentPage={data.current_page}
                                lastPage={data.last_page}
                            />
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
