import { Form, router } from '@inertiajs/react';
import {
    ArrowLeft,
    FolderOpen,
    Plus,
    Save,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import VendorsController from '@/actions/App/Http/Controllers/Admin/VendorsController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/vendors';
import type { Vendor, Category, City } from '@/types';

AdminVendorForm.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default function AdminVendorForm({
    vendor,
    categories,
    cities,
}: {
    vendor: Vendor | null;
    categories: Category[];
    cities: City[];
}) {
    const isEdit = !!vendor;

    const [name, setName] = useState(vendor?.name ?? '');
    const [email, setEmail] = useState(vendor?.email ?? '');
    const [description, setDescription] = useState(vendor?.description ?? '');
    const [categoryId, setCategoryId] = useState(
        vendor?.category?.id?.toString() ?? '',
    );
    const [cityId, setCityId] = useState(vendor?.city?.id?.toString() ?? '');
    const [phone, setPhone] = useState(vendor?.phone ?? '');
    const [website, setWebsite] = useState(vendor?.website ?? '');
    const [socialInstagram, setSocialInstagram] = useState(
        vendor?.social_instagram ?? '',
    );
    const [socialFacebook, setSocialFacebook] = useState(
        vendor?.social_facebook ?? '',
    );
    const [services, setServices] = useState<string[]>(
        vendor?.services ? [...vendor.services] : [],
    );
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
    const [removeFeatured, setRemoveFeatured] = useState(false);
    const [removedGalleryIds, setRemovedGalleryIds] = useState<number[]>([]);

    const galleryInputRef = useRef<HTMLInputElement | null>(null);
    const [serviceInput, setServiceInput] = useState('');

    const formDefinition =
        isEdit && vendor
            ? VendorsController.update.form(vendor.id)
            : VendorsController.store.form();

    const addServiceTag = (raw: string) => {
        const t = raw.trim();

        if (!t || services.length >= 20) {
            return;
        }

        if (services.some((s) => s.toLowerCase() === t.toLowerCase())) {
            return;
        }

        setServices((prev) => [...prev, t]);
        setServiceInput('');
    };

    const removeServiceTag = (index: number) => {
        setServices((prev) => prev.filter((_, i) => i !== index));
    };

    const visibleGalleryImages =
        vendor?.images?.filter((img) => !removedGalleryIds.includes(img.id)) ??
        [];

    const onServiceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addServiceTag(serviceInput);
        } else if (
            e.key === 'Backspace' &&
            serviceInput === '' &&
            services.length > 0
        ) {
            removeServiceTag(services.length - 1);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <Button
                    type="button"
                    variant="ghost"
                    className="gap-1.5"
                    onClick={() => router.visit(index.url())}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Vendors
                </Button>

                <Form
                    {...formDefinition}
                    options={{
                        preserveScroll: true,
                    }}
                    transform={(data) => ({
                        ...data,
                        ...(featuredFile ? { featured_image: featuredFile } : {}),
                        ...(newGalleryFiles.length
                            ? { new_images: newGalleryFiles }
                            : {}),
                        ...(isEdit && removeFeatured
                            ? { delete_featured: true }
                            : {}),
                        ...(isEdit && removedGalleryIds.length > 0
                            ? { delete_gallery_ids: removedGalleryIds }
                            : {}),
                    })}
                    className="grid gap-6 lg:grid-cols-3"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="hidden">
                                <input
                                    type="hidden"
                                    name="category_id"
                                    value={categoryId}
                                />
                                <input
                                    type="hidden"
                                    name="city_id"
                                    value={cityId}
                                />
                                {services.map((tag, i) => (
                                    <input
                                        key={`${tag}-${i}`}
                                        type="hidden"
                                        name={`services[${i}]`}
                                        value={tag}
                                    />
                                ))}
                            </div>

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>
                                        {isEdit
                                            ? 'Edit Vendor Details'
                                            : 'Add New Vendor'}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div>
                                            <Label htmlFor="vendor-name">
                                                Business Name
                                            </Label>
                                            <Input
                                                id="vendor-name"
                                                name="name"
                                                value={name}
                                                required
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label>Category</Label>
                                            <Select
                                                value={categoryId}
                                                required
                                                onValueChange={setCategoryId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={String(
                                                                cat.id,
                                                            )}
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.category_id}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>City</Label>
                                            <Select
                                                value={cityId}
                                                required
                                                onValueChange={setCityId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select city" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {cities.map((city) => (
                                                        <SelectItem
                                                            key={city.id}
                                                            value={String(
                                                                city.id,
                                                            )}
                                                        >
                                                            {city.name} (
                                                            {city.country?.name}
                                                            )
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.city_id}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="vendor-description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="vendor-description"
                                            name="description"
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>
                                            Services{' '}
                                            <span className="font-normal text-muted-foreground">
                                                (optional, up to 20)
                                            </span>
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Type a service and press Enter or
                                            comma to add a tag.
                                        </p>
                                        <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                                            {services.map((tag, i) => (
                                                <span
                                                    key={`${tag}-${i}`}
                                                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeServiceTag(i)
                                                        }
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
                                                    setServiceInput(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={onServiceKeyDown}
                                                onBlur={() => {
                                                    if (serviceInput.trim()) {
addServiceTag(
                                                            serviceInput,
                                                        );
}
                                                }}
                                                placeholder={
                                                    services.length >= 20
                                                        ? 'Maximum tags reached'
                                                        : 'e.g. Wedding photography'
                                                }
                                                disabled={services.length >= 20}
                                                className="min-w-32 flex-1 border-0 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {services.length}/20 tags
                                        </p>
                                        <InputError message={errors.services} />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="vendor-phone">
                                                Phone
                                            </Label>
                                            <Input
                                                id="vendor-phone"
                                                name="phone"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                                placeholder="Phone"
                                            />
                                            <InputError
                                                message={errors.phone}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="vendor-email">
                                                Email
                                            </Label>
                                            <Input
                                                id="vendor-email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                required
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="Email"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="vendor-website">
                                                Website
                                            </Label>
                                            <Input
                                                id="vendor-website"
                                                name="website"
                                                value={website}
                                                onChange={(e) =>
                                                    setWebsite(e.target.value)
                                                }
                                                placeholder="Website"
                                            />
                                            <InputError
                                                message={errors.website}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="vendor-social-instagram">
                                                Instagram
                                            </Label>
                                            <Input
                                                id="vendor-social-instagram"
                                                name="social_instagram"
                                                value={socialInstagram}
                                                onChange={(e) =>
                                                    setSocialInstagram(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="@handle or profile URL"
                                            />
                                            <InputError
                                                message={
                                                    errors.social_instagram
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="vendor-social-facebook">
                                                Facebook
                                            </Label>
                                            <Input
                                                id="vendor-social-facebook"
                                                name="social_facebook"
                                                value={socialFacebook}
                                                onChange={(e) =>
                                                    setSocialFacebook(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Page name or profile URL"
                                            />
                                            <InputError
                                                message={
                                                    errors.social_facebook
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Featured Image
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {featuredFile ? (
                                        <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
                                            <img
                                                src={URL.createObjectURL(
                                                    featuredFile,
                                                )}
                                                className="h-full w-full object-cover"
                                                alt=""
                                            />
                                        </div>
                                    ) : vendor?.featured_image_url &&
                                      !removeFeatured ? (
                                        <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
                                            <img
                                                src={
                                                    vendor.featured_image_url ??
                                                    undefined
                                                }
                                                className="h-full w-full object-cover"
                                                alt=""
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex aspect-4/3 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                                            No image
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="featured-image"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;

                                            setFeaturedFile(file);

                                            if (file) {
                                                setRemoveFeatured(false);
                                            }
                                        }}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-1.5 sm:flex-1"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            'featured-image',
                                                        )
                                                        ?.click()
                                                }
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                {vendor?.featured_image_url &&
                                                !removeFeatured &&
                                                !featuredFile
                                                    ? 'Replace Image'
                                                    : 'Upload Image'}
                                            </Button>

                                            {isEdit &&
                                                vendor?.featured_image_url &&
                                                !featuredFile &&
                                                !removeFeatured && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-1"
                                                        onClick={() =>
                                                            setRemoveFeatured(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Remove featured
                                                    </Button>
                                                )}

                                            {featuredFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full sm:flex-1"
                                                    onClick={() => {
                                                        setFeaturedFile(null);
                                                        const el =
                                                            document.getElementById(
                                                                'featured-image',
                                                            ) as
                                                                | HTMLInputElement
                                                                | null;

                                                        if (el) {
                                                            el.value = '';
                                                        }
                                                    }}
                                                >
                                                    Clear selection
                                                </Button>
                                            )}
                                        </div>
                                        {isEdit &&
                                            removeFeatured &&
                                            !featuredFile && (
                                                <p className="text-xs text-muted-foreground">
                                                    Featured image will be
                                                    removed when you save.
                                                </p>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="lg:col-span-3">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base">
                                        Gallery (
                                        {visibleGalleryImages.length +
                                            newGalleryFiles.length}{' '}
                                        images)
                                    </CardTitle>

                                    <div>
                                        <input
                                            ref={galleryInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => {
                                                const files = e.target.files;

                                                if (!files?.length) {
                                                    return;
                                                }

                                                setNewGalleryFiles((prev) => [
                                                    ...prev,
                                                    ...Array.from(files),
                                                ]);

                                                if (galleryInputRef.current) {
                                                    galleryInputRef.current.value =
                                                        '';
                                                }
                                            }}
                                        />

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5"
                                            type="button"
                                            onClick={() =>
                                                galleryInputRef.current?.click()
                                            }
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Images
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {visibleGalleryImages.length === 0 &&
                                    newGalleryFiles.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                                            <FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                            No gallery images yet. Click "Add
                                            Images" to upload.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {visibleGalleryImages.map((img) => (
                                                <div
                                                    key={`existing-${img.id}`}
                                                    className="group relative aspect-4/3 overflow-hidden rounded-lg border border-border"
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt="Gallery"
                                                        className="h-full w-full object-cover"
                                                    />

                                                    {isEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRemovedGalleryIds(
                                                                    (prev) => [
                                                                        ...prev,
                                                                        img.id,
                                                                    ],
                                                                );
                                                            }}
                                                            className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                                            aria-label="Remove gallery image"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {newGalleryFiles.map((file, i) => (
                                                <div
                                                    key={`new-${i}-${file.name}`}
                                                    className="group relative aspect-4/3 overflow-hidden rounded-lg border border-border"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(
                                                            file,
                                                        )}
                                                        alt={`New upload ${i + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setNewGalleryFiles(
                                                                (prev) => {
                                                                    const u = [
                                                                        ...prev,
                                                                    ];
                                                                    u.splice(
                                                                        i,
                                                                        1,
                                                                    );

                                                                    return u;
                                                                },
                                                            );
                                                        }}
                                                        className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3 lg:col-span-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(index.url())
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-1.5"
                                >
                                    <Save className="h-4 w-4" />
                                    {isEdit
                                        ? 'Save Changes'
                                        : 'Create Vendor'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
