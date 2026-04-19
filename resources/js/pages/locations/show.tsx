import { Head } from '@inertiajs/react';
import type { VendorCardData } from '@/components/app/VendorCard';
import VendorCard from '@/components/app/VendorCard';
import type {
    PaginatedData,
} from '@/components/app/VendorPagination';
import VendorPagination from '@/components/app/VendorPagination';

interface PaginatedVendors extends PaginatedData {
    data: VendorCardData[];
}

interface CityProps {
    id: number;
    name: string;
    slug: string;
    country?: string;
}

interface Props {
    city: CityProps;
    vendors: PaginatedVendors;
}

export default function LocationShow({ city, vendors }: Props) {
    const heading = `${city.name} Vendors`;
    const subtitle = city.country
        ? `Browse vendors in ${city.name}, ${city.country}.`
        : `Browse vendors in ${city.name}.`;

    return (
        <>
            <Head>
                <title>{`${city.name} Vendors — TamilEventPlanner`}</title>
                <meta
                    name="description"
                    content={`Browse ${city.name} vendors on TamilEventPlanner.`}
                />
            </Head>

            <section className="border-b border-border bg-secondary/40 py-6">
                <div className="container">
                    <h1 className="font-display text-3xl font-bold">
                        {heading}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
            </section>

            <section className="container py-10">
                <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-display text-2xl font-bold md:text-3xl">
                            {vendors.total > 0
                                ? `${vendors.total} ${vendors.total === 1 ? 'vendor' : 'vendors'} found`
                                : 'No vendors found'}
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {vendors.total} vendors found
                    </p>
                </div>

                {vendors.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {vendors.data.map((vendor) => (
                                <VendorCard key={vendor.id} vendor={vendor} />
                            ))}
                        </div>
                        <VendorPagination data={vendors} />
                    </>
                ) : (
                    <div className="py-24 text-center text-muted-foreground">
                        No vendors available for this location.
                    </div>
                )}
            </section>
        </>
    );
}
