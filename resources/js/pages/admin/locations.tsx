import { router } from '@inertiajs/react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { store as cityStore, destroy as cityDestroy } from '@/routes/admin/locations/cities';
import { store as countryStore, destroy as countryDestroy } from '@/routes/admin/locations/countries';

import type { Country, City } from '@/types';


interface Props {
    countries: Country[];
}

// ---------- page ----------
function LocationsPage({ countries }: Props) {
    const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
    const [newCountry, setNewCountry] = useState('');
    const [newCity, setNewCity] = useState('');

    const selectedCountry = countries.find((c) => c.id === selectedCountryId) ?? null;

    // --- countries ---
    const addCountry = () => {
        const name = newCountry.trim();

        if (!name) {
            return;
        }

        router.post(
            countryStore.url(),
            { name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewCountry('');
                    toast(`${name} added`);
                },
                onError: (e) => toast(e.name ?? 'Could not add country'),
            },
        );
    };

    const removeCountry = (country: Country) => {
        router.delete(
            countryDestroy.url( { country: country.id }),{
            preserveScroll: true,
            onSuccess: () => {
                if (selectedCountryId === country.id) {
setSelectedCountryId(null);
}

                toast(`${country.name} removed` );
            },
        });
    };

    // --- cities ---
    const addCity = () => {
        const name = newCity.trim();

        if (!name || !selectedCountry) {
return;
}

        router.post(
            cityStore.url({ country: selectedCountry.id }),
            { name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewCity('');
                    toast(`${name} added to ${selectedCountry.name}`);
                },
                onError: (e) => toast(e.name ?? 'Could not add city'),
            },
        );
    };

    const removeCity = (city: City) => {
        if (!selectedCountry) {
return;
}

        router.delete(
            cityDestroy.url({ country: selectedCountry.id, city: city.id }),
            {
                preserveScroll: true,
                onSuccess: () => toast(`${city.name} removed`),
            },
        );
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Countries */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        Countries ({countries.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="New country…"
                            value={newCountry}
                            onChange={(e) => setNewCountry(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCountry()}
                        />
                        <Button size="sm" onClick={addCountry}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="max-h-[400px] space-y-1 overflow-y-auto">
                        {countries.map((c) => (
                            <div
                                key={c.id}
                                className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                                    selectedCountryId === c.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                }`}
                                onClick={() => setSelectedCountryId(c.id)}
                            >
                                <span>
                                    {c.name} ({c.cities_count} cities)
                                </span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete country?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove {c.name} and all its cities.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => removeCountry(c)}>
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                        {countries.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">No countries yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Cities */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        {selectedCountry ? `Cities in ${selectedCountry.name}` : 'Select a country'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {selectedCountry ? (
                        <>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New city…"
                                    value={newCity}
                                    onChange={(e) => setNewCity(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCity()}
                                />
                                <Button size="sm" onClick={addCity}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-1">
                                {selectedCountry.cities.map((city) => (
                                    <div
                                        key={city.id}
                                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                                    >
                                        <span>{city.name}</span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete city?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will remove {city.name} from {selectedCountry.name}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => removeCity(city)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))}
                                {selectedCountry.cities.length === 0 && (
                                    <p className="py-4 text-center text-sm text-muted-foreground">No cities yet.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Select a country to manage its cities.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

LocationsPage.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default LocationsPage;
