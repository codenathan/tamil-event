<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\City;
use App\Models\Vendor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveVendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $emailRule = Rule::unique('vendors', 'email');
        $vendor = $this->route('vendor');
        if ($vendor instanceof Vendor) {
            $emailRule->ignore($vendor->id);
        }

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', $emailRule],
            'category_id' => ['required', 'exists:categories,id'],
            'city_id' => ['required', 'exists:cities,id'],
            'description' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'string', 'max:255'],
            'social_instagram' => ['nullable', 'string', 'max:255'],
            'social_facebook' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'services' => ['nullable', 'array', 'max:20'],
            'services.*' => ['string', 'max:80'],
            'featured_image' => ['nullable', 'image', 'max:2048'],
            'new_images' => ['nullable', 'array'],
            'new_images.*' => ['image', 'max:2048'],
        ];

        if ($vendor instanceof Vendor) {
            $rules['delete_featured'] = ['sometimes', 'boolean'];
            $rules['delete_gallery_ids'] = ['nullable', 'array'];
            $rules['delete_gallery_ids.*'] = [
                'integer',
                Rule::exists('media', 'id')->where(
                    fn ($query) => $query
                        ->where('model_type', $vendor->getMorphClass())
                        ->where('model_id', $vendor->id)
                        ->where('collection_name', 'gallery'),
                ),
            ];
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('website') && $this->input('website') === '') {
            $merge['website'] = null;
        }

        if ($this->has('social_instagram') && $this->input('social_instagram') === '') {
            $merge['social_instagram'] = null;
        }

        if ($this->has('social_facebook') && $this->input('social_facebook') === '') {
            $merge['social_facebook'] = null;
        }

        if ($this->has('seo_title') && $this->input('seo_title') === '') {
            $merge['seo_title'] = null;
        }

        if ($this->has('seo_description') && $this->input('seo_description') === '') {
            $merge['seo_description'] = null;
        }

        if ($this->has('services') && is_array($this->input('services'))) {
            $merge['services'] = collect($this->input('services'))
                ->map(fn (mixed $s): string => trim((string) $s))
                ->filter()
                ->unique()
                ->take(20)
                ->values()
                ->all();
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /**
     * Attributes safe for {@see Vendor::create()} / {@see Vendor::update()} (no uploaded file keys).
     *
     * @return array<string, mixed>
     */
    public function vendorAttributes(): array
    {
        $data = $this->validated();
        unset(
            $data['featured_image'],
            $data['new_images'],
            $data['delete_featured'],
            $data['delete_gallery_ids'],
        );

        $data['country_id'] = City::findOrFail($data['city_id'])->country_id;
        $data['services'] = $this->normalizedServices($data['services'] ?? null);
        if (array_key_exists('website', $data)) {
            $data['website'] = $data['website'] !== null && $data['website'] !== ''
                ? $data['website']
                : null;
        }

        if (array_key_exists('social_instagram', $data)) {
            $data['social_instagram'] = $data['social_instagram'] !== null
                && $data['social_instagram'] !== ''
                ? $data['social_instagram']
                : null;
        }

        if (array_key_exists('social_facebook', $data)) {
            $data['social_facebook'] = $data['social_facebook'] !== null
                && $data['social_facebook'] !== ''
                ? $data['social_facebook']
                : null;
        }

        if (array_key_exists('seo_title', $data)) {
            $data['seo_title'] = $data['seo_title'] !== null && $data['seo_title'] !== ''
                ? $data['seo_title']
                : null;
        }

        if (array_key_exists('seo_description', $data)) {
            $data['seo_description'] = $data['seo_description'] !== null && $data['seo_description'] !== ''
                ? $data['seo_description']
                : null;
        }

        return $data;
    }

    /**
     * @param  array<int, string>|null  $services
     * @return array<int, string>
     */
    private function normalizedServices(?array $services): array
    {
        if ($services === null) {
            return [];
        }

        return collect($services)
            ->map(fn (mixed $s): string => trim((string) $s))
            ->filter()
            ->unique()
            ->take(20)
            ->values()
            ->all();
    }
}
