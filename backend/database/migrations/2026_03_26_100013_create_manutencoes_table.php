<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manutencoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->string('tipo');
            $table->text('descricao');
            $table->date('data_entrada');
            $table->date('data_saida')->nullable();
            $table->integer('km_entrada');
            $table->decimal('custo_total', 12, 2)->default(0);
            $table->string('local')->nullable();
            $table->string('status')->default('EM_ANDAMENTO');
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['veiculo_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manutencoes');
    }
};
