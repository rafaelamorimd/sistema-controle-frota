<?php

$strOrigens = env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:8000,http://localhost:3000');
$arrOrigens = array_values(array_filter(array_map('trim', explode(',', $strOrigens))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $arrOrigens,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    // Bearer token (sem cookie): evita exigir credenciais no CORS e reduz falhas de preflight em producao
    'supports_credentials' => false,
];
