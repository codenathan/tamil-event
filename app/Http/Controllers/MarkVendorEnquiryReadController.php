<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\EnquireStatusEnum;
use App\Models\Enquire;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class MarkVendorEnquiryReadController extends Controller
{
    public function __invoke(Request $request, Enquire $enquire): RedirectResponse
    {
        $vendor = $request->user()->vendor;
        abort_if($vendor === null, 403);
        abort_unless($enquire->vendor_id === $vendor->id, 403);

        $enquire->update(['status' => EnquireStatusEnum::READ->value]);

        return back();
    }
}
