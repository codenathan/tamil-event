<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\EnquireStatusEnum;
use App\Http\Requests\StoreEnquireRequest;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class EnquireController extends Controller
{
    public function store(StoreEnquireRequest $request, Vendor $vendor): RedirectResponse
    {
        abort_if(! $vendor->is_active, 404);

        $vendor->enquires()->create([
            ...$request->validated(),
            'status' => EnquireStatusEnum::PENDING,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Your enquiry has been sent.'),
        ]);

        return back();
    }
}
