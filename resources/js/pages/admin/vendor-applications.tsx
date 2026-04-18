import { Head, router } from '@inertiajs/react';
import { ClipboardCheck, Check, Eye, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import VendorApplicationDetailsDialog from '@/components/admin/vendor-application-details-dialog';
import DataTableWithSearch from '@/components/data-table-with-search';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { applications as applicationsIndex } from '@/routes/admin';
import { approve, destroy } from '@/routes/admin/applications';
import type { Vendor } from '@/types';

interface Props {
    vendors: {
        data: Vendor[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const statusColor = (s: string) => {
    switch (s) {
        case 'pending':
            return 'secondary';
        case 'approved':
            return 'default';
        case 'rejected':
            return 'destructive';
        default:
            return 'secondary';
    }
};

AdminApplications.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default function AdminApplications({ vendors }: Props) {
    const [viewApp, setViewApp] = useState<Vendor | null>(null);

    const handleUpdateStatus = (id: number, status: 'approved' | 'rejected') => {
        router.patch(approve.url(id), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                toast(`Application ${status}`);
                setViewApp(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onSuccess: () => toast('Application removed'),
        });
    };

    const pendingCount = vendors.data.filter((v) => v.status === 'pending').length;

    return (
        <>
            <Head title="Vendor applications" />

            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex flex-wrap items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" />
                            Vendor applications ({vendors.total})
                            {pendingCount > 0 ? (
                                <Badge variant="destructive" className="ml-0 sm:ml-2">
                                    {pendingCount} pending on this page
                                </Badge>
                            ) : null}
                        </CardTitle>
                        <CardDescription>
                            Review and approve vendor join requests
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTableWithSearch<Vendor>
                        data={vendors}
                        searchUrl={applicationsIndex.url()}
                        searchPlaceholder="Search applications…"
                        emptyMessage="No applications found."
                        itemLabel="applications"
                        columns={[
                            {
                                header: 'Business',
                                accessor: 'name',
                                className: 'font-medium',
                            },
                            {
                                header: 'Category',
                                render: (vendor) =>
                                    vendor.category ? (
                                        <Badge variant="secondary">
                                            {vendor.category.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            —
                                        </span>
                                    ),
                            },
                            {
                                header: 'Location',
                                render: (vendor) => (
                                    <span className="text-sm">
                                        {[vendor.city?.name, vendor.country?.name]
                                            .filter(Boolean)
                                            .join(', ') || '—'}
                                    </span>
                                ),
                            },
                            {
                                header: 'Status',
                                render: (vendor) => (
                                    <Badge variant={statusColor(vendor.status)}>
                                        {vendor.status}
                                    </Badge>
                                ),
                            },
                        ]}
                        renderActions={(vendor) => (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewApp(vendor)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>

                                {!vendor.is_active ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleUpdateStatus(vendor.id, 'approved')
                                            }
                                        >
                                            <Check className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete application?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will remove the application
                                                        for {vendor.name}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(vendor.id)
                                                        }
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                ) : null}
                            </>
                        )}
                    />
                </CardContent>
            </Card>

            <VendorApplicationDetailsDialog
                open={!!viewApp}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewApp(null);
                    }
                }}
                vendor={viewApp}
                onApprove={(id) => handleUpdateStatus(id, 'approved')}
                onReject={(id) => handleUpdateStatus(id, 'rejected')}
            />
        </>
    );
}
