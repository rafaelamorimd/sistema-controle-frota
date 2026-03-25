<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('condutor_referencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condutor_id')->constrained('condutores')->cascadeOnDelete();
            $table->string('nome');
            $table->string('telefone');
            $table->string('grau_relacionamento')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condutor_referencias');
    }
};
