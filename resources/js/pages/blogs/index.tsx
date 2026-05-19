import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Calendar, User } from 'lucide-react';
import type { Blog } from '@/types';

interface PaginatedBlogs {
    data: Blog[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    blogs: PaginatedBlogs;
    meta: {
        title: string;
        description: string;
        canonicalUrl: string;
    };
}

export default function BlogIndex({ blogs, meta }: Props) {
    return (
        <>
            <Head>
                <title>{meta.title}</title>
                <meta name="description" content={meta.description} />
                <link rel="canonical" href={meta.canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.description} />
                <meta property="og:url" content={meta.canonicalUrl} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={meta.title} />
                <meta name="twitter:description" content={meta.description} />
            </Head>

            <section className="border-b border-border bg-secondary/40 py-12">
                <div className="container text-center">
                    <h1 className="font-display text-3xl font-bold md:text-4xl">
                        Blog
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Insights, inspiration, and expert advice for planning
                        unforgettable Tamil events.
                    </p>
                </div>
            </section>

            <section className="container py-12">
                {blogs.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {blogs.data.map((blog) => (
                            <article
                                key={blog.id}
                                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                            >
                                <Link href={`/blogs/${blog.slug}`}>
                                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                                        {blog.featured_image_url ? (
                                            <img
                                                src={blog.featured_image_url}
                                                alt={blog.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground/30">
                                                <BookOpen className="h-12 w-12" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {blog.published_at
                                                ? new Date(
                                                      blog.published_at,
                                                  ).toLocaleDateString()
                                                : new Date(
                                                      blog.created_at,
                                                  ).toLocaleDateString()}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {blog.user?.name ?? 'Admin'}
                                        </span>
                                    </div>

                                    <h2 className="mb-2 font-display text-lg font-semibold leading-snug">
                                        <Link
                                            href={`/blogs/${blog.slug}`}
                                            className="transition-colors hover:text-primary"
                                        >
                                            {blog.title}
                                        </Link>
                                    </h2>

                                    {blog.excerpt && (
                                        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                                            {blog.excerpt}
                                        </p>
                                    )}

                                    <div className="mt-auto">
                                        <Link
                                            href={`/blogs/${blog.slug}`}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                                        >
                                            Read more
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center text-muted-foreground">
                        No blog posts yet. Check back soon!
                    </div>
                )}

                {/* Simple pagination */}
                {blogs.last_page > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        {blogs.links.map((link, i) => {
                            if (link.label === '...') {
                                return (
                                    <span
                                        key={i}
                                        className="px-3 py-2 text-sm text-muted-foreground"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const isPrev = link.label.includes('Previous');
                            const isNext = link.label.includes('Next');

                            if (isPrev || isNext) {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url ?? ''}
                                        preserveScroll
                                        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                            link.url
                                                ? 'border border-border bg-card text-foreground hover:bg-accent'
                                                : 'pointer-events-none bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {isPrev ? 'Previous' : 'Next'}
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url ?? ''}
                                    preserveScroll
                                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : link.url
                                              ? 'border border-border bg-card text-foreground hover:bg-accent'
                                              : 'pointer-events-none bg-muted text-muted-foreground'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}
