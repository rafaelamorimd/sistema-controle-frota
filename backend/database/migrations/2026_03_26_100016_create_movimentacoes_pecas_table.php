<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimentacoes_pecas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peca_id')->constrained('pecas')->cascadeOnDelete();
            $table->string('tipo');
            $table->integer('quantidade');
            $table->foreignId('manutencao_id')->nullable()->constrained('manutencoes')->nullOnDelete();
            $table->foreignId('veiculo_id')->nullable()->constrained('veiculos')->nullOnDelete();
            $table->decimal('custo_unitario', 12, 2)->default(0);
            $table->text('observacao')->nullable();
            $table->timestamps();

            $table->index('peca_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimentacoes_pecas');
    }
};
