<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\SearchLog;
use App\Models\User;
use App\Models\Vendor;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SearchLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_from_home_page_is_logged_with_result_count(): void
    {
        Vendor::factory()->create(['name' => 'Photo Pro', 'is_active' => true]);

        $this->withHeader('referer', url('/'))
            ->get(route('search', ['q' => 'Photo Pro']))
            ->assertOk();

        $this->assertDatabaseHas('search_logs', [
            'query' => 'Photo Pro',
            'results_count' => 1,
            'source' => SearchLog::SOURCE_HOME,
            'user_id' => null,
        ]);
    }

    public function test_search_from_browse_page_records_source_and_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withHeader('referer', url('/search?q=dj'))
            ->get(route('search', ['q' => 'catering']))
            ->assertOk();

        $this->assertDatabaseHas('search_logs', [
            'query' => 'catering',
            'source' => SearchLog::SOURCE_SEARCH,
            'user_id' => $user->id,
        ]);
    }

    public function test_search_with_no_matches_is_logged_with_zero_results(): void
    {
        $this->get(route('search', ['q' => 'underwater violinist']))->assertOk();

        $this->assertDatabaseHas('search_logs', [
            'query' => 'underwater violinist',
            'results_count' => 0,
            'source' => SearchLog::SOURCE_OTHER,
        ]);
    }

    public function test_filter_only_search_is_logged(): void
    {
        $this->get(route('search', ['category' => 'Catering', 'country' => 'Sri Lanka']))->assertOk();

        $this->assertDatabaseHas('search_logs', [
            'query' => null,
            'category' => 'Catering',
            'country' => 'Sri Lanka',
        ]);
    }

    public function test_bare_search_page_visit_is_not_logged(): void
    {
        $this->get(route('search'))->assertOk();

        $this->assertDatabaseCount('search_logs', 0);
    }

    public function test_paginating_results_is_not_logged_again(): void
    {
        $this->get(route('search', ['q' => 'dj', 'page' => 2]))->assertOk();

        $this->assertDatabaseCount('search_logs', 0);
    }

    public function test_crawler_searches_are_not_logged(): void
    {
        $this->withHeader('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
            ->get(route('search', ['q' => 'dj']))
            ->assertOk();

        $this->assertDatabaseCount('search_logs', 0);
    }

    public function test_repeating_the_same_search_within_a_minute_is_logged_once(): void
    {
        $this->get(route('search', ['q' => 'Mehndi']))->assertOk();
        $this->get(route('search', ['q' => 'mehndi']))->assertOk();

        $this->assertDatabaseCount('search_logs', 1);
    }

    public function test_repeating_a_search_after_the_window_is_logged_again(): void
    {
        $this->get(route('search', ['q' => 'mehndi']))->assertOk();

        $this->travel(2)->minutes();

        $this->get(route('search', ['q' => 'mehndi']))->assertOk();

        $this->assertDatabaseCount('search_logs', 2);
    }

    public function test_a_different_search_is_logged_even_within_the_window(): void
    {
        $this->get(route('search', ['q' => 'mehndi']))->assertOk();
        $this->get(route('search', ['q' => 'mehndi', 'city' => 'Colombo', 'country' => 'Sri Lanka']))->assertOk();
        $this->get(route('search', ['q' => 'mehndi']))->assertOk();

        $this->assertDatabaseCount('search_logs', 3);
    }

    public function test_a_different_session_is_not_deduplicated(): void
    {
        $this->get(route('search', ['q' => 'mehndi']))->assertOk();

        $this->flushSession();

        $this->get(route('search', ['q' => 'mehndi']))->assertOk();

        $this->assertDatabaseCount('search_logs', 2);
    }

    public function test_admin_can_view_search_history_and_insights(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        SearchLog::factory()->count(3)->create(['query' => 'Mehndi']);
        SearchLog::factory()->zeroResults()->count(2)->create(['query' => 'Ice sculptor']);
        SearchLog::factory()->create(['query' => 'old search', 'created_at' => now()->subDays(45)]);

        $this->actingAs($admin)
            ->get(route('admin.search-logs'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/search-logs')
                ->where('searchLogs.total', 6)
                ->where('totals.searches', 5)
                ->where('totals.zero_results', 2)
                ->where('topSearches.0.term', 'mehndi')
                ->where('topSearches.0.searches', 3)
                ->where('zeroResultSearches.0.query', 'ice sculptor')
                ->where('zeroResultSearches.0.searches', 2)
            );
    }

    public function test_non_admin_cannot_view_search_history(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->actingAs(User::factory()->create())
            ->get(route('admin.search-logs'))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_from_search_history(): void
    {
        $this->get(route('admin.search-logs'))->assertRedirect(route('login'));
    }
}
