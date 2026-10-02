import { Head, Link, usePage } from '@inertiajs/react';
import CategoryCard from '@/components/app/CategoryCard';
import SearchBar from '@/components/app/SearchBar';
import type { Category } from '@/data/categories';

interface PageProps {
    categories: Category[];
    meta: {
        title: string;
        description: string;
        canonicalUrl: string;
    };
    logoUrl: string;
    searchUrlTemplate: string;
    [key: string]: unknown;
}

export default function Welcome() {
    const { categories, meta, logoUrl, searchUrlTemplate } =
        usePage<PageProps>().props;

    const organizationId = `${meta.canonicalUrl}#organization`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': organizationId,
                name: 'TamilEventPlanner',
                url: meta.canonicalUrl,
                logo: logoUrl,
            },
            {
                '@type': 'WebSite',
                '@id': `${meta.canonicalUrl}#website`,
                name: 'TamilEventPlanner',
                url: meta.canonicalUrl,
                description: meta.description,
                publisher: { '@id': organizationId },
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: searchUrlTemplate,
                    },
                    'query-input': 'required name=search_term_string',
                },
            },
        ],
    };

    return (
        <>
            <Head>
                <title>{meta.title}</title>
                <meta name="description" content={meta.description} />
                <link rel="canonical" href={meta.canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="TamilEventPlanner" />
                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.description} />
                <meta property="og:url" content={meta.canonicalUrl} />
                <meta property="og:image" content={logoUrl} />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Head>

            {/* Hero */}
            <section className="gradient-hero py-20 md:py-28">
                <div className="animate-fade-in-up container flex flex-col items-center gap-6 text-center">
                    <h1 className="max-w-3xl font-display text-4xl leading-tight font-bold text-primary-foreground md:text-5xl lg:text-6xl">
                        Find Tamil Event Services{' '}
                        <span className="opacity-80">Worldwide</span>
                    </h1>
                    <p className="max-w-xl font-body text-lg text-primary-foreground/80 md:text-xl">
                        The global directory connecting you with the best Tamil
                        vendors for weddings, cultural events, and celebrations.
                    </p>
                    <SearchBar large />
                </div>
            </section>
            {/* Categories */}
            <section className="container py-16">
                <h2 className="mb-10 text-center font-display text-2xl font-bold md:text-3xl">
                    Browse by Category
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                    {categories.map((cat) => (
                        <CategoryCard key={cat.slug} category={cat} />
                    ))}
                </div>
            </section>
            {/* CTA */}
            <section className="container pb-16">
                <div className="rounded-2xl bg-secondary p-8 text-center md:p-12">
                    <h2 className="mb-3 font-display text-2xl font-bold md:text-3xl">
                        Are you a Tamil event vendor?
                    </h2>
                    <p className="mx-auto mb-6 max-w-lg text-muted-foreground">
                        Join the largest global directory of Tamil event
                        services and reach thousands of clients worldwide.
                    </p>
                    <Link
                        href="/list-your-business"
                        className="inline-block h-12 rounded-xl bg-primary px-8 leading-[3rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        List Your Business
                    </Link>
                </div>
            </section>
        </>
    );
}
