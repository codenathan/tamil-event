<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GoogleAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_home_shares_analytics_with_path_enabled_and_no_measurement_id_in_testing_by_default(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('analytics', fn (Assert $a) => $a
                    ->where('enabled', true)
                    ->where('measurementId', null),
                ),
            );
    }

    public function test_measurement_id_is_shared_when_configured_for_non_production(): void
    {
        config([
            'analytics.google_analytics_measurement_id' => 'G-TESTMEASURE',
            'analytics.google_analytics_enabled' => true,
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('analytics.measurementId', 'G-TESTMEASURE'),
            );
    }

    public function test_dashboard_path_disables_analytics_flag(): void
    {
        config([
            'analytics.google_analytics_measurement_id' => 'G-TESTMEASURE',
            'analytics.google_analytics_enabled' => true,
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('analytics.enabled', false)
                ->where('analytics.measurementId', 'G-TESTMEASURE'),
            );
    }
}
