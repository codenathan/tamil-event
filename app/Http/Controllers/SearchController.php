<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->string('q')->trim()->value();

        $vendors = Vendor::active()
            ->with(['category', 'city', 'country', 'media'])
            ->when($query, function ($q) use ($query) {
                return $q->where('name', 'like', "%{$query}%");
            })
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('search', [
            'vendors' => $vendors,
            'filters' => [
                'q' => $query,
            ],
        ]);
    }

    public function show(Vendor $vendor): Response
    {
        abort_if(! $vendor->is_active, 404);

        $vendor->load(['category', 'city', 'country', 'media']);

        return Inertia::render('vendors/show', [
            'vendor' => $vendor,
        ]);
    }
}
