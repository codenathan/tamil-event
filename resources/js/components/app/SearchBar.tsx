import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import CategoryDropdown from '@/components/app/CategoryDropdown';
import LocationDropdown from '@/components/app/LocationDropdown';

interface SearchBarProps {
    large?: boolean;
    initialQuery?: string;
    initialLocation?: string;
    initialCategory?: string;
}

/** Parse "City, Country" or "Country" into separate params */
function parseLocation(location: string): { city?: string; country?: string } {
    if (!location) {
        return {};
    }

    const commaIndex = location.indexOf(', ');

    if (commaIndex !== -1) {
        return {
            city: location.slice(0, commaIndex),
            country: location.slice(commaIndex + 2),
        };
    }

    return { country: location };
}

const SearchBar = ({ large = false, initialQuery = '', initialLocation = '', initialCategory = '' }: SearchBarProps) => {
    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);
    const [category, setCategory] = useState(initialCategory);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        setLocation(initialLocation);
    }, [initialLocation]);

    useEffect(() => {
        setCategory(initialCategory);
    }, [initialCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { city, country } = parseLocation(location);
        const params: Record<string, string> = {};

        if (query.trim()) {
            params.q = query.trim();
        }

        if (city) {
            params.city = city;
        }

        if (country) {
            params.country = country;
        }

        if (category) {
            params.category = category;
        }

        router.get('/search', params);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex w-full flex-col gap-3 sm:flex-row ${large ? 'max-w-4xl' : 'max-w-3xl'}`}
        >
            <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Tamil event services worldwide..."
                    className={`w-full rounded-xl border border-input bg-card pr-4 pl-12 font-body placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none ${large ? 'h-14 text-base' : 'h-11 text-sm'}`}
                />
            </div>
            <LocationDropdown
                value={location}
                onChange={setLocation}
                large={large}
            />
            <CategoryDropdown
                value={category}
                onChange={setCategory}
                large={large}
            />
            <button
                type="submit"
                className={`shrink-0 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 ${large ? 'h-14 text-base' : 'h-11 text-sm'}`}
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;
