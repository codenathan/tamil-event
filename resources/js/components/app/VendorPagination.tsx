import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

export default function VendorPagination({ data }: { data: PaginatedData }) {
    if (data.last_page <= 1) {
return null;
}

    return (
        <div className="flex items-center justify-between pt-6">
            <p className="text-sm text-muted-foreground">
                Showing {data.from}–{data.to} of {data.total} vendors
            </p>
            <div className="flex items-center gap-1">
                {data.links.map((link, i) => {
                    if (link.label === '&laquo; Previous') {
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm transition-colors ${
                                    link.url ? 'hover:bg-secondary' : 'pointer-events-none opacity-40'
                                }`}
                            >
                                <ChevronLeft size={16} />
                            </Link>
                        );
                    }

                    if (link.label === 'Next &raquo;') {
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm transition-colors ${
                                    link.url ? 'hover:bg-secondary' : 'pointer-events-none opacity-40'
                                }`}
                            >
                                <ChevronRight size={16} />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                                link.active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border hover:bg-secondary'
                            }`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
