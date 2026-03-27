<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_revisao_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_revisao_id')->constrained('checklist_revisoes')->cascadeOnDelete();
            $table->string('caminho_arquivo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_revisao_fotos');
    }
};
