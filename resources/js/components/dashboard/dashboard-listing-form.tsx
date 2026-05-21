import { Form } from '@inertiajs/react';
import { Facebook, Globe, Instagram, Mail, PencilLine, Phone, Save, X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    DashboardListingFeaturedImage,
    DashboardListingGallery,
} from '@/components/dashboard-listing-images';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import listing from '@/routes/dashboard/listing';
import type { Vendor } from '@/types';

type ListingFormData = {
    name: string;
    description: string;
    services: string[];
    phone: string;
    email: string;
    website: string;
    social_instagram: string;
    social_facebook: string;
};

type DashboardListingFormProps = {
    vendor: Vendor;
};

export function DashboardListingForm({ vendor }: DashboardListingFormProps) {
    const [data, setData] = useState<ListingFormData>({
        name: vendor.name,
        description: vendor.description ?? '',
        services: [...(vendor.services ?? [])],
        phone: vendor.phone ?? '',
        email: vendor.email ?? '',
        website: vendor.website ?? '',
        social_instagram: vendor.social_instagram ?? '',
        social_facebook: vendor.social_facebook ?? '',
    });

    const [serviceInput, setServiceInput] = useState('');
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
    const [removeFeatured, setRemoveFeatured] = useState(false);
    const [removedGalleryIds, setRemovedGalleryIds] = useState<number[]>([]);

    const visibleGalleryImages =
        vendor.images?.filter((img) => !removedGalleryIds.includes(img.id)) ??
        [];

    const vendorMediaKey = useMemo(
        () =>
            [
                vendor.id,
                vendor.featured_image_url ?? '',
                vendor.images.map((image) => image.id).join(','),
            ].join('|'),
        [vendor],
    );

    const handleNewGalleryFilesChange = useCallback((files: File[]) => {
        setNewGalleryFiles(files);
    }, []);

    useEffect(() => {
        setData({
            name: vendor.name,
            description: vendor.description ?? '',
            services: [...(vendor.services ?? [])],
            phone: vendor.phone ?? '',
            email: vendor.email ?? '',
            website: vendor.website ?? '',
            social_instagram: vendor.social_instagram ?? '',
            social_facebook: vendor.social_facebook ?? '',
        });
        setFeaturedFile(null);
        setNewGalleryFiles([]);
        setRemoveFeatured(false);
        setRemovedGalleryIds([]);
    }, [vendorMediaKey]);

    const addServiceTag = (raw: string) => {
        const t = raw.trim();

        if (!t || data.services.length >= 20) {
            return;
        }

        if (data.services.some((s) => s.toLowerCase() === t.toLowerCase())) {
            return;
        }

        setData((prev) => ({
            ...prev,
            services: [...prev.services, t],
        }));
        setServiceInput('');
    };

    const removeServiceTag = (index: number) => {
        setData((prev) => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index),
        }));
    };

    const onServiceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addServiceTag(serviceInput);
        } else if (
            e.key === 'Backspace' &&
            serviceInput === '' &&
            data.services.length > 0
        ) {
            removeServiceTag(data.services.length - 1);
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <Form
                {...listing.update.form()}
                options={{ preserveScroll: true }}
                transform={() => ({
                    name: data.name,
                    description: data.description,
                    services: data.services,
                    phone: data.phone,
                    email: data.email,
                    website: data.website,
                    social_instagram: data.social_instagram,
                    social_facebook: data.social_facebook,
                    ...(featuredFile ? { featured_image: featuredFile } : {}),
                    ...(newGalleryFiles.length > 0
                        ? { new_images: newGalleryFiles }
                        : {}),
                    ...(removeFeatured ? { delete_featured: true } : {}),
                    ...(removedGalleryIds.length > 0
                        ? { delete_gallery_ids: removedGalleryIds }
                        : {}),
                })}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 sm:px-5">
                            <div className="min-w-0">
                                <h2 className="font-display flex items-center gap-2 text-base font-semibold sm:text-lg">
                                    <PencilLine className="size-4 shrink-0 text-primary sm:size-5" />
                                    Edit your listing
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                    Update your public profile for Tamil event
                                    planners.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
                            <aside className="space-y-4">
                                <DashboardListingFeaturedImage
                                    vendor={vendor}
                                    featuredFile={featuredFile}
                                    setFeaturedFile={setFeaturedFile}
                                    removeFeatured={removeFeatured}
                                    setRemoveFeatured={setRemoveFeatured}
                                    featuredImageError={errors.featured_image}
                                />
                                <DashboardListingGallery
                                    removedGalleryIds={removedGalleryIds}
                                    setRemovedGalleryIds={setRemovedGalleryIds}
                                    visibleGalleryImages={visibleGalleryImages}
                                    resetKey={vendorMediaKey}
                                    onNewGalleryFilesChange={
                                        handleNewGalleryFilesChange
                                    }
                                    newImagesError={errors.new_images}
                                />
                            </aside>

                            <div className="space-y-4">
                                <fieldset className="space-y-3">
                                    <legend className="text-sm font-semibold">
                                        Details
                                    </legend>
                                    {/* <div className="space-y-1.5">
                                        <Label htmlFor="name">Business name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            readOnly
                                            autoComplete="organization"
                                        />
                                    </div> */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                            placeholder="Describe your services, experience, and what makes your business special."
                                            className="min-h-[96px] resize-y"
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                </fieldset>

                                <fieldset className="space-y-2">
                                    <legend className="text-sm font-semibold">
                                        Services
                                    </legend>
                                    <p className="text-xs text-muted-foreground">
                                        Enter or comma to add · max 20
                                    </p>
                                    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring">
                                        {data.services.map((tag, i) => (
                                            <span
                                                key={`${tag}-${i}`}
                                                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeServiceTag(i)}
                                                    className="rounded-full p-0.5 hover:bg-destructive/20"
                                                    aria-label={`Remove ${tag}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={serviceInput}
                                            onChange={(e) =>
                                                setServiceInput(e.target.value)
                                            }
                                            onKeyDown={onServiceKeyDown}
                                            onBlur={() => {
                                                if (serviceInput.trim()) {
                                                    addServiceTag(serviceInput);
                                                }
                                            }}
                                            placeholder={
                                                data.services.length >= 20
                                                    ? 'Maximum tags reached'
                                                    : 'e.g. Wedding photography'
                                            }
                                            disabled={data.services.length >= 20}
                                            className="min-w-24 flex-1 border-0 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {data.services.length}/20 tags
                                    </p>
                                    <InputError message={errors.services} />
                                </fieldset>

                                <fieldset className="space-y-3">
                                    <legend className="text-sm font-semibold">
                                        Contact
                                    </legend>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone">Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            phone: e.target.value,
                                                        }))
                                                    }
                                                    className="pl-10"
                                                    autoComplete="tel"
                                                />
                                            </div>
                                            <InputError message={errors.phone} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            email: e.target.value,
                                                        }))
                                                    }
                                                    className="pl-10"
                                                    autoComplete="email"
                                                    required
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="website">Website</Label>
                                            <div className="relative">
                                                <Globe className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="website"
                                                    type="url"
                                                    value={data.website}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            website: e.target.value,
                                                        }))
                                                    }
                                                    className="pl-10"
                                                    placeholder="https://"
                                                />
                                            </div>
                                            <InputError message={errors.website} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="social_instagram">Instagram</Label>
                                            <div className="relative">
                                                <Instagram className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="social_instagram"
                                                    value={data.social_instagram}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            social_instagram: e.target.value,
                                                        }))
                                                    }
                                                    className="pl-10"
                                                    placeholder="@handle or profile URL"
                                                />
                                            </div>
                                            <InputError message={errors.social_instagram} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="social_facebook">Facebook</Label>
                                            <div className="relative">
                                                <Facebook className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="social_facebook"
                                                    value={data.social_facebook}
                                                    onChange={(e) =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            social_facebook: e.target.value,
                                                        }))
                                                    }
                                                    className="pl-10"
                                                    placeholder="Page name or profile URL"
                                                />
                                            </div>
                                            <InputError message={errors.social_facebook} />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-border/60 bg-muted/20 px-4 py-2.5 sm:px-5">
                            <Button
                                type="submit"
                                disabled={processing}
                                size="sm"
                                className="w-full gap-1.5 sm:w-auto"
                            >
                                <Save className="size-4" />
                                {processing ? 'Saving…' : 'Save changes'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
