<?php

namespace Database\Factories;

use App\Enums\ContactMessageEnum;
use App\Models\ContactMessage;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::query()->inRandomOrder()->value('id') ?? Vendor::factory(),
            'name' => fake()->name(),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'message' => fake()->paragraph(),
            'status' => ContactMessageEnum::PENDING->value,
        ];
    }
}
