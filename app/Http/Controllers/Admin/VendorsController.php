<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return redirect()->back()->with('success', 'Vendor removed.');
    }
}
