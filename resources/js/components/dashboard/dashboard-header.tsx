import { Building2, Megaphone, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Vendor } from '@/types';
import { VendorStatus } from '@/types/models';

function StatsCard({
    icon: Icon,
    label,
    value,
    sub,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    sub?: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
            </div>
            <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-display text-xl font-semibold tracking-tight text-foreground">
                    {value}
                </p>
                {sub ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                ) : null}
            </div>
        </div>
    );
}

type DashboardHeaderProps = {
    vendor: Vendor | null;
    enquiriesTotal: number;
};

export function DashboardHeader({ vendor, enquiriesTotal }: DashboardHeaderProps) {
    const displayName = vendor?.name ?? 'there';

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-6 md:p-8">
            <div className="relative">
                {vendor ? (
                    <div className="flex flex-col gap-1.5">
                        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                            Welcome back, {displayName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-base text-muted-foreground">
                                Manage your listing and stay on top of new enquiries.
                            </p>
                            {vendor.status === VendorStatus.APPROVED ? (
                                <Badge className="gap-1 border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    Listed
                                </Badge>
                            ) : vendor.status === VendorStatus.PENDING ? (
                                <Badge className="gap-1 border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                    Pending review
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                            Welcome, {displayName}
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Submit your business to appear in search and get enquiries from
                            couples and families planning Tamil events.
                        </p>
                    </div>
                )}
            </div>

            {vendor ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <StatsCard
                        icon={Megaphone}
                        label="Total enquiries"
                        value={enquiriesTotal}
                    />
                    <StatsCard
                        icon={Tag}
                        label="Category"
                        value={vendor.category?.name ?? 'Uncategorised'}
                        sub={
                            vendor.city
                                ? `${vendor.city.name}, ${vendor.city.country.name}`
                                : undefined
                        }
                    />
                    <StatsCard
                        icon={Building2}
                        label="Listing status"
                        value={
                            vendor.status === VendorStatus.APPROVED
                                ? 'Active'
                                : vendor.status === VendorStatus.PENDING
                                  ? 'Under review'
                                  : 'Not approved'
                        }
                        sub={
                            vendor.is_active
                                ? 'Visible in search results'
                                : 'Not visible publicly'
                        }
                    />
                </div>
            ) : null}
        </div>
    );
}
