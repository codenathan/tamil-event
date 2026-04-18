<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriesController extends Controller
{
    /**
     * this has not been labeled categories as it will clash with the inertia share
     *
     * @see HandleInertiaRequests
     */
    public function index()
    {
        return Inertia::render('admin/categories', [
            'categoriesRecords' => Category::latest()->paginate(5),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required'],
            'icon' => ['nullable'],
            'description' => ['nullable'],
        ]);

        Category::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category added.')]);

        return to_route('admin.categories.index');
    }

    public function update(Category $category, Request $request)
    {
        $data = $request->validate([
            'name' => ['required'],
            'icon' => ['nullable'],
            'description' => ['nullable'],
        ]);

        $category->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return to_route('admin.categories.index');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return to_route('admin.categories.index');
    }
}
