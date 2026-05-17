<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateVendorListingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;

final class UpdateVendorListingController extends Controller
{
    public function __invoke(UpdateVendorListingRequest $request): RedirectResponse
    {
        $vendor = $request->user()->vendor;
        abort_if($vendor === null, 404);

        $vendor->update($request->listingAttributes());

        foreach ($request->validated('delete_gallery_ids', []) as $mediaId) {
            $vendor->media()
                ->where('collection_name', 'gallery')
                ->whereKey((int) $mediaId)
                ->first()
                ?->delete();
        }

        if ($request->boolean('delete_featured')) {
            $vendor->clearMediaCollection('featured');
        }

        if ($request->hasFile('featured_image')) {
            $vendor->addMediaFromRequest('featured_image')->toMediaCollection('featured');
        }

        foreach ($this->galleryUploads($request) as $image) {
            $vendor->addMedia($image)->toMediaCollection('gallery');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Listing updated.')]);

        return back();
    }

    /**
     * @return list<UploadedFile>
     */
    private function galleryUploads(UpdateVendorListingRequest $request): array
    {
        if (! $request->hasFile('new_images')) {
            return [];
        }

        $images = $request->file('new_images');

        if (! is_array($images)) {
            return [$images];
        }

        return array_values($images);
    }
}
