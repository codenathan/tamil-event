import { MapPin, ChevronDown, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { LocationsByCountry } from '@/data/categories';

interface LocationDropdownProps {
    value: string;
    onChange: (value: string) => void;
    large?: boolean;
    placeholder?: string;
}

const LocationDropdown = ({
    value,
    onChange,
    large = false,
    placeholder = 'City or country',
}: LocationDropdownProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { locationsByCountry = {} } = usePage<{
        locationsByCountry?: LocationsByCountry;
        [key: string]: unknown;
    }>().props;

    const close = useCallback(() => {
        setOpen(false);
        setSearch('');
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                close();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [close]);

    useEffect(() => {
        if (!open) {
            return;
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, close]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return locationsByCountry;
        const result: Record<string, string[]> = {};
        for (const [country, cities] of Object.entries(locationsByCountry)) {
            const matchingCities = cities.filter(
                (c) =>
                    c.toLowerCase().includes(q) ||
                    country.toLowerCase().includes(q),
            );
            if (matchingCities.length > 0) {
                result[country] = matchingCities;
            }
        }
        return result;
    }, [search, locationsByCountry]);

    const handleSelectCity = (city: string, country: string) => {
        onChange(`${city}, ${country}`);
        close();
    };

    const handleSelectCountry = (country: string) => {
        onChange(country);
        close();
    };

    const handleClear = () => {
        onChange('');
        setSearch('');
        inputRef.current?.focus();
    };

    const displayValue = value || '';

    return (
        <div
            ref={containerRef}
            className={`relative ${large ? 'sm:w-56' : 'sm:w-48'}`}
        >
            <MapPin className="pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
                ref={inputRef}
                type="text"
                value={open ? search : displayValue}
                onChange={(e) => {
                    setSearch(e.target.value);
                    if (!open) setOpen(true);
                }}
                onFocus={() => {
                    setSearch(value);
                    setOpen(true);
                }}
                placeholder={placeholder}
                className={`w-full rounded-xl border border-input bg-card pr-10 pl-12 font-body placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none ${large ? 'h-14 text-base' : 'h-11 text-sm'}`}
                aria-label="Select location"
                aria-expanded={open}
                aria-haspopup="listbox"
                autoComplete="off"
                role="combobox"
            />
            {value ? (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear location"
                >
                    <X className="h-4 w-4" />
                </button>
            ) : (
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            )}

            {open && (
                <div
                    className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-input bg-popover shadow-lg"
                    role="listbox"
                >
                    {Object.keys(filtered).length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                            No locations found
                        </p>
                    ) : (
                        Object.entries(filtered).map(([country, cities]) => (
                            <div key={country}>
                                <button
                                    type="button"
                                    onClick={() => handleSelectCountry(country)}
                                    className="w-full px-4 pt-3 pb-1 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
                                >
                                    {country}
                                </button>
                                {cities.map((city) => (
                                    <button
                                        key={`${city}-${country}`}
                                        type="button"
                                        onClick={() =>
                                            handleSelectCity(city, country)
                                        }
                                        className="w-full px-4 py-2 text-left font-body text-sm transition-colors hover:bg-accent/10"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationDropdown;
