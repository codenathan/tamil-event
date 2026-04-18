<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\City;
use App\Models\Country;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreListYourBusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'businessName' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'exists:categories,slug'],
            'country' => ['required', 'string', 'exists:countries,name'],
            'city' => ['required', 'string'],
            'description' => ['required', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:vendors,email'],
            'website' => ['nullable', 'string', 'max:255'],
            'instagram' => ['nullable', 'string', 'max:100'],
            'facebook' => ['nullable', 'string', 'max:100'],
            'services' => ['nullable', 'array', 'max:20'],
            'services.*' => ['string', 'max:80'],
            'featuredImage' => ['nullable', 'image', 'max:5120'],
            'images' => ['nullable', 'array', 'max:6'],
            'images.*' => ['image', 'max:5120'],
            'agreeTerms' => ['accepted'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('website') && $this->input('website') === '') {
            $merge['website'] = null;
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $countryName = $this->input('country');
            $cityName = $this->input('city');
            if (! is_string($countryName) || ! is_string($cityName) || $countryName === '' || $cityName === '') {
                return;
            }

            $country = Country::where('name', $countryName)->first();
            if (! $country) {
                return;
            }

            $exists = City::where('country_id', $country->id)
                ->where('name', $cityName)
                ->exists();

            if (! $exists) {
                $validator->errors()->add('city', __('The selected city is invalid for this country.'));
            }
        });
    }
}
