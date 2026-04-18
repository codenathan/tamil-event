import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Eye,
    Globe,
    Mail,
    PencilLine,
    Phone,
    Save,
    X,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useEffect, useState } from 'react';
import DataTableWithSearch from '@/components/data-table-with-search';
import InputError from '@/components/input-error';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import dashboardEnquiries from '@/routes/dashboard/enquiries';
import listing from '@/routes/dashboard/listing';
import type { Vendor } from '@/types';
import { EnquireStatus  } from '@/types/models';
import type {Enquire} from '@/types/models';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedEnquiries {
    data: Enquire[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

type PageProps = {
    vendor: Vendor | null;
    enquiries: PaginatedEnquiries;
};

const tabTriggerClass =
    'gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground';

function formatEnquiryDate(iso: string): string {
    try {
        return iso.slice(0, 10);
    } catch {
        return iso;
    }
}

function DashboardListingForm({ vendor }: { vendor: Vendor }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: vendor.name,
        description: vendor.description ?? '',
        services: [...(vendor.services ?? [])],
        phone: vendor.phone ?? '',
        email: vendor.email ?? '',
        website: vendor.website ?? '',
    });

    const [serviceInput, setServiceInput] = useState('');

    useEffect(() => {
        setData({
            name: vendor.name,
            description: vendor.description ?? '',
            services: [...(vendor.services ?? [])],
            phone: vendor.phone ?? '',
            email: vendor.email ?? '',
            website: vendor.website ?? '',
        });
    }, [vendor, setData]);

    const addServiceTag = (raw: string) => {
        const t = raw.trim();

        if (!t || data.services.length >= 20) {
            return;
        }

        if (data.services.some((s) => s.toLowerCase() === t.toLowerCase())) {
            return;
        }

        setData('services', [...data.services, t]);
        setServiceInput('');
    };

    const removeServiceTag = (index: number) => {
        setData(
            'services',
            data.services.filter((_, i) => i !== index),
        );
    };

    const onServiceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addServiceTag(serviceInput);
        } else if (
            e.key === 'Backspace' &&
            serviceInput === '' &&
            data.services.length > 0
        ) {
            removeServiceTag(data.services.length - 1);
        }
    };

    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="font-display flex items-center gap-2 text-xl">
                    <PencilLine className="size-5 text-primary" />
                    Edit business listing
                </CardTitle>
                <CardDescription>
                    Update how your business appears to visitors on TamilEvents.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        patch(listing.update.url());
                    }}
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Business name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                readOnly={true}
                                autoComplete="organization"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                rows={6}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Describe your services, experience, and what makes your business special."
                                className="min-h-[140px] resize-y"
                            />
                            <InputError message={errors.description} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>
                                Services{' '}
                                <span className="font-normal text-muted-foreground">
                                    (optional, up to 20)
                                </span>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Type a service and press Enter or comma to add a
                                tag.
                            </p>
                            <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                                {data.services.map((tag, i) => (
                                    <span
                                        key={`${tag}-${i}`}
                                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeServiceTag(i)}
                                            className="rounded-full p-0.5 hover:bg-destructive/20"
                                            aria-label={`Remove ${tag}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={serviceInput}
                                    onChange={(e) =>
                                        setServiceInput(e.target.value)
                                    }
                                    onKeyDown={onServiceKeyDown}
                                    onBlur={() => {
                                        if (serviceInput.trim()) {
                                            addServiceTag(serviceInput);
                                        }
                                    }}
                                    placeholder={
                                        data.services.length >= 20
                                            ? 'Maximum tags reached'
                                            : 'e.g. Wedding photography'
                                    }
                                    disabled={data.services.length >= 20}
                                    className="min-w-32 flex-1 border-0 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {data.services.length}/20 tags
                            </p>
                            <InputError message={errors.services} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="pl-10"
                                    autoComplete="tel"
                                />
                            </div>
                            <InputError message={errors.phone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="pl-10"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <div className="relative">
                                <Globe className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) =>
                                        setData('website', e.target.value)
                                    }
                                    className="pl-10"
                                    placeholder="https://"
                                />
                            </div>
                            <InputError message={errors.website} />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-full gap-2"
                        >
                            <Save className="size-4" />
                            Save changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    vendor,
    enquiries,
}: PageProps) {
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

    const displayName = vendor?.name ?? 'there';

    return (
        <>
            <Head title="Dashboard" />

            <div className="bg-background">
                <div className="container max-w-5xl space-y-8 py-10 md:py-12">
                    <header className="space-y-2">
                        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                            Welcome, {displayName}
                        </h1>
                        <p className="font-body text-base text-muted-foreground">
                            Manage your listing and view enquiries
                        </p>
                    </header>

                    {!vendor ? (
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader>
                                <CardTitle className="font-display text-xl">
                                    No listing yet
                                </CardTitle>
                                <CardDescription>
                                    Submit your business to appear in search and get
                                    enquiries from couples and families planning Tamil
                                    events.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="rounded-full">
                                    <Link href="/list-your-business">
                                        List your business
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Tabs defaultValue="listing" className="w-full space-y-6">
                            <TabsList className="h-auto gap-3 bg-transparent p-0">
                                <TabsTrigger
                                    value="listing"
                                    className={tabTriggerClass}
                                >
                                    <PencilLine className="size-4" />
                                    My listing
                                </TabsTrigger>
                                <TabsTrigger
                                    value="enquiries"
                                    className={tabTriggerClass}
                                >
                                    <Mail className="size-4" />
                                    Enquiries
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="listing" className="mt-0">
                                <DashboardListingForm
                                    key={vendor.id}
                                    vendor={vendor}
                                />
                            </TabsContent>

                            <TabsContent value="enquiries" className="mt-0">
                                <Card className="border-border/80 shadow-sm">
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="font-display flex items-center gap-2 text-xl">
                                            <Mail className="size-5 text-primary" />
                                            Enquiries ({enquiries.total})
                                        </CardTitle>
                                        <CardDescription>
                                            Messages from people who contacted you via
                                            your public listing.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <DataTableWithSearch<Enquire>
                                            data={enquiries}
                                            searchUrl={dashboard.url()}
                                            searchPlaceholder="Search by name, email, or message…"
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
                                                                {formatEnquiryDate(
                                                                    row.created_at,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    header: 'Event date',
                                                    render: (row) => (
                                                        <span className="font-mono text-sm tabular-nums">
                                                            {formatEnquiryDate(
                                                                row.date,
                                                            )}
                                                        </span>
                                                    ),
                                                },
                                                {
                                                    header: 'Status',
                                                    render: (row) =>
                                                        row.status ===
                                                        EnquireStatus.PENDING ? (
                                                            <Badge>new</Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="secondary"
                                                                className="border-transparent bg-purple-light text-primary"
                                                            >
                                                                read
                                                            </Badge>
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
                                                    onClick={() =>
                                                        openEnquiry(row)
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>

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
                        <DialogTitle>
                            {viewingEnquiry
                                ? `Message from ${viewingEnquiry.name}`
                                : 'Enquiry'}
                        </DialogTitle>
                        {viewingEnquiry ? (
                            <DialogDescription className="space-y-1">
                                <span className="block">{viewingEnquiry.email}</span>
                                <span className="block">
                                    Event date:{' '}
                                    {formatEnquiryDate(viewingEnquiry.date)}
                                </span>
                            </DialogDescription>
                        ) : null}
                    </DialogHeader>
                    {viewingEnquiry ? (
                        <p className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {viewingEnquiry.message}
                        </p>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
