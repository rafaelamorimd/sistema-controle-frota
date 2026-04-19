<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leituras_km', function (Blueprint $table) {
            $table->date('data_referencia')->nullable();
            $table->date('data_leitura')->nullable();
        });

        Schema::table('manutencoes', function (Blueprint $table) {
            $table->decimal('valor_mao_obra', 12, 2)->default(0);
            $table->json('servicos_externos')->nullable();
        });

        Schema::table('despesas', function (Blueprint $table) {
            $table->foreignId('manutencao_id')->nullable()->unique()->constrained('manutencoes')->nullOnDelete();
        });

        $rows = DB::table('leituras_km')->orderBy('id')->get();
        foreach ($rows as $row) {
            $strDataLeitura = date('Y-m-d', strtotime((string) $row->created_at));
            $strRef = null;
            if ($row->contrato_id) {
                $strRef = DB::table('pagamentos')
                    ->where('contrato_id', $row->contrato_id)
                    ->whereDate('data_referencia', '<=', $strDataLeitura)
                    ->orderByDesc('data_referencia')
                    ->value('data_referencia');
                if ($strRef === null) {
                    $strRef = DB::table('contratos')->where('id', $row->contrato_id)->value('data_inicio');
                }
            }
            DB::table('leituras_km')->where('id', $row->id)->update([
                'data_leitura' => $strDataLeitura,
                'data_referencia' => $strRef,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('despesas', function (Blueprint $table) {
            $table->dropForeign(['manutencao_id']);
            $table->dropColumn('manutencao_id');
        });

        Schema::table('manutencoes', function (Blueprint $table) {
            $table->dropColumn(['valor_mao_obra', 'servicos_externos']);
        });

        Schema::table('leituras_km', function (Blueprint $table) {
            $table->dropColumn(['data_referencia', 'data_leitura']);
        });
    }
};
