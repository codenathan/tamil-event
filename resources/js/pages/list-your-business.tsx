import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState, useRef  } from 'react';
import type {KeyboardEvent} from 'react';
import { toast } from 'sonner';
import type { Category, LocationsByCountry } from '@/data/categories';
import { termsAndConditions } from '@/routes';
import { store } from '@/routes/list-your-business';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormFields {
    businessName: string;
    category: string;
    country: string;
    city: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    instagram: string;
    facebook: string;
    services: string[];
    agreeTerms: boolean;
    featuredImage: File | null;
    images: File[];
    [key: string]: string | boolean | File | File[] | string[] | null;
}

interface PageProps {
    categories: Category[];
    locationsByCountry: LocationsByCountry;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListYourBusiness() {
    const { categories, locationsByCountry, flash } = usePage<PageProps>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const featuredImageInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<{ file: File; preview: string }[]>(
        [],
    );
    const [featuredPreview, setFeaturedPreview] = useState<{
        file: File;
        preview: string;
    } | null>(null);
    const [serviceInput, setServiceInput] = useState('');

    const { data, setData, post, processing, errors, reset } =
        useForm<FormFields>({
            businessName: '',
            category: '',
            country: '',
            city: '',
            description: '',
            phone: '',
            email: '',
            website: '',
            instagram: '',
            facebook: '',
            services: [],
            agreeTerms: false,
            featuredImage: null,
            images: [],
        });

    const cities = data.country ? (locationsByCountry[data.country] ?? []) : [];

    // ── Featured image handling ─────────────────────────────────────────────────

    const handleFeaturedImage = (files: FileList | null) => {
        if (!files || files.length === 0) {
return;
}

        const file = files[0];

        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type. Please upload a PNG, JPG, or WebP image.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(`"${file.name}" is too large. Featured image must be under 5MB.`);
            return;
        }

        if (featuredPreview) {
URL.revokeObjectURL(featuredPreview.preview);
}

        const preview = URL.createObjectURL(file);
        setFeaturedPreview({ file, preview });
        setData('featuredImage', file);
    };

    const removeFeaturedImage = () => {
        if (featuredPreview) {
URL.revokeObjectURL(featuredPreview.preview);
}

        setFeaturedPreview(null);
        setData('featuredImage', null);

        if (featuredImageInputRef.current) {
featuredImageInputRef.current.value = '';
}
    };

    // ── Image handling ──────────────────────────────────────────────────────────

