<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveVendorRequest;
use App\Models\Category;
use App\Models\City;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $query = Vendor::active()->with(['category', 'city', 'country', 'media']);

        $this->applySearch($query, $request, [
            'columns' => ['name', 'email'],
            'relationships' => [
                'category' => ['name'],
                'city' => ['name'],
                'country' => ['name'],
            ],
        ]);

        $vendors = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/vendors/index', [
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'per_page']),
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

    public function store(SaveVendorRequest $request)
    {
        $vendor = Vendor::create($request->vendorAttributes());

        if ($request->hasFile('featured_image')) {
            $vendor->addMediaFromRequest('featured_image')->toMediaCollection('featured');
        }

        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images', []) as $image) {
                $vendor->addMedia($image)->toMediaCollection('gallery');
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Vendor created.')]);

        return to_route('admin.vendors.index');
    }

    public function edit(Vendor $vendor)
    {
        $vendor->load(['category', 'city.country', 'media']);

        return Inertia::render('admin/vendors/form', [
            'vendor' => $vendor,
            'categories' => Category::select('id', 'name')->get(),
            'cities' => City::with('country:id,name')->select('id', 'name', 'country_id')->get(),
        ]);
    }

    public function update(SaveVendorRequest $request, Vendor $vendor)
    {
        $vendor->update($request->vendorAttributes());

        foreach ($request->validated('delete_gallery_ids', []) as $mediaId) {
            $vendor->media()
                ->where('collection_name', 'gallery')
                ->whereKey((int) $mediaId)
                ->first()
                ?->delete();
        }

        if ($request->boolean('delete_featured')) {
            $vendor->clearMediaCollection('featured');
        }

        if ($request->hasFile('featured_image')) {
            $vendor->addMediaFromRequest('featured_image')->toMediaCollection('featured');
        }

        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images', []) as $image) {
                $vendor->addMedia($image)->toMediaCollection('gallery');
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Vendor updated.')]);

        return to_route('admin.vendors.index');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Vendor removed.')]);

        return to_route('admin.vendors.index');
    }
}
