<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
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

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'services' => ['nullable', 'array', 'max:20'],
            'services.*' => ['string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', Rule::unique('vendors', 'email')->ignore($vendorId)],
            'website' => ['nullable', 'string', 'max:255'],
        ];
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

        return [
            'name' => $data['name'],
            'description' => $description,
            'services' => $data['services'] ?? [],
            'phone' => $phone,
            'email' => $data['email'],
            'website' => $website,
        ];
    }
}
