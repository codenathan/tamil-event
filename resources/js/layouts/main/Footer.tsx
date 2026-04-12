import { Link } from '@inertiajs/react';
import { categories } from '@/data/categories';
export default function Footer() {
    return (
        <footer className="mt-20 border-t border-border bg-muted/30">
            <div className="container grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <h3 className="text-gradient mb-3 font-display text-lg font-bold">
                        TamilEvents
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
                        {[
                            'London',
                            'Toronto',
                            'Sydney',
                            'Paris',
                            'Dubai',
                            'Chennai',
                        ].map((loc) => (
                            <li key={loc}>
                                <Link href={`/location/${loc.toLowerCase().replace(' ', '-')}`} className="text-sm text-muted-foreground">
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
                                href="/privacy-policy"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <span className="text-sm text-muted-foreground">
                                Terms of Service
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border py-6">
                <p className="text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} TamilEvents. All rights
                    reserved.
                </p>
            </div>
        </footer>
    );
}
