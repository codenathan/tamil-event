import { router } from '@inertiajs/react';
import { ClipboardCheck, Check, XCircle, Eye, Trash2 } from "lucide-react";
import type { ReactNode } from 'react';
import { useState } from "react";
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminLayout from '@/layouts/admin-layout';
import { approve, destroy } from '@/routes/admin/applications';
import type { Vendor} from '@/types';


interface Props {
    vendors: {
        data: Vendor[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const statusColor = (s: string) => {
    switch (s) {
        case "pending": return "secondary";
        case "approved": return "default";
        case "rejected": return "destructive";
        default: return "secondary";
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

    const goToPage = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveScroll: true });
        }
    };

    const pageLinks = vendors.links.slice(1, -1);
    const pendingCount = vendors.data.filter(v => v.status === "pending").length;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" />
                            Vendor Applications ({vendors.total})
                            {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>}
                        </CardTitle>
                        <CardDescription>Review and approve vendor join requests</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendors.data.map((vendor) => (
                                <TableRow key={vendor.id}>
                                    <TableCell className="font-medium">{vendor.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{vendor.category?.name}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {vendor.city?.name}, {vendor.country?.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusColor(vendor.status)}>
                                            {vendor.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => setViewApp(vendor)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        {!vendor.is_active && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(vendor.id, 'approved')}>
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
                                                            <AlertDialogTitle>Reject Application?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will remove the application from {vendor.name}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(vendor.id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination matching Inbox template */}
                    {vendors.last_page > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => goToPage(vendors.links[0].url)}
                                        className={!vendors.links[0].url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                {pageLinks.map((link, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={link.active}
                                            onClick={() => goToPage(link.url)}
                                            className="cursor-pointer"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => goToPage(vendors.links[vendors.links.length - 1].url)}
                                        className={!vendors.links[vendors.links.length - 1].url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardContent>
            </Card>

            {/* Application Detail Dialog */}
            <Dialog open={!!viewApp} onOpenChange={(o) => !o && setViewApp(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Application Details: {viewApp?.name}</DialogTitle>
                    </DialogHeader>
                    {viewApp && (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{viewApp.category?.name}</p></div>
                                <div><p className="text-muted-foreground">Location</p><p className="font-medium">{viewApp.city?.name}, {viewApp.country?.name}</p></div>
                                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{viewApp.email}</p></div>
                                <div><p className="text-muted-foreground">Status</p><Badge variant="secondary">Pending Review</Badge></div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button className="flex-1 gap-2" onClick={() => handleUpdateStatus(viewApp.id, 'approved')}>
                                    <Check className="h-4 w-4" /> Approve
                                </Button>
                                <Button variant="destructive" className="flex-1 gap-2" onClick={() => handleUpdateStatus(viewApp.id, 'rejected')}>
                                    <XCircle className="h-4 w-4" /> Reject
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

