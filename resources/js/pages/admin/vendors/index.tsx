import { Head, Link, router } from '@inertiajs/react';
import { Store, Pencil, Trash2, Plus, Search } from 'lucide-react';
import {  useState } from 'react';
import type {ReactNode} from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { create, index, destroy, edit } from '@/routes/admin/vendors';


// ── Types ────────────────────────────────────────────────────────────────────

interface Category {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
}

interface Country {
    id: number;
    name: string;
}

interface Vendor {
    id: number;
    name: string;
    email: string;
    category: Category | null;
    city: City | null;
    country: Country | null;
}

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
    filters: {
        search?: string;
    };
}

// ── Page ─────────────────────────────────────────────────────────────────────

Index.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default function Index({ vendors, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (value: string) => {
        router.get(
            index.url(),
            { search: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (vendor: Vendor) => {
        router.delete(destroy.url(vendor.id), {
            preserveScroll: true,
        });
    };

    const getPaginationItems = (): (number | 'ellipsis')[] => {
        const total = vendors.last_page;
        const current = vendors.current_page;
        const items: (number | 'ellipsis')[] = [];

        if (total <= 5) {
            for (let i = 1; i <= total; i++) {
items.push(i);
}
        } else {
            items.push(1);

            if (current > 3) {
items.push('ellipsis');
}

            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                items.push(i);
            }

            if (current < total - 2) {
items.push('ellipsis');
}

            items.push(total);
        }

        return items;
    };

    return (
        <>
            <Head title="Vendors" />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        All Vendors ({vendors.total})
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vendors…"
                                className="pl-8 w-56"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch(search)}
                                onBlur={() => handleSearch(search)}
                            />
                        </div>

                        <Link href={create.url()}>
                            <Button size="sm" className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                Add Vendor
                            </Button>
                        </Link>
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {vendors.data.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.name}</TableCell>

                                    <TableCell>
                                        {v.category
                                            ? <Badge variant="secondary">{v.category.name}</Badge>
                                            : <span className="text-muted-foreground text-sm">—</span>
                                        }
                                    </TableCell>

                                    <TableCell className="text-sm">
                                        {[v.city?.name, v.country?.name].filter(Boolean).join(', ') || '—'}
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">
                                        {v.email}
                                    </TableCell>

                                    <TableCell className="text-right space-x-1">
                                        <Link href={edit.url( v.id)}>
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
                                                    <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently remove <strong>{v.name}</strong>.
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(v)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {vendors.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No vendors found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {vendors.last_page > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            vendors.current_page > 1 &&
                                            router.get(index.url(), {
                                                page: vendors.current_page - 1,
                                                search: filters.search,
                                            })
                                        }
                                        className={vendors.current_page <= 1
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'}
                                    />
                                </PaginationItem>

                                {getPaginationItems().map((item, i) =>
                                    item === 'ellipsis'
                                        ? <PaginationItem key={`e${i}`}><PaginationEllipsis /></PaginationItem>
                                        : (
                                            <PaginationItem key={item}>
                                                <PaginationLink
                                                    isActive={item === vendors.current_page}
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        router.get(index.url(), {
                                                            page: item,
                                                            search: filters.search,
                                                        })
                                                    }
                                                >
                                                    {item}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            vendors.current_page < vendors.last_page &&
                                            router.get(index.url(), {
                                                page: vendors.current_page + 1,
                                                search: filters.search,
                                            })
                                        }
                                        className={vendors.current_page >= vendors.last_page
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
