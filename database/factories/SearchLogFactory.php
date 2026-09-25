<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SearchLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SearchLog>
 */
class SearchLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'query' => fake()->randomElement(['photographer', 'catering', 'mehndi', 'dj', 'decorations', 'saree draping']),
            'category' => null,
            'city' => null,
            'country' => null,
            'results_count' => fake()->numberBetween(1, 30),
            'source' => fake()->randomElement([SearchLog::SOURCE_HOME, SearchLog::SOURCE_SEARCH]),
        ];
    }

    public function zeroResults(): static
    {
        return $this->state(fn (): array => ['results_count' => 0]);
    }
}
