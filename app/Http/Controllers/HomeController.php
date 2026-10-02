<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('welcome', [
            'meta' => [
                'title' => 'Discover Tamil Event Services Worldwide',
                'description' => 'Find and book the best Tamil event service providers worldwide. Photographers, caterers, DJs, venues, makeup artists and more for weddings and cultural events.',
                'canonicalUrl' => route('home'),
            ],
            'logoUrl' => asset('apple-touch-icon.png'),
            'searchUrlTemplate' => route('search').'?q={search_term_string}',
        ]);
    }
}
