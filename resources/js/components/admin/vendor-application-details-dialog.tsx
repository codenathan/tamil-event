import { Check, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/types';

function statusVariant(
    s: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
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
}

function Field({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('space-y-1', className)}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <div className="text-sm font-semibold leading-snug text-foreground">
                {children}
            </div>
        </div>
    );
}

function normalizeUrl(href: string): string {
    if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
    }
    return `https://${href}`;
}

function portfolioUrls(vendor: Vendor): string[] {
    const urls: string[] = [];
    if (vendor.featured_image_url) {
        urls.push(vendor.featured_image_url);
    }
    for (const img of vendor.images) {
        if (!urls.includes(img.url)) {
            urls.push(img.url);
        }
    }
    return urls;
}

export type VendorApplicationDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendor: Vendor | null;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
};

export default function VendorApplicationDetailsDialog({
    open,
    onOpenChange,
    vendor,
    onApprove,
    onReject,
}: VendorApplicationDetailsDialogProps) {
    const location =
        [vendor?.city?.name, vendor?.country?.name].filter(Boolean).join(', ') ||
        null;

    const website = vendor?.website?.trim() || null;
    const portfolio = vendor ? portfolioUrls(vendor) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader className="border-b border-border/60 px-6 py-4 text-left">
                    <DialogTitle className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">
                        Application details
                    </DialogTitle>
                    <DialogDescription>
                        Review the submission before approving or rejecting.
                    </DialogDescription>
                </DialogHeader>

                {vendor ? (
                    <>
                        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
                            <div className="flex flex-col gap-6 py-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field label="Business">
                                {vendor.name}
                            </Field>
                            <Field label="Category">
                                {vendor.category?.name ?? '—'}
                            </Field>
                            <Field label="Contact">
                                {vendor.user?.name ?? '—'}
                            </Field>
                            <Field label="Email">
                                {vendor.email ? (
                                    <a
                                        href={`mailto:${vendor.email}`}
                                        className="font-semibold text-primary underline-offset-4 hover:underline"
                                    >
                                        {vendor.email}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </Field>
                            <Field label="Phone">
                                {vendor.phone ? (
                                    <a
                                        href={`tel:${vendor.phone.replace(/\s/g, '')}`}
                                        className="font-semibold text-primary underline-offset-4 hover:underline"
                                    >
                                        {vendor.phone}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </Field>
                            <Field label="Location">{location ?? '—'}</Field>
                        </div>

                        <Field label="Website">
                            {website ? (
                                <a
                                    href={normalizeUrl(website)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all font-semibold text-primary underline-offset-4 hover:underline"
                                >
                                    {website}
                                </a>
                            ) : (
                                '—'
                            )}
                        </Field>

                        <Field label="Description">
                            {vendor.description?.trim() ? (
                                <p className="whitespace-pre-wrap font-normal leading-relaxed text-foreground">
                                    {vendor.description}
                                </p>
                            ) : (
                                <span className="font-normal text-muted-foreground">
                                    —
                                </span>
                            )}
                        </Field>

                        {vendor.services && vendor.services.length > 0 ? (
                            <Field label="Services">
                                <ul className="list-inside list-disc font-normal text-foreground">
                                    {vendor.services.map((s) => (
                                        <li key={s}>{s}</li>
                                    ))}
                                </ul>
                            </Field>
                        ) : null}

                        {(vendor.social_instagram || vendor.social_facebook) ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {vendor.social_instagram ? (
                                    <Field label="Instagram">
                                        <a
                                            href={normalizeUrl(vendor.social_instagram)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="break-all font-semibold text-primary underline-offset-4 hover:underline"
                                        >
                                            {vendor.social_instagram}
                                        </a>
                                    </Field>
                                ) : null}
                                {vendor.social_facebook ? (
                                    <Field label="Facebook">
                                        <a
                                            href={normalizeUrl(vendor.social_facebook)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="break-all font-semibold text-primary underline-offset-4 hover:underline"
                                        >
                                            {vendor.social_facebook}
                                        </a>
                                    </Field>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Portfolio images
                            </p>
                            {portfolio.length > 0 ? (
                                <div className="flex gap-3 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {portfolio.map((url, i) => (
                                        <a
                                            key={`${url}-${i}`}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0"
                                        >
                                            <img
                                                src={url}
                                                alt=""
                                                className="h-28 w-40 rounded-lg border border-border/60 object-cover shadow-sm transition hover:opacity-95 sm:h-32 sm:w-44"
                                            />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">—</p>
                            )}
                        </div>

                        <Field label="Status">
                            <Badge
                                variant={statusVariant(vendor.status)}
                                className="mt-0.5 capitalize"
                            >
                                {vendor.status}
                            </Badge>
                        </Field>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row">
                            <Button
                                className="h-11 flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => onApprove(vendor.id)}
                            >
                                <Check className="size-4 shrink-0" aria-hidden />
                                Approve
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-11 flex-1 gap-2"
                                onClick={() => onReject(vendor.id)}
                            >
                                <XCircle className="size-4 shrink-0" aria-hidden />
                                Reject
                            </Button>
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
