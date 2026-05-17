<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\SitemapBuilder;
use Symfony\Component\HttpFoundation\Response;

final class SitemapController extends Controller
{
    public function __invoke(SitemapBuilder $sitemapBuilder): Response
    {
        return $sitemapBuilder->build()->toResponse(request());
    }
}
