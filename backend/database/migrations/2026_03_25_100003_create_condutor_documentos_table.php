<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('condutor_documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condutor_id')->constrained('condutores')->cascadeOnDelete();
            $table->string('tipo_documento');
            $table->string('caminho_arquivo');
            $table->timestamp('uploaded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condutor_documentos');
    }
};
