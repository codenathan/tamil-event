<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\EnquireStatusEnum;
use App\Http\Requests\StoreEnquireRequest;
use App\Models\Vendor;
use App\Notifications\VendorNewEnquiryNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class EnquireController extends Controller
{
    public function store(StoreEnquireRequest $request, Vendor $vendor): RedirectResponse
    {
        abort_if(! $vendor->is_active, 404);

        $enquire = $vendor->enquires()->create([
            ...$request->validated(),
            'status' => EnquireStatusEnum::PENDING,
        ]);

        $vendor->loadMissing('user');

        $recipient = $vendor->email ?? $vendor->user?->email;

        if (filled($recipient)) {
            Notification::route('mail', $recipient)
                ->notify(new VendorNewEnquiryNotification($enquire));
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Your enquiry has been sent.'),
        ]);

        return back();
    }
}

