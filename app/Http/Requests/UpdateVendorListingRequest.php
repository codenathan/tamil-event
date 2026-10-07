<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Vendor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVendorListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->vendor !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $vendorId = $this->user()->vendor->id;

        $vendor = $this->user()->vendor;

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'services' => ['nullable', 'array', 'max:20'],
            'services.*' => ['string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', Rule::unique('vendors', 'email')->ignore($vendorId)],
            'website' => ['nullable', 'string', 'max:255'],
            'social_instagram' => ['nullable', 'string', 'max:255'],
            'social_facebook' => ['nullable', 'string', 'max:255'],
            'featured_image' => ['nullable', 'image', 'max:'.Vendor::MAX_IMAGE_KILOBYTES],
            'new_images' => ['nullable', 'array', 'max:'.Vendor::MAX_GALLERY_IMAGES],
            'new_images.*' => ['image', 'max:'.Vendor::MAX_IMAGE_KILOBYTES],
            'delete_featured' => ['sometimes', 'boolean'],
            'delete_gallery_ids' => ['nullable', 'array'],
            'delete_gallery_ids.*' => [
                'integer',
                Rule::exists('media', 'id')->where(
                    fn ($query) => $query
                        ->where('model_type', $vendor->getMorphClass())
                        ->where('model_id', $vendor->id)
                        ->where('collection_name', 'gallery'),
                ),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $newImages = $this->file('new_images', []);
            $newImageCount = is_array($newImages) ? count($newImages) : 1;

            if ($newImageCount === 0 || $validator->errors()->has('new_images')) {
                return;
            }

            $vendor = $this->user()->vendor;
            $existingImageCount = $vendor instanceof Vendor
                ? $vendor->galleryCountExcluding((array) $this->input('delete_gallery_ids', []))
                : 0;

            if ($existingImageCount + $newImageCount > Vendor::MAX_GALLERY_IMAGES) {
                $validator->errors()->add('new_images', __('A listing can have a maximum of :max gallery images.', [
                    'max' => Vendor::MAX_GALLERY_IMAGES,
                ]));
            }
        });
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('services') && is_string($this->input('services'))) {
            $services = collect(explode(',', $this->input('services')))
                ->map(fn (mixed $s): string => trim((string) $s))
                ->filter()
                ->unique()
                ->take(20)
                ->values()
                ->all();

            $this->merge(['services' => $services]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function listingAttributes(): array
    {
        $data = $this->validated();

        unset(
            $data['featured_image'],
            $data['new_images'],
            $data['delete_featured'],
            $data['delete_gallery_ids'],
        );

        $website = $data['website'] ?? null;
        if ($website === '') {
            $website = null;
        }

        $description = $data['description'] ?? null;
        if ($description === '') {
            $description = null;
        }

        $phone = $data['phone'] ?? null;
        if ($phone === '') {
            $phone = null;
        }

        $socialInstagram = $data['social_instagram'] ?? null;
        if ($socialInstagram === '') {
            $socialInstagram = null;
        }

        $socialFacebook = $data['social_facebook'] ?? null;
        if ($socialFacebook === '') {
            $socialFacebook = null;
        }

        return [
            'name' => $data['name'],
            'description' => $description,
            'services' => $data['services'] ?? [],
            'phone' => $phone,
            'email' => $data['email'],
            'website' => $website,
            'social_instagram' => $socialInstagram,
            'social_facebook' => $socialFacebook,
        ];
    }
}
