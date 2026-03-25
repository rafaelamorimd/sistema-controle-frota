<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_contrato')->unique();
            $table->foreignId('condutor_id')->constrained('condutores');
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->decimal('valor_semanal', 10, 2);
            $table->tinyInteger('dia_pagamento');
            $table->decimal('caucao', 10, 2)->nullable();
            $table->string('status')->default('ATIVO');
            $table->integer('km_inicial');
            $table->integer('km_final')->nullable();
            $table->string('caminho_contrato_pdf')->nullable();
            $table->text('clausulas_adicionais')->nullable();
            $table->text('motivo_encerramento')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['veiculo_id', 'status']);
            $table->index(['condutor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
