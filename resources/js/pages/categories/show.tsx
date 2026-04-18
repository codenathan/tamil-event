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

interface Props {
    category: {
        id: number;
        name: string;
        slug: string;
    };
    vendors: PaginatedVendors;
}

export default function CategoryShow({ category, vendors }: Props) {
    return (
        <>
            <Head>
                <title>{category.name} Vendors — TamilEvents</title>
                <meta
                    name="description"
                    content={`Browse ${category.name} vendors on TamilEvents.`}
                />
            </Head>

            <section className="border-b border-border bg-secondary/40 py-6">
                <div className="container">
                    <h1 className="font-display text-3xl font-bold">
                        {category.name}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Browse vendors in the {category.name} category.
                    </p>
                </div>
            </section>

            <section className="container py-10">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold md:text-3xl">
                        {vendors.total > 0
                            ? `${vendors.total} ${vendors.total === 1 ? 'vendor' : 'vendors'} found`
                            : 'No vendors found'}
                    </h2>
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
                        No vendors available for this category.
                    </div>
                )}
            </section>
        </>
    );
}
