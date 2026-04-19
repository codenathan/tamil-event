import { Head } from '@inertiajs/react';
import SearchBar from '@/components/app/SearchBar';
import type { VendorCardData } from '@/components/app/VendorCard';
import VendorCard from '@/components/app/VendorCard';
import type {
    PaginatedData,
} from '@/components/app/VendorPagination';
import VendorPagination from '@/components/app/VendorPagination';

interface PaginatedVendors extends PaginatedData {
    data: VendorCardData[];
}

interface Filters {
    q: string;
    city: string;
    country: string;
}

interface CategoryProps {
    id: number;
    name: string;
    slug: string;
}

interface PageMeta {
    title: string;
    description: string;
    canonicalUrl: string;
}

interface Props {
    vendors: PaginatedVendors;
    filters: Filters;
    category?: CategoryProps;
    meta: PageMeta;
}

function buildInitialLocation(city: string, country: string): string {
    if (city && country) {
return `${city}, ${country}`;
}

    if (country) {
return country;
}

    return '';
}

export default function Search({ vendors, filters, category, meta }: Props) {
    const initialLocation = buildInitialLocation(filters.city, filters.country);

    const heading = category
        ? `${category.name} Vendors`
        : filters.q || filters.city || filters.country
          ? `Results for "${[filters.q, filters.city || filters.country].filter(Boolean).join(' in ')}"`
          : 'All Vendors';

    const subtitle = category
        ? `Browse vendors in the ${category.name} category.`
        : undefined;

    return (
        <>
            <Head>
                <title>{meta.title}</title>
                <meta name="description" content={meta.description} />
                <link rel="canonical" href={meta.canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.description} />
                <meta property="og:url" content={meta.canonicalUrl} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={meta.title} />
                <meta name="twitter:description" content={meta.description} />
            </Head>

            <section className="border-b border-border bg-secondary/40 py-6">
                <div className="container flex justify-center">
                    <SearchBar
                        initialQuery={filters.q}
                        initialLocation={initialLocation}
                    />
                </div>
            </section>

            <section className="container py-10">
                <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold md:text-3xl">
                            {heading}
                        </h1>
                        {subtitle && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
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
                        No vendors found.
                    </div>
                )}
            </section>
        </>
    );
}
