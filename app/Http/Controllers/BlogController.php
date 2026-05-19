<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $blogs = Blog::published()
            ->with('user')
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('blogs/index', [
            'blogs' => $blogs,
            'meta' => [
                'title' => 'Blog — TamilEventPlanner',
                'description' => 'Read the latest articles, tips, and inspiration for Tamil events and weddings.',
                'canonicalUrl' => $request->fullUrl(),
            ],
        ]);
    }

    public function show(Blog $blog): Response
    {
        abort_if($blog->status->value !== 'published', 404);

        $blog->load('user');

        $featured = $blog->featured_image_url;
        $ogImageUrl = null;

        if (is_string($featured) && $featured !== '') {
            $ogImageUrl = str_starts_with($featured, 'http://') || str_starts_with($featured, 'https://')
                ? $featured
                : url($featured);
        }

        return Inertia::render('blogs/show', [
            'blog' => $blog,
            'meta' => [
                'title' => $blog->meta_title ?: $blog->title,
                'description' => $blog->meta_description ?: (is_string($blog->excerpt) ? $blog->excerpt : ''),
            ],
            'ogImageUrl' => $ogImageUrl,
            'canonicalUrl' => route('blogs.show', $blog),
        ]);
    }
}
