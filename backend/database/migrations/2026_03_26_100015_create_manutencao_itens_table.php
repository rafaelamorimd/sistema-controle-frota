<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manutencao_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manutencao_id')->constrained('manutencoes')->cascadeOnDelete();
            $table->foreignId('peca_id')->nullable()->constrained('pecas')->nullOnDelete();
            $table->string('servico_realizado');
            $table->integer('quantidade')->default(1);
            $table->decimal('custo_unitario', 12, 2);
            $table->decimal('custo_total', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manutencao_itens');
    }
};
