import { Head, Link, useForm } from '@inertiajs/react';
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    Instagram,
    Facebook,
    ArrowLeft,
    Send,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Vendor } from '@/types';

interface Props {
    vendor: Vendor;
}

/** Display a calendar date as YYYY-MM-DD (ISO 8601) for unambiguous international use. */
function formatDateYmd(value: string): string {
    const trimmed = value.trim();
    const ymd = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);

    if (ymd) {
        return ymd[1];
    }

    const t = Date.parse(trimmed);

    if (Number.isNaN(t)) {
        return trimmed;
    }

    return new Date(t).toISOString().slice(0, 10);
}

/** Split stored description into paragraphs (double newlines); falls back to one block. */
function descriptionParagraphs(text: string): string[] {
    return text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
}

export default function VendorShow({ vendor }: Props) {
    const [showEnquiry, setShowEnquiry] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        date: '',
        message: '',
    });

    const location = [vendor.city?.name, vendor.country?.name]
        .filter(Boolean)
        .join(', ');
    const galleryImages = vendor.images.slice(0, 3);

    const services = vendor.services?.length ? vendor.services : [];

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
        ...(services.length > 0 ? { knowsAbout: services } : {}),
    };

    function submitEnquiry(e: React.FormEvent) {
        e.preventDefault();
        post(`/vendors/${vendor.slug}/enquire`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    }

    return (
        <>
            <Head>
                <title>{`${vendor.name} — Tamil ${vendor.category?.name ?? ''} in ${vendor.city?.name ?? ''} — TamilEventPlanner`}</title>
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
                            {vendor.featured_image_url ? (
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
                                <div className="mt-6">
                                    <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                                        Description
                                    </h2>
                                    <div className="space-y-4 leading-relaxed text-foreground/85">
                                        {descriptionParagraphs(
                                            vendor.description,
                                        ).map((block, index) => (
                                            <p
                                                key={index}
                                                className="whitespace-pre-line"
                                            >
                                                {block}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {services.length > 0 && (
                                <div className="mt-6">
                                    <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                                        Services
                                    </h2>
                                    <ul
                                        className="flex flex-wrap gap-2"
                                        aria-label="Services offered"
                                    >
                                        {services.map((service, index) => (
                                            <li key={`${service}-${index}`}>
                                                <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                                                    {service}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
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
                                type="button"
                                onClick={() => setShowEnquiry(!showEnquiry)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <Send size={16} /> Enquire Now
                            </button>

                            {showEnquiry && (
                                <form
                                    onSubmit={submitEnquiry}
                                    className="space-y-3 border-t border-border pt-3"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="enquiry-name">
                                            Your name
                                        </Label>
                                        <Input
                                            id="enquiry-name"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="Your name"
                                            required
                                            autoComplete="name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="enquiry-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="enquiry-email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="enquiry-date">
                                            Event date{' '}
                                            <span className="font-normal text-muted-foreground">
                                                (YYYY-MM-DD)
                                            </span>
                                        </Label>
                                        <Input
                                            id="enquiry-date"
                                            name="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) =>
                                                setData('date', e.target.value)
                                            }
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Dates are shown and saved as{' '}
                                            <span className="font-mono tabular-nums">
                                                {data.date
                                                    ? formatDateYmd(data.date)
                                                    : 'YYYY-MM-DD'}
                                            </span>{' '}
                                            (ISO 8601) to avoid US/EU format
                                            confusion.
                                        </p>
                                        <InputError message={errors.date} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="enquiry-message">
                                            Message
                                        </Label>
                                        <Textarea
                                            id="enquiry-message"
                                            name="message"
                                            value={data.message}
                                            onChange={(e) =>
                                                setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Your message..."
                                            rows={3}
                                            required
                                        />
                                        <InputError message={errors.message} />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing
                                            ? 'Sending…'
                                            : 'Send enquiry'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
