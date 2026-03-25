<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rastreador_eventos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->string('tipo_evento');
            $table->string('origem_evento');
            $table->string('status_comando');
            $table->text('detalhes')->nullable();
            $table->timestamps();

            $table->index(['veiculo_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rastreador_eventos');
    }
};
