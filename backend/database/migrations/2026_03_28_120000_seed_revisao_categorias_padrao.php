<?php

use App\Support\RevisaoCategoriasPadrao;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Garante categorias/itens padrao em producao (php artisan migrate), sem depender de db:seed.
     */
    public function up(): void
    {
        RevisaoCategoriasPadrao::sincronizar();
    }

    public function down(): void
    {
        // Dados de referencia: nao remove linhas (podem existir checklists vinculados).
    }
};
