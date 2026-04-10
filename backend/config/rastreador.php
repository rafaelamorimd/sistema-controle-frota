<?php

return [
    'driver' => env('RASTREADOR_DRIVER', 'stub'),
    'api_url' => env('RASTREADOR_API_URL'),
    'api_key' => env('RASTREADOR_API_KEY'),
    'fulltrack' => [
        'base_url' => env('FULLTRACK_BASE_URL', 'https://ws.fulltrack2.com'),
        'api_key' => env('FULLTRACK_API_KEY'),
        'secret_key' => env('FULLTRACK_SECRET_KEY'),
    ],
];
