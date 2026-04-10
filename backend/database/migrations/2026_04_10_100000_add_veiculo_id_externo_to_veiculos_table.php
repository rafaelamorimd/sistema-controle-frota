<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
            $table->string('veiculo_id_externo', 64)->nullable()->unique()->after('numero_rastreador');
        });
    }

    public function down(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
            $table->dropUnique(['veiculo_id_externo']);
            $table->dropColumn('veiculo_id_externo');
        });
    }
};
