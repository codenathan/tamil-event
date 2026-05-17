import { Head } from '@inertiajs/react';
import { Mail, PencilLine } from 'lucide-react';
import { DashboardEnquiries } from '@/components/dashboard/dashboard-enquiries';
import type { PaginatedEnquiries } from '@/components/dashboard/dashboard-enquiries';
import { DashboardGetStarted } from '@/components/dashboard/dashboard-get-started';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardListingForm } from '@/components/dashboard/dashboard-listing-form';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import type { Vendor } from '@/types';

type PageProps = {
    vendor: Vendor | null;
    enquiries: PaginatedEnquiries;
};

export default function Dashboard({ vendor, enquiries }: PageProps) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="bg-background">
                <div className="container max-w-5xl space-y-5 py-6 md:py-8">
                    <DashboardHeader
                        vendor={vendor}
                        enquiriesTotal={enquiries.total}
                    />

                    {!vendor ? (
                        <DashboardGetStarted />
                    ) : (
                        <Tabs defaultValue="listing" className="w-full space-y-4">
                            <TabsList variant="line" className="h-auto gap-1">
                                <TabsTrigger
                                    value="listing"
                                    className="gap-2 px-4 py-2.5"
                                >
                                    <PencilLine className="size-4" />
                                    My listing
                                </TabsTrigger>
                                <TabsTrigger
                                    value="enquiries"
                                    className="gap-2 px-4 py-2.5"
                                >
                                    <Mail className="size-4" />
                                    Enquiries
                                    {enquiries.total > 0 ? (
                                        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted px-2 py-0 text-xs font-medium tabular-nums text-muted-foreground">
                                            {enquiries.total}
                                        </span>
                                    ) : null}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="listing" className="mt-0">
                                <DashboardListingForm
                                    key={vendor.id}
                                    vendor={vendor}
                                />
                            </TabsContent>

                            <TabsContent value="enquiries" className="mt-0">
                                <DashboardEnquiries enquiries={enquiries} />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
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
