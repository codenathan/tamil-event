import { Link, usePage } from '@inertiajs/react';
import type { Category, LocationsByCountry } from '@/data/categories';
import { privacyPolicy, termsAndConditions } from '@/routes';

export default function Footer() {
    const { categories, locationsByCountry } = usePage<{
        categories: Category[];
        locationsByCountry: LocationsByCountry;
        [key: string]: unknown;
    }>().props;
    const popularLocations = Object.values(locationsByCountry)
        .flat()
        .slice(0, 6);

    return (
        <footer className="mt-20 border-t border-border bg-muted/30">
            <div className="container grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <h3 className="text-gradient mb-3 font-display text-lg font-bold">
                    TamilEventPlanner
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        The global directory for Tamil event services. Discover
                        and book the best vendors for your celebrations
                        worldwide.
                    </p>
                </div>
                <div>
                    <h4 className="mb-3 font-display font-semibold text-foreground">
                        Categories
                    </h4>
                    <ul className="space-y-2">
                        {categories.slice(0, 6).map((cat) => (
                            <li key={cat.slug}>
                                <Link
                                    href={`/category/${cat.slug}`}
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="mb-3 font-display font-semibold text-foreground">
                        Locations
                    </h4>
                    <ul className="space-y-2">
                        {popularLocations.map((loc) => (
                            <li key={loc}>
                                <Link
                                    href={`/location/${loc.toLowerCase().replace(' ', '-')}`}
                                    className="text-sm text-muted-foreground"
                                >
                                    {loc}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="mb-3 font-display font-semibold text-foreground">
                        Company
                    </h4>
                    <ul className="space-y-2">
                        <li>
                            <span className="text-sm text-muted-foreground">
                                About Us
                            </span>
                        </li>
                        <li>
                            <Link
                                href="/contact"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={termsAndConditions.url()}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Terms & Conditions
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={privacyPolicy.url()}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href='/links' className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Links
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border py-6">
                <p className="text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} TamilEventPlanner. All rights
                    reserved.
                </p>
            </div>
        </footer>
    );
}
