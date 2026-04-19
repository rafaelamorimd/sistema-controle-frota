<?php

namespace App\Models;

use App\Enums\StatusDespesa;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Despesa extends Model
{
    protected $fillable = [
        'veiculo_id', 'manutencao_id', 'descricao', 'categoria', 'valor', 'data_vencimento',
        'data_pagamento', 'status', 'caminho_comprovante', 'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusDespesa::class,
            'valor' => 'decimal:2',
            'data_vencimento' => 'date',
            'data_pagamento' => 'date',
        ];
    }

    public function veiculo(): BelongsTo
    {
        return $this->belongsTo(Veiculo::class);
    }

    public function manutencao(): BelongsTo
    {
        return $this->belongsTo(Manutencao::class);
    }
}
