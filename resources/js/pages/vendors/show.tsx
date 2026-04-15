import { Head, Link } from '@inertiajs/react';
import { MapPin, Phone, Mail, Globe, Instagram, Facebook, ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';
import type { Vendor} from '@/types';


interface Props {
    vendor: Vendor;
}

export default function VendorShow({ vendor }: Props) {
    const [showEnquiry, setShowEnquiry] = useState(false);

    const location = [vendor.city?.name, vendor.country?.name].filter(Boolean).join(', ');
    const galleryImages = vendor.images.slice(0, 3);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: vendor.name,
        description: vendor.description ?? undefined,
        image: vendor.featured_image_url ?? undefined,
        telephone: vendor.phone ?? undefined,
        email: vendor.email ?? undefined,
        url: vendor.website ?? undefined,
        address: {
            '@type': 'PostalAddress',
            addressLocality: vendor.city?.name ?? undefined,
            addressCountry: vendor.country?.name ?? undefined,
        },
        sameAs: [
            vendor.social_instagram
                ? `https://instagram.com/${vendor.social_instagram}`
                : null,
            vendor.social_facebook
                ? `https://facebook.com/${vendor.social_facebook}`
                : null,
        ].filter(Boolean),
    };

    return (
        <>
            <Head>
                <title>{`${vendor.name} — Tamil ${vendor.category?.name ?? ''} in ${vendor.city?.name ?? ''} — TamilEvents`}</title>
                <meta
                    name="description"
                    content={`${vendor.description ?? ''} Contact ${vendor.name} for your Tamil event in ${location}.`}
                />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Head>

            <div className="container py-8">
                <Link
                    href="/search"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft size={16} /> Back to search
                </Link>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left: images + details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Featured image */}
                        <div className="aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
                            {vendor.featured_image ? (
                                <img
                                    src={vendor.featured_image_url}
                                    alt={vendor.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center font-display text-7xl font-bold text-muted-foreground/20 select-none">
                                    {vendor.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Gallery */}
                        {galleryImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {galleryImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="aspect-[4/3] overflow-hidden rounded-lg"
                                    >
                                        <img
                                            src={img.url}
                                            alt={`${vendor.name} gallery`}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Name + location */}
                        <div>
                            <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
                                {vendor.name}
                            </h1>
                            <div className="mb-4 flex flex-wrap items-center gap-4">
                                {location && (
                                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin size={14} /> {location}
                                    </span>
                                )}
                                {vendor.category && (
                                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                                        {vendor.category.name}
                                    </span>
                                )}
                            </div>
                            {vendor.description && (
                                <p className="leading-relaxed text-foreground/80">
                                    {vendor.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: contact card */}
                    <div>
                        <div className="sticky top-6 space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
                            <h3 className="font-display text-lg font-semibold">
                                Contact
                            </h3>

                            <div className="space-y-3 text-sm">
                                {vendor.phone && (
                                    <a
                                        href={`tel:${vendor.phone}`}
                                        className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-foreground"
                                    >
                                        <Phone
                                            size={16}
                                            className="shrink-0 text-primary"
                                        />
                                        {vendor.phone}
                                    </a>
                                )}
                                {vendor.email && (
                                    <a
                                        href={`mailto:${vendor.email}`}
                                        className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-foreground"
                                    >
                                        <Mail
                                            size={16}
                                            className="shrink-0 text-primary"
                                        />
                                        {vendor.email}
                                    </a>
                                )}
                                {vendor.website && (
                                    <a
                                        href={vendor.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-foreground"
                                    >
                                        <Globe
                                            size={16}
                                            className="shrink-0 text-primary"
                                        />
                                        Website
                                    </a>
                                )}
                            </div>

                            {(vendor.social_instagram ||
                                vendor.social_facebook) && (
                                <div className="flex gap-4 border-t border-border pt-3">
                                    {vendor.social_instagram && (
                                        <a
                                            href={`https://instagram.com/${vendor.social_instagram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            <Instagram size={15} />{' '}
                                            {vendor.social_instagram}
                                        </a>
                                    )}
                                    {vendor.social_facebook && (
                                        <a
                                            href={`https://facebook.com/${vendor.social_facebook}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            <Facebook size={15} />{' '}
                                            {vendor.social_facebook}
                                        </a>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => setShowEnquiry(!showEnquiry)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <Send size={16} /> Enquire Now
                            </button>

                            {showEnquiry && (
                                <div className="space-y-3 border-t border-border pt-3">
                                    <input
                                        placeholder="Your name"
                                        className="h-10 w-full rounded-lg border border-input bg-muted/50 px-3 font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <input
                                        placeholder="Your email"
                                        type="email"
                                        className="h-10 w-full rounded-lg border border-input bg-muted/50 px-3 font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <textarea
                                        placeholder="Your message..."
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-input bg-muted/50 px-3 py-2 font-body text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <button className="w-full rounded-xl bg-accent px-6 py-2.5 font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
                                        Send Enquiry
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
