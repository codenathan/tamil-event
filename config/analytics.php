<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Google Analytics 4 (gtag.js)
    |--------------------------------------------------------------------------
    |
    | Set GOOGLE_ANALYTICS_MEASUREMENT_ID to your GA4 measurement ID (G-XXXXXXXX).
    | By default, the ID is only shared with the frontend in the production
    | environment. Set GOOGLE_ANALYTICS_ENABLED=true to enable in other envs.
    |
    */

    'google_analytics_measurement_id' => env('GOOGLE_ANALYTICS_MEASUREMENT_ID'),

    'google_analytics_enabled' => env('GOOGLE_ANALYTICS_ENABLED', false),

];
