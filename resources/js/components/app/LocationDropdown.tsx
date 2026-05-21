import { usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { LocationsByCountry } from '@/data/categories';
import { cn } from '@/lib/utils';

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
    const { locationsByCountry = {} } = usePage<{
        locationsByCountry?: LocationsByCountry;
        [key: string]: unknown;
    }>().props;

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div
            className={cn('relative', large ? 'sm:w-56' : 'sm:w-48')}
        >
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild>
                    <Button
                        aria-expanded={open}
                        aria-label="Select location"
                        className={cn(
                            'w-full justify-between rounded-xl border border-input bg-card pl-12 font-body font-normal shadow-none hover:bg-card',
                            large ? 'h-14 text-base' : 'h-11 text-sm',
                            !value && 'text-muted-foreground',
                        )}
                        role="combobox"
                        type="button"
                        variant="outline"
                    >
                        <MapPin className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                        <span className="truncate">
                            {value || placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) p-0"
                    side="bottom"
                    avoidCollisions={false}
                >
                    <Command>
                        <CommandInput placeholder="Search city or country..." />
                        <CommandList>
                            <CommandEmpty>No locations found.</CommandEmpty>
                            {Object.entries(locationsByCountry).map(
                                ([country, cities]) => (
                                    <CommandGroup key={country}>
                                        <CommandItem
                                            keywords={[country]}
                                            onSelect={() => {
                                                onChange(country);
                                                setOpen(false);
                                            }}
                                            value={`country-${country}`}
                                            className="font-semibold text-foreground"
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 size-4',
                                                    value === country
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            {country}
                                        </CommandItem>
                                        {cities.map((city) => {
                                            const locationValue = `${city}, ${country}`;

                                            return (
                                                <CommandItem
                                                    key={`${city}-${country}`}
                                                    keywords={[
                                                        city,
                                                        country,
                                                    ]}
                                                    onSelect={() => {
                                                        onChange(
                                                            locationValue,
                                                        );
                                                        setOpen(false);
                                                    }}
                                                    value={`${city}-${country}`}
                                                    className="pl-6"
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 size-4',
                                                            value ===
                                                                locationValue
                                                                ? 'opacity-100'
                                                                : 'opacity-0',
                                                        )}
                                                    />
                                                    {city}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                ),
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {value ? (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-1/2 right-10 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear location"
                >
                    <X className="size-4" />
                </button>
            ) : null}
        </div>
    );
};

export default LocationDropdown;
