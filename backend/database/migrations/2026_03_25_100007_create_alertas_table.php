<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertas', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_alerta');
            $table->string('entidade_tipo');
            $table->unsignedBigInteger('entidade_id');
            $table->text('mensagem');
            $table->string('prioridade')->default('MEDIA');
            $table->boolean('lido')->default(false);
            $table->boolean('resolvido')->default(false);
            $table->timestamp('resolvido_em')->nullable();
            $table->timestamps();

            $table->index(['resolvido', 'tipo_alerta']);
            $table->index(['entidade_tipo', 'entidade_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertas');
    }
};
