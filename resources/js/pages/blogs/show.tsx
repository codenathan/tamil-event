import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    User,
} from 'lucide-react';
import type { Blog } from '@/types';

interface Props {
    blog: Blog;
    meta: {
        title: string;
        description: string;
    };
    ogImageUrl: string | null;
    canonicalUrl: string;
}

export default function BlogShow({
    blog,
    meta,
    ogImageUrl,
    canonicalUrl,
}: Props) {
    const publishDate = blog.published_at
        ? new Date(blog.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : new Date(blog.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          });

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: blog.excerpt ?? blog.meta_description ?? undefined,
        image: ogImageUrl ?? undefined,
        datePublished: blog.published_at ?? blog.created_at,
        dateModified: blog.updated_at,
        author: {
            '@type': 'Person',
            name: blog.user?.name ?? 'TamilEventPlanner',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
    };

    return (
        <>
            <Head>
                <title>{meta.title}</title>
                <meta name="description" content={meta.description} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.description} />
                <meta property="og:url" content={canonicalUrl} />
                {ogImageUrl && (
                    <meta property="og:image" content={ogImageUrl} />
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={meta.title} />
                <meta
                    name="twitter:description"
                    content={meta.description}
                />
                {ogImageUrl && (
                    <meta name="twitter:image" content={ogImageUrl} />
                )}
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Head>

            <article className="container py-8">
                <Link
                    href="/blogs"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft size={16} /> Back to blog
                </Link>

                <div className="mx-auto max-w-3xl">
                    <header className="mb-8">
                        <h1 className="mb-4 font-display text-3xl font-bold leading-tight md:text-4xl">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {publishDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {blog.user?.name ?? 'TamilEventPlanner'}
                            </span>
                        </div>
                    </header>

                    {blog.featured_image_url && (
                        <div className="mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
                            <img
                                src={blog.featured_image_url}
                                alt={blog.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    {blog.excerpt && (
                        <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                            {blog.excerpt}
                        </p>
                    )}

                    <div
                        className="prose prose-neutral max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>
            </article>
        </>
    );
}
