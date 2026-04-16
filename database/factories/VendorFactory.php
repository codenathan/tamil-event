<?php

namespace Database\Factories;

use App\Enums\VendorStatusEnum;
use App\Models\Category;
use App\Models\City;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->company();

        $city = City::with('country')->inRandomOrder()->first();

        return [
            'user_id'          => null,
            'category_id'      => Category::inRandomOrder()->first()?->id,
            'city_id'          => $city?->id,
            'country_id'       => $city?->country_id,
            'name'             => $name,
            'slug'             => Str::slug($name),
            'description'      => $this->faker->paragraph(),
            'phone'            => $this->faker->phoneNumber(),
            'email'            => $this->faker->unique()->safeEmail(),
            'website'          => $this->faker->optional()->url(),
            'social_instagram' => $this->faker->optional()->userName(),
            'social_facebook'  => $this->faker->optional()->userName(),
            'featured_image'   => null,
            'is_active'        => true,
            'status'           => VendorStatusEnum::APPROVED->value,
        ];
    }
}
