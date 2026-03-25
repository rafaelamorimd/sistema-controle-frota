<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_revisoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->foreignId('manutencao_id')->nullable()->constrained('manutencoes')->nullOnDelete();
            $table->date('data_revisao');
            $table->integer('km_revisao');
            $table->json('itens_verificados');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_revisoes');
    }
};
