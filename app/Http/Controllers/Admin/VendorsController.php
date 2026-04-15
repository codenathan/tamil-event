<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorsController extends Controller
{
    public function index(Request $request)
    {
        $vendors = Vendor::with(['category', 'city', 'country'])
            ->when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhereHas('category', fn($q) => $q->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('city', fn($q) => $q->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('country', fn($q) => $q->where('name', 'like', "%{$s}%"))
            )
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/vendors/index', [
            'vendors' => $vendors,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/vendors/form', [
            'vendor' => null,
            'categories' => Category::select('id', 'name')->get(),
            'cities' => City::with('country:id,name')->select('id', 'name', 'country_id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|unique:vendors,email',
            'category_id'     => 'required|exists:categories,id',
            'city_id'         => 'required|exists:cities,id',
            'description'     => 'nullable|string',
            'website'         => 'nullable|url',
            'phone'           => 'nullable|string|max:50',
            'featured_image'  => 'nullable|image|max:2048',
            'new_images'      => 'nullable|array',
            'new_images.*'    => 'image|max:2048',
        ]);

        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('vendors', 'public');
        }

        $vendor = Vendor::create($validated);

        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $index => $image) {
                $vendor->images()->create([
                    'path'       => $image->store('vendors/gallery', 'public'),
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()->route('admin.vendors.index')->with('success', 'Vendor created.');
    }

    public function edit(Vendor $vendor)
    {
        $vendor->load(['images','category', 'city.country']);
        return Inertia::render('admin/vendors/form', [
            'vendor' => $vendor,
            'categories' => Category::select('id', 'name')->get(),
            'cities' => City::with('country:id,name')->select('id', 'name', 'country_id')->get(),
        ]);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|unique:vendors,email,' . $vendor->id,
            'category_id'     => 'required|exists:categories,id',
            'city_id'         => 'required|exists:cities,id',
            'description'     => 'nullable|string',
            'website'         => 'nullable|url',
            'phone'           => 'nullable|string|max:50',
            'featured_image'  => 'nullable|image|max:2048',
            'new_images'      => 'nullable|array',
            'new_images.*'    => 'image|max:2048',
        ]);

        if ($request->hasFile('featured_image')) {
            // Optionally delete the old file:
            // Storage::disk('public')->delete($vendor->featured_image);
            $validated['featured_image'] = $request->file('featured_image')->store('vendors', 'public');
        } else {
            unset($validated['featured_image']); // don't overwrite with null
        }

        $vendor->update($validated);

        if ($request->hasFile('new_images')) {
            $nextOrder = $vendor->images()->max('sort_order') + 1;

            foreach ($request->file('new_images') as $index => $image) {
                $vendor->images()->create([
                    'path'       => $image->store('vendors/gallery', 'public'),
                    'sort_order' => $nextOrder + $index,
                ]);
            }
        }

        return redirect()->route('admin.vendors.index')->with('success', 'Vendor updated.');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return redirect()->back()->with('success', 'Vendor removed.');
    }
}
