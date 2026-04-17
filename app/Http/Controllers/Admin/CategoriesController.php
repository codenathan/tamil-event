<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriesController extends Controller
{
    /**
     * this has not been labeled categories as it will clash with the inertia share
     * @see \App\Http\Middleware\HandleInertiaRequests
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

        return back()->with('success', 'Category added');
    }

    public function update(Category $category, Request $request)
    {
        $data = $request->validate([
            'name' => ['required'],
            'icon' => ['nullable'],
            'description' => ['nullable'],
        ]);

        $category->update($data);

        return back()->with('success', 'Category updated');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return back()->with('success', 'Category deleted');
    }
}
