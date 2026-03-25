<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anotacoes', function (Blueprint $table) {
            $table->id();
            $table->string('entidade_tipo');
            $table->unsignedBigInteger('entidade_id');
            $table->text('texto');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();

            $table->index(['entidade_tipo', 'entidade_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anotacoes');
    }
};
