import { FolderOpen, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/types';

const galleryInputId = 'dashboard-gallery-images';

type FeaturedImageProps = {
    vendor: Vendor;
    featuredFile: File | null;
    setFeaturedFile: (file: File | null) => void;
    removeFeatured: boolean;
    setRemoveFeatured: (value: boolean) => void;
    featuredImageError?: string;
};

export function DashboardListingFeaturedImage({
    vendor,
    featuredFile,
    setFeaturedFile,
    removeFeatured,
    setRemoveFeatured,
    featuredImageError,
}: FeaturedImageProps) {
    const preview = featuredFile ? (
        <img
            src={URL.createObjectURL(featuredFile)}
            className="size-full object-cover"
            alt=""
        />
    ) : vendor.featured_image_url && !removeFeatured ? (
        <img
            src={vendor.featured_image_url ?? undefined}
            className="size-full object-cover"
            alt=""
        />
    ) : (
        <span className="text-xs text-muted-foreground">No image</span>
    );

    return (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <Label htmlFor="dashboard-featured-image" className="text-sm">
                Featured image
            </Label>

            <div className="relative mx-auto mt-2 aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border bg-background">
                <div className="flex size-full items-center justify-center">
                    {preview}
                </div>
            </div>

            <input
                type="file"
                accept="image/*"
                className="hidden"
                id="dashboard-featured-image"
                onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFeaturedFile(file);
                    if (file) {
                        setRemoveFeatured(false);
                    }
                }}
            />

            <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2 text-xs"
                    onClick={() =>
                        document.getElementById('dashboard-featured-image')?.click()
                    }
                >
                    <Upload className="size-3.5 shrink-0" />
                    {vendor.featured_image_url && !removeFeatured && !featuredFile
                        ? 'Replace'
                        : 'Upload'}
                </Button>

                {vendor.featured_image_url && !featuredFile && !removeFeatured ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setRemoveFeatured(true)}
                    >
                        <Trash2 className="size-3.5 shrink-0" />
                        Remove
                    </Button>
                ) : featuredFile ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => {
                            setFeaturedFile(null);
                            const el = document.getElementById(
                                'dashboard-featured-image',
                            ) as HTMLInputElement | null;
                            if (el) {
                                el.value = '';
                            }
                        }}
                    >
                        Clear
                    </Button>
                ) : (
                    <span />
                )}
            </div>

            {removeFeatured && !featuredFile && (
                <p className="mt-1.5 text-center text-xs text-muted-foreground">
                    Removed on save
                </p>
            )}
            <InputError message={featuredImageError} className="mt-1.5" />
        </div>
    );
}

type GalleryProps = {
    removedGalleryIds: number[];
    setRemovedGalleryIds: React.Dispatch<React.SetStateAction<number[]>>;
    visibleGalleryImages: Vendor['images'];
    resetKey: string;
    onNewGalleryFilesChange: (files: File[]) => void;
    newImagesError?: string;
};

export function DashboardListingGallery({
    removedGalleryIds,
    setRemovedGalleryIds,
    visibleGalleryImages,
    resetKey,
    onNewGalleryFilesChange,
    newImagesError,
}: GalleryProps) {
    const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
    const inputId = useId();
    const galleryInputDomId = `${galleryInputId}-${inputId}`;
    const imageCount =
        visibleGalleryImages.length + newGalleryFiles.length;

    useEffect(() => {
        onNewGalleryFilesChange(newGalleryFiles);
    }, [newGalleryFiles, onNewGalleryFilesChange]);

    useEffect(() => {
        setNewGalleryFiles([]);
    }, [resetKey]);

    return (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                    Gallery
                    <span className="ml-1 font-normal text-muted-foreground">
                        ({imageCount})
                    </span>
                </p>
                <label
                    htmlFor={galleryInputDomId}
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'h-7 cursor-pointer gap-1 px-2 text-xs',
                    )}
                >
                    <Plus className="size-3" />
                    Add
                </label>
            </div>

            <input
                id={galleryInputDomId}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                    const files = e.target.files;
                    if (!files?.length) {
                        return;
                    }
                    setNewGalleryFiles((prev) => [...prev, ...Array.from(files)]);
                    e.target.value = '';
                }}
            />

            {imageCount === 0 ? (
                <div className="mt-2 rounded-md border border-dashed px-2 py-5 text-center text-xs text-muted-foreground">
                    <FolderOpen className="mx-auto mb-1.5 size-6 opacity-50" />
                    No photos yet
                </div>
            ) : (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {visibleGalleryImages.map((img) => (
                        <div
                            key={`existing-${img.id}`}
                            className="group relative aspect-square overflow-hidden rounded-md border"
                        >
                            <img
                                src={img.url}
                                alt="Gallery"
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setRemovedGalleryIds((prev) => [
                                        ...prev,
                                        img.id,
                                    ]);
                                }}
                                className="absolute top-0.5 right-0.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                aria-label="Remove gallery image"
                            >
                                <X className="size-2.5" />
                            </button>
                        </div>
                    ))}

                    {newGalleryFiles.map((file, i) => (
                        <div
                            key={`new-${i}-${file.name}`}
                            className="group relative aspect-square overflow-hidden rounded-md border"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`New upload ${i + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setNewGalleryFiles((prev) => {
                                        const next = [...prev];
                                        next.splice(i, 1);
                                        return next;
                                    });
                                }}
                                className="absolute top-0.5 right-0.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="size-2.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {removedGalleryIds.length > 0 && (
                <p className="mt-1.5 text-center text-xs text-muted-foreground">
                    {removedGalleryIds.length} removed on save
                </p>
            )}
            <InputError message={newImagesError} className="mt-1.5" />
        </div>
    );
}
