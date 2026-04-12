import { Link } from '@inertiajs/react';
import { MapPin, Globe, Instagram, Facebook } from 'lucide-react';

export interface VendorCardData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    featured_image: string | null;
    website: string | null;
    social_instagram: string | null;
    social_facebook: string | null;
    category: { id: number; name: string; slug: string } | null;
    city: { id: number; name: string; slug: string } | null;
    country: { id: number; name: string; slug: string } | null;
}

export default function VendorCard({ vendor }: { vendor: VendorCardData }) {
    return (
        <div className="group flex flex-col rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden">
            <div className="relative h-48 bg-secondary">
                {vendor.featured_image ? (
                    <img
                        src={vendor.featured_image}
                        alt={vendor.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/30 text-5xl font-display font-bold select-none">
                        {vendor.name.charAt(0)}
                    </div>
                )}
                {vendor.category && (
                    <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {vendor.category.name}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-display text-lg font-semibold text-card-foreground line-clamp-1">
                    {vendor.name}
                </h3>

                {(vendor.city || vendor.country) && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin size={14} className="shrink-0" />
                        {[vendor.city?.name, vendor.country?.name].filter(Boolean).join(', ')}
                    </p>
                )}

                {vendor.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {vendor.description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex gap-3">
                        {vendor.website && (
                            <a
                                href={vendor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Website"
                            >
                                <Globe size={16} />
                            </a>
                        )}
                        {vendor.social_instagram && (
                            <a
                                href={`https://instagram.com/${vendor.social_instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram size={16} />
                            </a>
                        )}
                        {vendor.social_facebook && (
                            <a
                                href={`https://facebook.com/${vendor.social_facebook}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook size={16} />
                            </a>
                        )}
                    </div>
                    <Link
                        href={`/vendors/${vendor.slug}`}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        View profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
