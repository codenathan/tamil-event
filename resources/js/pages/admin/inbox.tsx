import { router } from '@inertiajs/react';
import { Mail, Eye, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { markAsRead , destroy } from '@/routes/admin/inbox';
import type { ContactMessage } from '@/types';


interface PaginatedMessages {
    data: ContactMessage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    messages: PaginatedMessages;
}

// ---------- helpers ----------
const statusColor = (s: string) =>
    s === 'new' ? 'default' : s === 'read' ? 'secondary' : 'outline';

// ---------- component ----------
function InboxPage({ messages }: Props) {
    const [viewMsg, setViewMsg] = useState<ContactMessage | null>(null);

    const openMessage = (msg: ContactMessage) => {
        if (msg.status === 'pending') {
            router.post(
                markAsRead.url( { message: msg.id }),
                {},
                { preserveScroll: true },
            );
        }

        setViewMsg(msg);
    };

    const handleDelete = (msg: ContactMessage) => {
        router.delete(destroy.url( { message: msg.id }), {
            preserveScroll: true,
            onSuccess: () => toast(  'Message deleted' ),
        });
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveScroll: true });
        }
    };

    const newCount = messages.data.filter((m) => m.status === 'pending').length;

    // Build pagination page items (numbers + ellipsis) from Laravel links
    // Laravel links include « prev, numbered pages, next »; we skip first/last label links.
    const pageLinks = messages.links.slice(1, -1); // strip Prev / Next wrapper links

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Inbox ({messages.total})
                        {newCount > 0 && <Badge>{newCount} new</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages.data.map((msg) => (
                                <TableRow key={msg.id} className={msg.status === 'pending' ? 'font-medium' : ''}>
                                    <TableCell>
                                        <Badge variant={statusColor(msg.status)}>{msg.status}</Badge>
                                    </TableCell>
                                    <TableCell>{msg.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{msg.email}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{msg.phone || '—'}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-sm">{msg.message}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="space-x-1 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openMessage(msg)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently remove the message from {msg.name}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(msg)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {messages.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        No messages.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {messages.last_page > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => goToPage(messages.links[0].url)}
                                        className={!messages.links[0].url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                                                onClick={() => goToPage(link.url)}
                                                className="cursor-pointer"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        </PaginationItem>
                                    ),
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => goToPage(messages.links[messages.links.length - 1].url)}
                                        className={
                                            !messages.links[messages.links.length - 1].url
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

            {/* View dialog */}
            <Dialog open={!!viewMsg} onOpenChange={(o) => !o && setViewMsg(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Message from {viewMsg?.name}</DialogTitle>
                    </DialogHeader>
                    {viewMsg && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Email: </span>
                                    <span className="font-medium">{viewMsg.email}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Phone: </span>
                                    <span className="font-medium">{viewMsg.phone || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Date: </span>
                                    <span className="font-medium">
                                        {new Date(viewMsg.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status: </span>
                                    <Badge variant={statusColor(viewMsg.status)}>{viewMsg.status}</Badge>
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">Message</p>
                                <p className="rounded-md bg-muted p-4 text-sm leading-relaxed">{viewMsg.message}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

InboxPage.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default InboxPage;
