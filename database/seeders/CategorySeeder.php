<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Décor', 'slug' => 'decor', 'icon' => 'Palette', 'description' => 'Beautiful event décor and styling'],
            ['name' => 'Photographer', 'slug' => 'photographer', 'icon' => 'Camera', 'description' => 'Professional photography services'],
            ['name' => 'Videographer', 'slug' => 'videographer', 'icon' => 'Video', 'description' => 'Cinematic videography'],
            ['name' => 'Makeup Artist', 'slug' => 'makeup-artist', 'icon' => 'Sparkles', 'description' => 'Bridal and event makeup'],
            ['name' => 'Catering', 'slug' => 'catering', 'icon' => 'UtensilsCrossed', 'description' => 'Authentic Tamil cuisine and catering'],
            ['name' => 'DJ', 'slug' => 'dj', 'icon' => 'Music', 'description' => 'DJs and music entertainment'],
            ['name' => 'Performers', 'slug' => 'performers', 'icon' => 'Mic2', 'description' => 'Live performers and artists'],
            ['name' => 'Photo Booth', 'slug' => 'photo-booth', 'icon' => 'ImagePlus', 'description' => 'Fun photo booth experiences'],
            ['name' => 'Venue', 'slug' => 'venue', 'icon' => 'Building2', 'description' => 'Event venues and halls'],
            ['name' => 'Event Planner', 'slug' => 'event-planner', 'icon' => 'ClipboardList', 'description' => 'Full-service event planning'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
