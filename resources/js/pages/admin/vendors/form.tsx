import { router, useForm } from '@inertiajs/react';
import { ArrowLeft, FolderOpen, Plus, Save, Upload, X } from 'lucide-react';
import type { ReactNode} from 'react';
import { useRef } from 'react';
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
import { index, update, store } from '@/routes/admin/vendors';
import type { Vendor , Category, City } from '@/types';

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;


export default function Form({ vendor ,categories, cities }: { vendor: Vendor, categories: Category[], cities: City[]}) {
    const isEdit = !!vendor;

    const { data, setData, post, put, errors } = useForm({
        name: vendor?.name || '',
        email: vendor?.email || '',
        description: vendor?.description || '',
        category_id: vendor?.category?.id?.toString() || '',
        city_id: vendor?.city?.id?.toString() || '',
        phone: vendor?.phone || '',
        website: vendor?.website || '',
        featured_image: null as File | null,
        new_images: [] as File[],
    });

    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const handleSave = (e: { preventDefault: () => void }) => {
        e.preventDefault();

        if (isEdit) {
            put(update.url(vendor.id));
        } else {
            post(store.url());
        }
    };


    return (
        <>
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    className="gap-1.5"
                    onClick={() => router.visit(index.url())}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Vendors
                </Button>

                <div className="grid gap-6 lg:grid-cols-3">
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
                                    <Label>Business Name</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Category</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) =>
                                            setData('category_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={String(cat.id)}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category_id} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>City</Label>
                                    <Select
                                        value={data.city_id}
                                        onValueChange={(value) =>
                                            setData('city_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem
                                                    key={city.id}
                                                    value={String(city.id)}
                                                >
                                                    {city.name} (
                                                    {city.country?.name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.city_id} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label>Phone</Label>
                                    <Input
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="Phone"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email</Label>
                                    <Input
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="Email"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Website</Label>
                                    <Input
                                        value={data.website}
                                        onChange={(e) =>
                                            setData('website', e.target.value)
                                        }
                                        placeholder="Website"
                                    />
                                    <InputError message={errors.website} />
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
                            {/* IMAGE PREVIEW */}
                            {data.featured_image ? (
                                <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
                                    <img
                                        src={URL.createObjectURL(
                                            data.featured_image,
                                        )}
                                        className="h-full w-full object-cover"
                                        alt=""
                                    />
                                </div>
                            ) : vendor?.featured_image ? (
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

                            {/* FILE INPUT */}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="featured-image"
                                onChange={(e) =>
                                    setData(
                                        'featured_image',
                                        e.target.files?.[0] || null,
                                    )
                                }
                            />

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full gap-1.5"
                                onClick={() =>
                                    document
                                        .getElementById('featured-image')
                                        ?.click()
                                }
                            >
                                <Upload className="h-3.5 w-3.5" />
                                {vendor?.featured_image_url
                                    ? 'Replace Image'
                                    : 'Upload Image'}
                            </Button>
                        </CardContent>
                    </Card>
                    {/* Gallery */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Gallery (
                                {(vendor?.images?.length || 0) +
                                    data.new_images.length}{' '}
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
                                        if (!e.target.files) {
                                            return;
                                        }

                                        setData('new_images', [
                                            ...data.new_images,
                                            ...Array.from(e.target.files),
                                        ]);

                                        if (galleryInputRef.current) {
                                            galleryInputRef.current.value = '';
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
                            {/* EMPTY STATE */}
                            {!vendor?.images?.length &&
                            data.new_images.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                                    <FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    No gallery images yet. Click "Add Images" to
                                    upload.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {/* EXISTING IMAGES (DB) */}
                                    {vendor?.images?.map((img) => (
                                        <div
                                            key={`existing-${img.id}`}
                                            className="group relative aspect-4/3 overflow-hidden rounded-lg border border-border"
                                        >
                                            <img
                                                src={img.url}
                                                alt="Gallery"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}

                                    {/* NEW UPLOADS (PREVIEW ONLY) */}
                                    {data.new_images.map((file, i) => (
                                        <div
                                            key={`new-${i}`}
                                            className="group relative aspect-4/3 overflow-hidden rounded-lg border border-border"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`New upload ${i + 1}`}
                                                className="h-full w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [
                                                        ...data.new_images,
                                                    ];
                                                    updated.splice(i, 1);
                                                    setData(
                                                        'new_images',
                                                        updated,
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

                    {/* Save */}
                    <div className="flex justify-end gap-3 lg:col-span-3">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(index.url())}
                        >
                            Cancel
                        </Button>
                        <Button className="gap-1.5" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                            {isEdit ? 'Save Changes' : 'Create Vendor'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

