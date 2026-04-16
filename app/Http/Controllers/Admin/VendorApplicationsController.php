<?php

namespace App\Http\Controllers\Admin;

use App\Enums\VendorStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorApplicationsController extends Controller
{
    public function index()
    {
        $vendors = Vendor::where('is_active', false)
            ->latest()
            ->with(['category', 'city', 'country'])
            ->paginate(10);

        return Inertia::render(
            'admin/vendor-applications',
            compact('vendors')
        );
    }

    public function update(Vendor $vendor, Request $request)
    {

        if ($request->status === VendorStatusEnum::APPROVED->value) {
            $vendor->update([
                'is_active' => true,
                'status' => VendorStatusEnum::APPROVED->value,
            ]);
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
