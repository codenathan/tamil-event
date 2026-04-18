<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateVendorListingRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final class UpdateVendorListingController extends Controller
{
    public function __invoke(UpdateVendorListingRequest $request): RedirectResponse
    {
        $vendor = $request->user()->vendor;
        abort_if($vendor === null, 404);

        $vendor->update($request->listingAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Listing updated.')]);

        return back();
    }
}
