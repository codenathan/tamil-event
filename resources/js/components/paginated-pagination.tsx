import { router } from '@inertiajs/react';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPaginationProps {
    links: PaginationLink[];
    currentPage?: number;
    lastPage?: number;
}

export default function PaginatedPagination({
    links,
    currentPage,
    lastPage,
}: PaginatedPaginationProps) {
    if (links.length <= 1) {
        return null;
    }

    const handlePageClick = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const previousLink = links[0];
    const nextLink = links[links.length - 1];
    const pageLinks = links.slice(1, -1);

    const showCompact = currentPage != null && lastPage != null;

    return (
        <Pagination className="w-full md:w-auto">
            <PaginationContent
                className={cn(
                    'flex-wrap justify-center gap-1 md:justify-start',
                )}
            >
                {previousLink?.url ? (
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => handlePageClick(previousLink.url)}
                            className="cursor-pointer"
                        />
                    </PaginationItem>
                ) : null}

                {showCompact ? (
                    <PaginationItem
                        className={cn(
                            'mx-1 flex flex-1 items-center justify-center px-2 py-1.5 text-sm text-muted-foreground md:hidden',
                        )}
                        aria-hidden
                    >
                        Page {currentPage} of {lastPage}
                    </PaginationItem>
                ) : null}

                {pageLinks.map((link, index) => {
                    if (
                        link.label === '...' ||
                        (link.url === null && link.label.trim() === '')
                    ) {
                        return (
                            <PaginationItem
                                key={`ellipsis-${index}`}
                                className="hidden md:list-item"
                            >
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem
                            key={`page-${index}-${link.label}`}
                            className="hidden md:list-item"
                        >
                            <PaginationLink
                                onClick={() => handlePageClick(link.url)}
                                isActive={link.active}
                                className={
                                    link.url
                                        ? 'cursor-pointer'
                                        : 'cursor-default pointer-events-none'
                                }
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                {nextLink?.url ? (
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => handlePageClick(nextLink.url)}
                            className="cursor-pointer"
                        />
                    </PaginationItem>
                ) : null}
            </PaginationContent>
        </Pagination>
    );
}

