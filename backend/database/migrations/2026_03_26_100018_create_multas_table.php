<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('multas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->foreignId('condutor_id')->nullable()->constrained('condutores')->nullOnDelete();
            $table->foreignId('contrato_id')->nullable()->constrained('contratos')->nullOnDelete();
            $table->string('auto_infracao')->nullable();
            $table->dateTime('data_infracao');
            $table->text('descricao');
            $table->decimal('valor', 12, 2);
            $table->date('data_vencimento');
            $table->string('status')->default('PENDENTE');
            $table->boolean('indicada_condutor')->default(false);
            $table->string('caminho_comprovante')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['veiculo_id', 'data_infracao']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('multas');
    }
};
