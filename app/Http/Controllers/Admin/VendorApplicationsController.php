<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\VendorStatusEnum;
use App\Events\VendorApproved;
use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorApplicationsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $query = Vendor::query()
            ->where('is_active', false)
            ->latest()
            ->with([
                'category',
                'city',
                'country',
                'user:id,name',
            ]);

        $this->applySearch($query, $request, [
            'columns' => ['name', 'email'],
            'relationships' => [
                'category' => ['name'],
                'city' => ['name'],
                'country' => ['name'],
            ],
        ]);

        $vendors = $query->paginate($perPage)->withQueryString();

        return Inertia::render(
            'admin/vendor-applications',
            [
                'vendors' => $vendors,
                'filters' => $request->only(['search', 'per_page']),
            ]
        );
    }

    public function update(Vendor $vendor, Request $request)
    {

        if ($request->status === VendorStatusEnum::APPROVED->value) {
            $vendor->update([
                'is_active' => true,
                'status' => VendorStatusEnum::APPROVED->value,
            ]);

            event(new VendorApproved($vendor));

            return back()->with('success', 'Vendor approved');
        }

        $vendor->update([
            'is_active' => false,
            'status' => VendorStatusEnum::REJECTED->value,
        ]);

        return back()->with('success', 'Vendor rejected');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return back()->with('success', 'Application deleted');
    }
}
