<?php

namespace Database\Seeders;

use App\Support\RevisaoCategoriasPadrao;
use Illuminate\Database\Seeder;

class RevisaoCategoriasSeeder extends Seeder
{
    /**
     * Mesmos dados da migration seed_revisao_categorias_padrao (idempotente).
     * Executado em todos os ambientes via DatabaseSeeder, inclusive producao.
     */
    public function run(): void
    {
        RevisaoCategoriasPadrao::sincronizar();
    }
}
