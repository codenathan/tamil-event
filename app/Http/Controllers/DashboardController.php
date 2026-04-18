<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Enquire;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->hasRole('admin')) {
            return to_route('admin.dashboard');
        }

        $vendor = $request->user()->vendor;

        if ($vendor !== null) {
            $vendor->load(['category', 'city.country', 'media']);
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        if ($vendor === null) {
            $enquiries = new LengthAwarePaginator(
                [],
                0,
                $perPage,
                1,
                [
                    'path' => $request->url(),
                    'pageName' => 'page',
                ]
            );
        } else {
            $query = Enquire::query()
                ->where('vendor_id', $vendor->id)
                ->latest();
            $this->applySearch($query, $request, [
                'columns' => ['name', 'email', 'message'],
            ]);
            $enquiries = $query->paginate($perPage)->withQueryString();
        }

        return Inertia::render('dashboard', [
            'vendor' => $vendor,
            'enquiries' => $enquiries,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }
}
