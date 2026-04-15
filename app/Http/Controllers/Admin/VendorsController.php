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
        dd($request->all());
        $vendor->update($request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'category_id' => 'required|exists:categories,id',
            'city_id' => 'required|exists:cities,id',
            'description' => 'nullable',
            'website' => 'nullable|url',
            'phone' => 'nullable',
        ]));
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return redirect()->back()->with('success', 'Vendor removed.');
    }
}
