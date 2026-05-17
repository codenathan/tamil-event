import { router } from '@inertiajs/react';
import { Eye, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import DataTableWithSearch from '@/components/data-table-with-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dashboard } from '@/routes';
import dashboardEnquiries from '@/routes/dashboard/enquiries';
import { EnquireStatus } from '@/types/models';
import type { Enquire } from '@/types/models';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedEnquiries {
    data: Enquire[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

function formatEnquiryDate(iso: string): string {
    try {
        return iso.slice(0, 10);
    } catch {
        return iso;
    }
}

type DashboardEnquiriesProps = {
    enquiries: PaginatedEnquiries;
};

export function DashboardEnquiries({ enquiries }: DashboardEnquiriesProps) {
    const [viewingEnquiry, setViewingEnquiry] = useState<Enquire | null>(null);

    const openEnquiry = (row: Enquire) => {
        if (row.status === EnquireStatus.PENDING) {
            router.post(
                dashboardEnquiries.markAsRead.url({ enquire: row.id }),
                {},
                { preserveScroll: true },
            );
        }

        setViewingEnquiry(row);
    };

    return (
        <>
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-1 border-b border-border/40 pb-6">
                    <CardTitle className="font-display flex items-center gap-2 text-lg">
                        <Mail className="size-5 text-primary" />
                        Enquiries
                    </CardTitle>
                    <CardDescription>
                        Messages from people who contacted you via your public listing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <DataTableWithSearch<Enquire>
                        data={enquiries}
                        searchUrl={dashboard.url()}
                        searchPlaceholder="Search by name, email, or message..."
                        emptyMessage="No enquiries found."
                        itemLabel="enquiries"
                        columns={[
                            {
                                header: 'Name',
                                render: (row) => (
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {row.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {row.email}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Received{' '}
                                            {formatEnquiryDate(row.created_at)}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                header: 'Event date',
                                render: (row) => (
                                    <span className="font-mono text-sm tabular-nums">
                                        {formatEnquiryDate(row.date)}
                                    </span>
                                ),
                            },
                            {
                                header: 'Status',
                                render: (row) =>
                                    row.status === EnquireStatus.PENDING ? (
                                        <Badge>new</Badge>
                                    ) : (
                                        <Badge variant="secondary">read</Badge>
                                    ),
                            },
                        ]}
                        renderActions={(row) => (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground"
                                aria-label="View message"
                                onClick={() => openEnquiry(row)}
                            >
                                <Eye className="size-4" />
                            </Button>
                        )}
                    />
                </CardContent>
            </Card>

            <Dialog
                open={viewingEnquiry !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewingEnquiry(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display">
                            {viewingEnquiry
                                ? `Message from ${viewingEnquiry.name}`
                                : 'Enquiry'}
                        </DialogTitle>
                        {viewingEnquiry ? (
                            <DialogDescription asChild>
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center gap-2">
                                        <Mail className="size-3.5 text-muted-foreground" />
                                        <span>{viewingEnquiry.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-3.5 text-muted-foreground" />
                                        <span>
                                            Event date:{' '}
                                            {formatEnquiryDate(viewingEnquiry.date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {viewingEnquiry.status ===
                                        EnquireStatus.PENDING ? (
                                            <Badge className="text-xs">New</Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                Read
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </DialogDescription>
                        ) : null}
                    </DialogHeader>
                    {viewingEnquiry ? (
                        <div className="max-h-[50vh] overflow-y-auto">
                            <p className="whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                                {viewingEnquiry.message}
                            </p>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
