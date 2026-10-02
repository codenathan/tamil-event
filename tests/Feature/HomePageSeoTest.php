<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomePageSeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_provides_canonical_and_seo_meta(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('meta.title', 'Discover Tamil Event Services Worldwide')
                ->where('meta.canonicalUrl', route('home'))
                ->has('meta.description')
            );
    }

    public function test_home_page_provides_structured_data_urls(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('logoUrl', asset('apple-touch-icon.png'))
                ->where('searchUrlTemplate', route('search').'?q={search_term_string}')
            );
    }

    public function test_search_url_template_query_is_handled_by_search_page(): void
    {
        $this->get(route('search', ['q' => 'photographer']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.q', 'photographer')
            );
    }
}
