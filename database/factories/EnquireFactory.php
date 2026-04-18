<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\EnquireStatusEnum;
use App\Models\Enquire;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enquire>
 */
class EnquireFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => fake()->name(),
            'date' => fake()->dateTimeBetween('now', '+6 months'),
            'email' => fake()->unique()->safeEmail(),
            'message' => fake()->paragraph(),
            'status' => EnquireStatusEnum::PENDING,
        ];
    }
}
