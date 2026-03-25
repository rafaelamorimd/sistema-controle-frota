<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vistorias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos');
            $table->foreignId('veiculo_id')->constrained('veiculos');
            $table->string('tipo');
            $table->date('data_vistoria');
            $table->integer('km_momento');
            $table->string('nivel_combustivel')->nullable();
            $table->text('observacoes')->nullable();
            $table->string('status')->default('RASCUNHO');
            $table->timestamps();
        });

        Schema::create('vistoria_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vistoria_id')->constrained('vistorias')->cascadeOnDelete();
            $table->string('item_verificado');
            $table->string('estado');
            $table->text('observacao')->nullable();
            $table->timestamps();
        });

        Schema::create('vistoria_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vistoria_id')->constrained('vistorias')->cascadeOnDelete();
            $table->foreignId('vistoria_item_id')->nullable()->constrained('vistoria_itens')->nullOnDelete();
            $table->string('caminho_arquivo');
            $table->string('descricao')->nullable();
            $table->timestamp('uploaded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vistoria_fotos');
        Schema::dropIfExists('vistoria_itens');
        Schema::dropIfExists('vistorias');
    }
};
