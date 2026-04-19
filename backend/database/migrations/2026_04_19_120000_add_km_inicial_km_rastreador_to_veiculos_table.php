<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
            // Sem after(): PostgreSQL nao suporta posicionamento de coluna como MySQL.
            $table->integer('km_inicial')->default(0);
            $table->unsignedInteger('km_rastreador')->nullable();
            $table->timestamp('dth_ultimo_km_rastreador')->nullable();
        });

        DB::table('veiculos')->update(['km_inicial' => DB::raw('km_atual')]);
    }

    public function down(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
            $table->dropColumn(['km_inicial', 'km_rastreador', 'dth_ultimo_km_rastreador']);
        });
    }
};
