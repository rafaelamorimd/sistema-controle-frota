<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('despesas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->string('descricao');
            $table->string('categoria')->nullable();
            $table->decimal('valor', 12, 2);
            $table->date('data_vencimento')->nullable();
            $table->date('data_pagamento')->nullable();
            $table->string('status')->default('PENDENTE');
            $table->string('caminho_comprovante')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index(['veiculo_id', 'status']);
            $table->index('data_pagamento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('despesas');
    }
};
