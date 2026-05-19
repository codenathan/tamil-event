<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);

        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $query = Blog::with('user')->latest();

        $this->applySearch($query, $request, [
            'columns' => ['title', 'excerpt', 'content'],
            'relationships' => [
                'user' => ['name'],
            ],
        ]);

        $blogs = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/blogs/index', [
            'blogs' => $blogs,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/blogs/form', [
            'blog' => null,
        ]);
    }

    public function store(StoreBlogRequest $request)
    {
        $blog = Blog::create($request->blogAttributes());

        if ($request->hasFile('featured_image')) {
            $blog->addMediaFromRequest('featured_image')->toMediaCollection('featured');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Blog post created.')]);

        return to_route('admin.blogs.index');
    }

    public function edit(Blog $blog)
    {
        $blog->load('user', 'media');

        return Inertia::render('admin/blogs/form', [
            'blog' => $blog,
        ]);
    }

    public function update(UpdateBlogRequest $request, Blog $blog)
    {
        $blog->update($request->blogAttributes());

        if ($request->boolean('delete_featured')) {
            $blog->clearMediaCollection('featured');
        }

        if ($request->hasFile('featured_image')) {
            $blog->addMediaFromRequest('featured_image')->toMediaCollection('featured');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Blog post updated.')]);

        return to_route('admin.blogs.index');
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Blog post deleted.')]);

        return to_route('admin.blogs.index');
    }
}
