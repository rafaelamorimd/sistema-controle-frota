<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leituras_km', function (Blueprint $table) {
            $table->foreignId('pagamento_id')
                ->nullable()
                ->constrained('pagamentos')
                ->restrictOnDelete();
        });

        Schema::table('leituras_km', function (Blueprint $table) {
            $table->unique('pagamento_id');
        });
    }

    public function down(): void
    {
        Schema::table('leituras_km', function (Blueprint $table) {
            $table->dropUnique(['pagamento_id']);
            $table->dropForeign(['pagamento_id']);
            $table->dropColumn('pagamento_id');
        });
    }
};
