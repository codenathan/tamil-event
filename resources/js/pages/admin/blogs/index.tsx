import { router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Plus,
    Pencil,
    Trash2,
    Search,
    FileText,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
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
import AdminLayout from '@/layouts/admin-layout';
import {
    create,
    edit,
    destroy as deleteBlog,
} from '@/routes/admin/blogs';
import type { Blog, BlogStatus } from '@/types';

interface Props {
    blogs: {
        data: Blog[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        per_page?: string;
    };
}

function statusBadge(status: BlogStatus) {
    const variants: Record<BlogStatus, string> = {
        draft: 'bg-muted text-muted-foreground',
        published: 'bg-green-100 text-green-700',
        archived: 'bg-orange-100 text-orange-700',
    };

    return (
        <Badge className={variants[status] ?? 'bg-muted'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

export default function AdminBlogs({ blogs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const { delete: destroy } = useForm();

    const goToPage = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveScroll: true });
        }
    };

    const handleSearch = () => {
        router.get(
            window.location.pathname,
            { search, per_page: filters.per_page },
            { preserveScroll: true },
        );
    };

    const handlePerPageChange = (value: string) => {
        router.get(
            window.location.pathname,
            { search, per_page: value },
            { preserveScroll: true },
        );
    };

    const pageLinks = blogs.links.slice(1, -1);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BookOpen className="h-4 w-4" />
                        Blog Posts ({blogs.total})
                    </CardTitle>
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => router.visit(create.url())}
                    >
                        <Plus className="h-4 w-4" /> New Post
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search posts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={filters.per_page ?? '10'}
                            onValueChange={handlePerPageChange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 / page</SelectItem>
                                <SelectItem value="25">25 / page</SelectItem>
                                <SelectItem value="50">50 / page</SelectItem>
                                <SelectItem value="100">100 / page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blogs.data.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {blog.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {blog.user?.name ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        {statusBadge(blog.status)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {blog.published_at
                                            ? new Date(
                                                  blog.published_at,
                                              ).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="space-x-1 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                router.visit(
                                                    edit.url(blog.id),
                                                )
                                            }
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete blog post?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently
                                                        remove "{blog.title}".
                                                        This action cannot be
                                                        undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            router.delete(
                                                                deleteBlog.url(
                                                                    blog.id,
                                                                ),
                                                                {
                                                                    preserveScroll:
                                                                        true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {blogs.last_page > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            goToPage(blogs.links[0].url)
                                        }
                                        className={
                                            !blogs.links[0].url
                                                ? 'pointer-events-none opacity-50'
                                                : 'cursor-pointer'
                                        }
                                    />
                                </PaginationItem>

                                {pageLinks.map((link, i) =>
                                    link.label === '...' ? (
                                        <PaginationItem key={i}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={link.active}
                                                onClick={() =>
                                                    goToPage(link.url)
                                                }
                                                className="cursor-pointer"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </PaginationItem>
                                    ),
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            goToPage(
                                                blogs.links[
                                                    blogs.links.length - 1
                                                ].url,
                                            )
                                        }
                                        className={
                                            !blogs.links[
                                                blogs.links.length - 1
                                            ].url
                                                ? 'pointer-events-none opacity-50'
                                                : 'cursor-pointer'
                                        }
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

AdminBlogs.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