    const handleFiles = (files: FileList | null) => {
        if (!files) {
            return;
        }

        const allFiles = Array.from(files);

        const oversized = allFiles.filter(
            (f) => f.type.startsWith('image/') && f.size > 5 * 1024 * 1024,
        );

        if (oversized.length > 0) {
            const names = oversized.map((f) => `"${f.name}"`).join(', ');
            toast.error(
                `${oversized.length === 1 ? `${names} is` : `${names} are`} too large. Each image must be under 5MB.`,
            );
        }

        const valid = allFiles
            .filter(
                (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024,
            )
            .slice(0, 6 - previews.length);

        const newPreviews = valid.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        const merged = [...previews, ...newPreviews].slice(0, 6);
        setPreviews(merged);
        setData(
            'images',
            merged.map((p) => p.file),
        );
    };

    const removeImage = (index: number) => {
        setPreviews((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            const next = prev.filter((_, i) => i !== index);
            setData(
                'images',
                next.map((p) => p.file),
            );

            return next;
        });
    };

    const addServiceTag = (raw: string) => {
        const t = raw.trim();

        if (!t || data.services.length >= 20) {
return;
}

        if (data.services.some((s) => s.toLowerCase() === t.toLowerCase())) {
return;
}

        setData('services', [...data.services, t]);
        setServiceInput('');
    };

    const removeServiceTag = (index: number) => {
        setData(
            'services',
            data.services.filter((_, i) => i !== index),
        );
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

    // ── Styles (Tailwind — mirrors your existing token names) ───────────────────

    const inputClass =
        'w-full rounded-xl border border-input bg-card px-4 h-11 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';
    const labelClass = 'block text-sm font-semibold mb-1.5';
    const errorClass = 'text-xs text-red-500 mt-1';

    return (
        <>
            <Head title="List Your Business | Global Tamil Event Directory" />



            {/* ── Hero ── */}
            <section className="gradient-hero py-16 md:py-20">
                <div className="animate-fade-in-up container text-center">
                    <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-5xl">
                        Join Our Global Tamil Event Directory
                    </h1>
                    <p className="mx-auto max-w-xl font-body text-lg text-primary-foreground/80">
                        List your business to connect with the global Tamil
                        community looking for event services.
                    </p>
                </div>
            </section>

            {/* ── Form ── */}
            <section className="mx-auto max-w-2xl px-4 py-12">
                {flash?.success && (
                    <div
                        role="status"
                        className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
                    >
                        {flash.success}
                    </div>
                )}
                <form
                    className="space-y-6"
                    encType="multipart/form-data"
                    onSubmit={(e) => {
                        e.preventDefault();
                        post(store.url(), {
                            onSuccess: () => {
                                reset();
                                setFeaturedPreview((current) => {
                                    if (current) {
                                        URL.revokeObjectURL(current.preview);
                                    }

                                    return null;
                                });
                                setPreviews((current) => {
                                    current.forEach((p) =>
                                        URL.revokeObjectURL(p.preview),
                                    );

                                    return [];
                                });
                                setServiceInput('');

                                if (featuredImageInputRef.current) {
                                    featuredImageInputRef.current.value = '';
                                }

                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            },
                        });
                    }}
                >
                    {/* Business Name */}
                    <div>
                        <label className={labelClass}>Business Name *</label>
                        <input
                            required
                            type="text"
                            value={data.businessName}
                            onChange={(e) =>
                                setData('businessName', e.target.value)
                            }
                            placeholder="e.g. Radiance Studios"
                            className={inputClass}
                        />
                        {errors.businessName && (
                            <p className={errorClass}>{errors.businessName}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className={labelClass}>Category *</label>
                        <select
                            required
                            value={data.category}
                            onChange={(e) =>
                                setData('category', e.target.value)
                            }
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="">Select a category</option>
                            {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className={errorClass}>{errors.category}</p>
                        )}
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Country *</label>
                            <select
                                required
                                value={data.country}
                                onChange={(e) => {
                                    setData('country', e.target.value);
                                    setData('city', '');
                                }}
                                className={`${inputClass} appearance-none`}
                            >
                                <option value="">Select country</option>
                                {Object.keys(locationsByCountry).map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {errors.country && (
                                <p className={errorClass}>{errors.country}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>City *</label>
                            <select
                                required
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                                className={`${inputClass} appearance-none`}
                                disabled={!data.country}
                            >
                                <option value="">Select city</option>
                                {cities.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {errors.city && (
                                <p className={errorClass}>{errors.city}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelClass}>
                            Short Description *
                        </label>
                        <textarea
                            required
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Tell potential clients about your services..."
                            rows={4}
                            maxLength={500}
                            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            {data.description.length}/500
                        </p>
                        {errors.description && (
                            <p className={errorClass}>{errors.description}</p>
                        )}
                    </div>

                    {/* Services (tags) */}
                    <div>
                        <label className={labelClass}>
                            Services you offer{' '}
                            <span className="font-normal text-muted-foreground">
                                (optional, up to 20)
                            </span>
                        </label>
                        <p className="mb-2 text-xs text-muted-foreground">
                            Type a service and press Enter or comma to add a tag.
                        </p>
                        <div
                            className={`flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring`}
                        >
                            {data.services.map((tag, i) => (
                                <span
                                    key={`${tag}-${i}`}
                                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
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
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (val.includes(',')) {
                                        const parts = val.split(',');
                                        parts.slice(0, -1).forEach((p) => addServiceTag(p));
                                        setServiceInput(parts[parts.length - 1]);
                                    } else {
                                        setServiceInput(val);
                                    }
                                }}
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
                                className="min-w-[8rem] flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {data.services.length}/20 tags
                        </p>
                        {errors.services && (
                            <p className={errorClass}>{errors.services}</p>
                        )}
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className={labelClass}>Featured Image</label>
                        <input
                            ref={featuredImageInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => handleFeaturedImage(e.target.files)}
                        />
                        {!featuredPreview ? (
                            <div
                                className="cursor-pointer rounded-xl border-2 border-dashed border-input bg-card p-6 text-center transition-colors hover:border-primary/50"
                                onClick={() => featuredImageInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleFeaturedImage(e.dataTransfer.files);
                                }}
                            >
                                <p className="text-sm text-gray-500">
                                    Drag & drop your featured image, or{' '}
                                    <span className="font-medium text-primary">
                                        browse
                                    </span>
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    PNG, JPG, WebP up to 5MB — displayed as your main listing image
                                </p>
                            </div>
                        ) : (
                            <div className="group relative mt-1 overflow-hidden rounded-xl border border-input">
                                <img
                                    src={featuredPreview.preview}
                                    alt="Featured image preview"
                                    className="h-48 w-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="truncate text-xs text-white">
                                        {featuredPreview.file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removeFeaturedImage}
                                        className="ml-2 shrink-0 rounded-full bg-red-600 p-1 text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {errors.featuredImage && (
                            <p className={errorClass}>{errors.featuredImage}</p>
                        )}
                    </div>

                    {/* Portfolio Images */}
                    <div>
                        <label className={labelClass}>
                            Portfolio Images (up to 6)
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        <div
                            className="cursor-pointer rounded-xl border-2 border-dashed border-input bg-card p-6 text-center transition-colors hover:border-primary/50"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFiles(e.dataTransfer.files);
                            }}
                        >
                            <p className="text-sm text-gray-500">
                                Drag & drop images here, or{' '}
                                <span className="font-medium text-primary">
                                    browse
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                PNG, JPG, WebP up to 5MB each
                            </p>
                        </div>

                        {previews.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-3">
                                {previews.map((img, i) => (
                                    <div
                                        key={i}
                                        className="group relative aspect-square overflow-hidden rounded-lg"
                                    >
                                        <img
                                            src={img.preview}
                                            alt={`Upload ${i + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.images && (
                            <p className={errorClass}>{errors.images}</p>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Phone</label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="+44 20 7123 4567"
                                className={inputClass}
                            />
                            {errors.phone && (
                                <p className={errorClass}>{errors.phone}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Email *</label>
                            <input
                                required
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="hello@business.com"
                                className={inputClass}
                            />
                            {errors.email && (
                                <p className={errorClass}>{errors.email}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Website</label>
                        <input
                            type="url"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            placeholder="https://yourbusiness.com"
                            className={inputClass}
                        />
                        {errors.website && (
                            <p className={errorClass}>{errors.website}</p>
                        )}
                    </div>

                    {/* Social */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>
                                Instagram (optional)
                            </label>
                            <input
                                type="text"
                                value={data.instagram}
                                onChange={(e) =>
                                    setData('instagram', e.target.value)
                                }
                                placeholder="@yourbusiness"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>
                                Facebook (optional)
                            </label>
                            <input
                                type="text"
                                value={data.facebook}
                                onChange={(e) =>
                                    setData('facebook', e.target.value)
                                }
                                placeholder="YourBusinessPage"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3">
                        <input
                            id="terms"
                            type="checkbox"
                            required
                            checked={data.agreeTerms}
                            onChange={(e) =>
                                setData('agreeTerms', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                        <p className="font-body text-sm leading-snug text-foreground">
                            <label
                                htmlFor="terms"
                                className="cursor-pointer"
                            >
                                I agree to the{' '}
                            </label>
                            <Link
                                href={termsAndConditions.url()}
                                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/90"
                            >
                                Terms & Conditions
                            </Link>
                            <label htmlFor="terms" className="cursor-pointer">
                                {' '}
                                and confirm that all information provided is
                                accurate.
                            </label>
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                    >
                        {processing ? 'Submitting…' : 'Submit for Review'}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        All submissions are reviewed by our team before being
                        listed in the directory.
                    </p>
                </form>
            </section>
        </>
    );
}
