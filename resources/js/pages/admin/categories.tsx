import { router, useForm } from '@inertiajs/react';
import { FolderOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import {
    store,
    update,
    destroy as deleteCategory,
} from '@/routes/admin/categories';
import type { Category } from '@/types';

interface Props {
    categoriesRecords: {
        data: Category[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function AdminCategories({ categoriesRecords }: Props) {
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        icon: '',
        description: '',
    });

    const openCreateModal = () => {
        reset();
        setIsNew(true);
        setEditCat(null);
        setDialogOpen(true);
    };

    const openEditModal = (category: Category) => {
        setIsNew(false);
        setEditCat(category);
        setData({
            name: category.name,
            icon: category.icon || '',
            description: category.description || '',
        });
        setDialogOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (isNew) {
            post(store.url(), {
                onSuccess: () => {
                    setDialogOpen(false);
                    toast('Category added successfully');
                },
            });
        } else {
            put(update.url(editCat!.id), {
                onSuccess: () => {
                    setDialogOpen(false);
                    toast('Category updated successfully');
                },
            });
        }
    };

    // Consistent with Inbox deletion logic
    const handleDelete = (id: number) => {
        router.delete(deleteCategory.url(id), {
            preserveScroll: true,
            onSuccess: () => toast('Category deleted'),
        });
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveScroll: true });
        }
    };

    const pageLinks = categoriesRecords.links.slice(1, -1);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FolderOpen className="h-4 w-4" />
                        Categories ({categoriesRecords.total})
                    </CardTitle>
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={openCreateModal}
                    >
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Icon</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categoriesRecords.data.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">
                                        {c.name}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {c.slug}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {c.icon || 'None'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="space-x-1 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(c)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        {/* AlertDialog Implementation from Inbox template */}
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
                                                        Delete category?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently
                                                        remove "{c.name}". This
                                                        action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(c.id)
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

                    {/* Pagination matching Inbox template */}
                    {categoriesRecords.last_page > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            goToPage(
                                                categoriesRecords.links[0].url,
                                            )
                                        }
                                        className={
                                            !categoriesRecords.links[0].url
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
                                                categoriesRecords.links[
                                                    categoriesRecords.links
                                                        .length - 1
                                                ].url,
                                            )
                                        }
                                        className={
                                            !categoriesRecords.links[
                                                categoriesRecords.links.length -
                                                    1
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? 'Add Category' : 'Edit Category'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            {errors.name && (
                                <span className="text-xs text-destructive">
                                    {errors.name}
                                </span>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Icon (Lucide name)</Label>
                            <Input
                                value={data.icon}
                                onChange={(e) =>
                                    setData('icon', e.target.value)
                                }
                                placeholder="e.g. Camera"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Input
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {isNew ? 'Create Category' : 'Update Category'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminCategories.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
