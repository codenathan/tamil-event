import { Link, usePage } from '@inertiajs/react';
import category from '@/routes/category';
import location from '@/routes/location';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
}

interface City {
    id: number;
    name: string;
    slug: string;
    country: Country;
}

interface Country {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
    cities: City[];
    [key: string]: unknown;
}

export default function Links() {
    const { categories, cities } = usePage<Props>().props;

    return (
        <div className="container space-y-12 py-12">
            {/* Categories */}
            <section>
                <h2 className="mb-6 font-display text-2xl font-bold">
                    Browse by Category
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={category.show({ category: cat.slug })}
                            className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </section>

            {/* Cities / Locations */}
            <section>
                <h2 className="mb-6 font-display text-2xl font-bold">
                    Browse by Location
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {cities.map((city) => (
                        <Link
                            key={city.id}
                            href={location.show({ city: city.slug })}
                            className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {city.country.name} - {city.name}
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
