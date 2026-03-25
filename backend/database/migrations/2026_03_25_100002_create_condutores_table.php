<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('condutores', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('cpf', 11)->unique();
            $table->string('telefone');
            $table->string('email')->nullable();
            $table->text('endereco');
            $table->string('numero_cnh');
            $table->string('categoria_cnh', 5);
            $table->date('vencimento_cnh');
            $table->string('status')->default('ATIVO');
            $table->text('observacoes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condutores');
    }
};
