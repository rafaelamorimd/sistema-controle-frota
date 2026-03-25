<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('veiculos', function (Blueprint $table) {
            $table->id();
            $table->string('placa', 8)->unique();
            $table->string('modelo');
            $table->integer('ano');
            $table->string('renavam', 11)->unique();
            $table->string('chassi', 17)->nullable();
            $table->string('cor');
            $table->string('combustivel');
            $table->boolean('kit_gas')->default(false);
            $table->date('vencimento_gnv')->nullable();
            $table->integer('km_atual')->default(0);
            $table->integer('km_ultima_troca_oleo')->default(0);
            $table->string('status')->default('DISPONIVEL');
            $table->string('numero_rastreador')->nullable();
            $table->boolean('rastreador_ativo')->default(false);
            $table->decimal('valor_rastreador', 10, 2)->default(53.00);
            $table->date('vencimento_ipva')->nullable();
            $table->date('vencimento_seguro')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('veiculos');
    }
};
