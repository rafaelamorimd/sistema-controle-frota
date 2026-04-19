<?php

/**
 * Uso: php scripts/verificar-storage.php
 * Testa o disco "public" (local ou Supabase S3 conforme .env).
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

$disk = Storage::disk('public');
$driver = config('filesystems.disks.public.driver');

echo "driver={$driver}\n";

$strPath = 'verificacao/teste-'.uniqid('', true).'.txt';
$strConteudo = 'gefther-verificacao '.date('c');

try {
    $disk->put($strPath, $strConteudo);
} catch (Throwable $e) {
    echo "ERRO ao gravar: ".$e->getMessage()."\n";
    exit(1);
}

$bolExiste = $disk->exists($strPath);
$strUrl = $disk->url($strPath);

echo "path={$strPath}\n";
echo "exists=".($bolExiste ? 'yes' : 'no')."\n";
echo "url={$strUrl}\n";

$disk->delete($strPath);
echo "removido (ficheiro de teste apagado)\n";

exit(0);
