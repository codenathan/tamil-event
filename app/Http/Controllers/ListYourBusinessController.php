<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\VendorStatusEnum;
use App\Http\Requests\StoreListYourBusinessRequest;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ListYourBusinessController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('list-your-business');
    }

    public function store(StoreListYourBusinessRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $category = Category::query()->where('slug', $data['category'])->firstOrFail();
        $country = Country::query()->where('name', $data['country'])->firstOrFail();
        $city = City::query()
            ->where('country_id', $country->id)
            ->where('name', $data['city'])
            ->firstOrFail();

        $vendor = Vendor::query()->create([
            'category_id' => $category->id,
            'city_id' => $city->id,
            'country_id' => $country->id,
            'name' => $data['businessName'],
            'description' => $data['description'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'website' => $data['website'] ?: null,
            'social_instagram' => $data['instagram'] ?: null,
            'social_facebook' => $data['facebook'] ?: null,
            'services' => $data['services'] ?? [],
            'is_active' => false,
            'status' => VendorStatusEnum::PENDING,
        ]);

        if ($request->hasFile('featuredImage')) {
            $vendor->addMediaFromRequest('featuredImage')->toMediaCollection('featured');
        }

        foreach ($request->file('images', []) as $file) {
            if ($file !== null) {
                $vendor->addMedia($file)->toMediaCollection('gallery');
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks! Your listing has been submitted for review.')]);

        return to_route('list-your-business');
    }
}
