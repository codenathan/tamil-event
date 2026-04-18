import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Store, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { create, destroy, edit, index } from '@/routes/admin/vendors';
import type { Vendor } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedVendors {
    data: Vendor[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    vendors: PaginatedVendors;
}

Index.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default function Index({ vendors }: Props) {
    const handleDelete = (vendor: Vendor) => {
        router.delete(destroy.url(vendor.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Vendors" />

            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        All Vendors ({vendors.total})
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <DataTableWithSearch<Vendor>
                        data={vendors}
                        searchUrl={index.url()}
                        searchPlaceholder="Search vendors…"
                        emptyMessage="No vendors found."
                        itemLabel="vendors"
                        filters={
                            <Link href={create.url()}>
                                <Button size="sm" className="gap-1.5">
                                    <Plus className="h-4 w-4" />
                                    Add Vendor
                                </Button>
                            </Link>
                        }
                        columns={[
                            {
                                header: 'Name',
                                accessor: 'name',
                                className: 'font-medium',
                            },
                            {
                                header: 'Category',
                                render: (v) =>
                                    v.category ? (
                                        <Badge variant="secondary">
                                            {v.category.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            —
                                        </span>
                                    ),
                            },
                            {
                                header: 'Location',
                                render: (v) => (
                                    <span className="text-sm">
                                        {[v.city?.name, v.country?.name]
                                            .filter(Boolean)
                                            .join(', ') || '—'}
                                    </span>
                                ),
                            },
                            {
                                header: 'Contact',
                                render: (v) => (
                                    <span className="text-sm text-muted-foreground">
                                        {v.email ?? '—'}
                                    </span>
                                ),
                            },
                        ]}
                        renderActions={(v) => (
                            <>
                                <Link href={edit.url(v.id)}>
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete vendor?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently remove{' '}
                                                <strong>{v.name}</strong>. This
                                                action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(v)}
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    />
                </CardContent>
            </Card>
        </>
    );
}
