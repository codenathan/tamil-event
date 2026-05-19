import { Form, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Trash2,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import BlogController from '@/actions/App/Http/Controllers/Admin/BlogController';
import InputError from '@/components/input-error';
import TiptapEditor from '@/components/TiptapEditor';
import { Badge } from '@/components/ui/badge';
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
import { index } from '@/routes/admin/blogs';
import type { Blog } from '@/types';
import { BlogStatus } from '@/types/models';

AdminBlogForm.layout = (page: ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default function AdminBlogForm({ blog }: { blog: Blog | null }) {
    const isEdit = !!blog;

    const [title, setTitle] = useState(blog?.title ?? '');
    const [excerpt, setExcerpt] = useState(blog?.excerpt ?? '');
    const [content, setContent] = useState(blog?.content ?? '');
    const [status, setStatus] = useState<BlogStatus>(
        (blog?.status as BlogStatus) ?? BlogStatus.DRAFT,
    );
    const [publishedAt, setPublishedAt] = useState(
        blog?.published_at
            ? new Date(blog.published_at).toISOString().slice(0, 16)
            : '',
    );
    const [metaTitle, setMetaTitle] = useState(blog?.meta_title ?? '');
    const [metaDescription, setMetaDescription] = useState(
        blog?.meta_description ?? '',
    );
    const [metaKeywords, setMetaKeywords] = useState(
        blog?.meta_keywords ?? '',
    );
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [removeFeatured, setRemoveFeatured] = useState(false);

    const formDefinition =
        isEdit && blog
            ? BlogController.update.form(blog.id)
            : BlogController.store.form();

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
                    Back to Blog Posts
                </Button>

                <Form
                    {...formDefinition}
                    options={{
                        preserveScroll: true,
                    }}
                    transform={(data) => ({
                        ...data,
                        ...(featuredFile
                            ? { featured_image: featuredFile }
                            : {}),
                        ...(isEdit && removeFeatured
                            ? { delete_featured: true }
                            : {}),
                    })}
                    className="grid gap-6 lg:grid-cols-3"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="hidden">
                                <input
                                    type="hidden"
                                    name="status"
                                    value={status}
                                />
                            </div>

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>
                                        {isEdit
                                            ? 'Edit Blog Post'
                                            : 'New Blog Post'}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="blog-title">
                                            Title
                                        </Label>
                                        <Input
                                            id="blog-title"
                                            name="title"
                                            value={title}
                                            required
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            placeholder="Post title"
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="blog-excerpt">
                                            Excerpt
                                        </Label>
                                        <Textarea
                                            id="blog-excerpt"
                                            name="excerpt"
                                            value={excerpt}
                                            onChange={(e) =>
                                                setExcerpt(e.target.value)
                                            }
                                            placeholder="Short summary of the post"
                                            rows={3}
                                        />
                                        <InputError message={errors.excerpt} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="blog-content">
                                            Content
                                        </Label>
                                        <input
                                            type="hidden"
                                            name="content"
                                            value={content}
                                        />
                                        <TiptapEditor
                                            value={content}
                                            onChange={setContent}
                                            error={errors.content}
                                        />
                                        <InputError message={errors.content} />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label>Status</Label>
                                            <Select
                                                value={status}
                                                onValueChange={(
                                                    v: BlogStatus,
                                                ) => setStatus(v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">
                                                        Draft
                                                    </SelectItem>
                                                    <SelectItem value="published">
                                                        Published
                                                    </SelectItem>
                                                    <SelectItem value="archived">
                                                        Archived
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.status}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="blog-published-at">
                                                Published At
                                            </Label>
                                            <Input
                                                id="blog-published-at"
                                                name="published_at"
                                                type="datetime-local"
                                                value={publishedAt}
                                                onChange={(e) =>
                                                    setPublishedAt(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.published_at}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="blog-meta-title">
                                            Meta Title
                                        </Label>
                                        <Input
                                            id="blog-meta-title"
                                            name="meta_title"
                                            value={metaTitle}
                                            maxLength={255}
                                            onChange={(e) =>
                                                setMetaTitle(e.target.value)
                                            }
                                            placeholder="Custom page title for search engines"
                                        />
                                        <InputError
                                            message={errors.meta_title}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="blog-meta-description">
                                            Meta Description
                                        </Label>
                                        <Textarea
                                            id="blog-meta-description"
                                            name="meta_description"
                                            value={metaDescription}
                                            maxLength={500}
                                            rows={3}
                                            onChange={(e) =>
                                                setMetaDescription(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Custom meta description for search engines"
                                        />
                                        <InputError
                                            message={errors.meta_description}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="blog-meta-keywords">
                                            Meta Keywords
                                        </Label>
                                        <Input
                                            id="blog-meta-keywords"
                                            name="meta_keywords"
                                            value={metaKeywords}
                                            onChange={(e) =>
                                                setMetaKeywords(e.target.value)
                                            }
                                            placeholder="wedding, photography, etc."
                                        />
                                        <InputError
                                            message={errors.meta_keywords}
                                        />
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
                                    ) : blog?.featured_image_url &&
                                      !removeFeatured ? (
                                        <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
                                            <img
                                                src={
                                                    blog.featured_image_url ??
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
                                            const file =
                                                e.target.files?.[0] ?? null;

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
                                                {blog?.featured_image_url &&
                                                !removeFeatured &&
                                                !featuredFile
                                                    ? 'Replace Image'
                                                    : 'Upload Image'}
                                            </Button>

                                            {isEdit &&
                                                blog?.featured_image_url &&
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

                            <div className="flex justify-end gap-3 lg:col-span-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(index.url())}
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
                                        : 'Create Post'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
