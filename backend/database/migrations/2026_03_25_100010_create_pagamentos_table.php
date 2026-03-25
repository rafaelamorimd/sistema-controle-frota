<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos');
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->foreignId('condutor_id')->constrained('condutores');
            $table->decimal('valor', 12, 2);
            $table->date('data_referencia');
            $table->string('status')->default('PENDENTE');
            $table->date('data_pagamento')->nullable();
            $table->string('caminho_comprovante')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('data_referencia');
            $table->index(['veiculo_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamentos');
    }
};
