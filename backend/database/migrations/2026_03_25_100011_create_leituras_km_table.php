<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leituras_km', function (Blueprint $table) {
            $table->id();
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->foreignId('contrato_id')->nullable()->constrained('contratos');
            $table->foreignId('condutor_id')->nullable()->constrained('condutores');
            $table->unsignedInteger('km');
            $table->string('caminho_foto');
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['veiculo_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leituras_km');
    }
};
