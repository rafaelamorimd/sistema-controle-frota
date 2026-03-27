<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revisao_checklist_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('revisao_categoria_id')->constrained('revisao_categorias')->cascadeOnDelete();
            $table->string('chave', 120)->unique();
            $table->string('label', 255);
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revisao_checklist_itens');
    }
};
